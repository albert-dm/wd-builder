/**
 * Server-only module for AbacatePay webhook handling.
 * This file uses Node.js crypto APIs and should never be imported by client code.
 */

import { createHmac } from "node:crypto";
import process from "node:process";
import {
  paymentWebhooks,
  pixPayments,
  readingSessions,
} from "@webdrops/tarot-db";
import { eq } from "drizzle-orm";
import { getDb } from "./db.server";

const DEFAULT_ABACATEPAY_WEBHOOK_PUBLIC_KEY =
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

export interface AbacateWebhookEvent {
  event: string;
  apiVersion?: number;
  data: {
    payment?: { amount?: number };
    pixQrCode?: { id: string; status: string; amount?: number };
    transparent?: {
      id: string;
      status: string;
      amount?: number;
      paidAmount?: number;
    };
  };
}

function isPaidLikeStatus(status: string): boolean {
  return ["PAID", "APPROVED", "REDEEMED"].includes(status.trim().toUpperCase());
}

export function verifyWebhookSignature(
  signature: string | null,
  body: string,
): boolean {
  const publicKey =
    process.env.ABACATEPAY_WEBHOOK_PUBLIC_KEY ??
    DEFAULT_ABACATEPAY_WEBHOOK_PUBLIC_KEY;

  if (!signature) return false;

  const hmac = createHmac("sha256", publicKey);
  hmac.update(body);
  const expectedSignature = hmac.digest("base64");

  // Use TextEncoder for timing-safe comparison (works in browser and Node.js)
  const encoder = new TextEncoder();
  const sigBytes = encoder.encode(signature);
  const expectedBytes = encoder.encode(expectedSignature);

  if (sigBytes.length !== expectedBytes.length) return false;

  // Timing-safe comparison
  let result = 0;
  for (let i = 0; i < sigBytes.length; i++) {
    result |= sigBytes[i] ^ expectedBytes[i];
  }
  return result === 0;
}

export async function creditCardPurchase(
  externalPaymentId: string,
): Promise<void> {
  const db = getDb();
  const now = new Date();

  const payments = await db
    .select()
    .from(pixPayments)
    .where(eq(pixPayments.externalPaymentId, externalPaymentId))
    .limit(1);

  if (payments.length === 0) {
    throw new Error(`Payment not found: ${externalPaymentId}`);
  }

  const payment = payments[0];
  if (payment.creditedAt) {
    console.log(`Payment ${externalPaymentId} already credited`);
    return;
  }

  await db
    .update(pixPayments)
    .set({ status: "paid", paidAt: now, creditedAt: now, updatedAt: now })
    .where(eq(pixPayments.id, payment.id));

  const sessions = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.userId, payment.userId))
    .limit(1);

  if (sessions.length > 0) {
    await db
      .update(readingSessions)
      .set({
        purchasedCardsAvailable:
          sessions[0].purchasedCardsAvailable + payment.itemQuantity,
        updatedAt: now,
      })
      .where(eq(readingSessions.id, sessions[0].id));
  }

  console.log(
    `Credited ${payment.itemQuantity} card(s) to user ${payment.userId}`,
  );
}

async function processWebhookEvent(event: AbacateWebhookEvent): Promise<void> {
  switch (event.event) {
    case "transparent.completed": {
      const transparent = event.data.transparent;
      if (!transparent) throw new Error("Missing transparent data");
      if (!isPaidLikeStatus(transparent.status)) {
        throw new Error(`Unexpected status: ${transparent.status}`);
      }
      await creditCardPurchase(transparent.id);
      break;
    }

    case "billing.paid": {
      const pixQrCode = event.data.pixQrCode;
      if (!pixQrCode) throw new Error("Missing pixQrCode data");
      if (!isPaidLikeStatus(pixQrCode.status)) {
        throw new Error(`Unexpected status: ${pixQrCode.status}`);
      }
      await creditCardPurchase(pixQrCode.id);
      break;
    }

    default:
      console.log(`Ignoring unsupported webhook event: ${event.event}`);
  }
}

export async function storeAndProcessWebhook(
  data: Record<string, unknown>,
): Promise<{ status: string; message?: string }> {
  const db = getDb();
  const webhookId = crypto.randomUUID();

  await db.insert(paymentWebhooks).values({
    id: webhookId,
    gateway: "abacatepay",
    externalEventId: data?.id as string,
    payload: data,
    processed: false,
  });

  try {
    await processWebhookEvent(data as unknown as AbacateWebhookEvent);

    await db
      .update(paymentWebhooks)
      .set({ processed: true, processedAt: new Date() })
      .where(eq(paymentWebhooks.id, webhookId));

    return { status: "ok" };
  } catch (error) {
    console.error("Webhook processing error:", error);
    return { status: "error", message: (error as Error).message };
  }
}
