/**
 * Payments server functions for Guia da Roda.
 * AbacatePay PIX integration.
 */

import process from "node:process";
import { createServerFn } from "@tanstack/react-start";
import { pixPayments, readingSessions } from "@webdrops/tarot-db";
import { and, desc, eq } from "drizzle-orm";
import { requireAuthenticatedUser } from "./auth";
import { getDb } from "./db.server";

const ABACATEPAY_BASE_URL = "https://api.abacatepay.com/v2";
const EXTRA_CARD_PRICE_CENTS = 500;
const EXTRA_CARD_QUANTITY = 1;

type PaymentStatus = "pending" | "paid" | "expired" | "cancelled" | "refunded";

interface AbacatePayConfig {
  apiKey: string;
  pixExpiresInSeconds: number;
}

function getAbacatePayConfig(): AbacatePayConfig {
  const apiKey = process.env.ABACATEPAY_API_KEY;
  if (!apiKey) throw new Error("ABACATEPAY_API_KEY must be set");

  return {
    apiKey,
    pixExpiresInSeconds: parseInt(
      process.env.ABACATEPAY_PIX_EXPIRES_IN_SECONDS ?? "1800",
      10,
    ),
  };
}

interface PixQrCodeData {
  id: string;
  amount: number;
  status: string;
  brCode: string;
  brCodeBase64: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PixStatusData {
  status: string;
  expiresAt?: string;
}

async function createPixQrCode(
  config: AbacatePayConfig,
  userId: string,
): Promise<PixQrCodeData> {
  const response = await fetch(`${ABACATEPAY_BASE_URL}/transparents/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "PIX",
      data: {
        amount: EXTRA_CARD_PRICE_CENTS,
        expiresIn: config.pixExpiresInSeconds,
        description: "Guia da Roda extra",
        metadata: {
          userId,
          purpose: "guia_da_roda_extra_card",
          cardQuantity: EXTRA_CARD_QUANTITY,
        },
      },
    }),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to create transparent PIX checkout with AbacatePay (${response.status}): ${body}`,
    );
  }

  const parsed = JSON.parse(body);
  if (!parsed.data) {
    throw new Error(
      `AbacatePay returned no data for create transparent PIX checkout: ${JSON.stringify(parsed.error ?? "unknown error")}`,
    );
  }

  return {
    id: parsed.data.id,
    amount: parsed.data.amount,
    status: parsed.data.status,
    brCode: parsed.data.brCode,
    brCodeBase64: parsed.data.brCodeBase64,
    expiresAt: parsed.data.expiresAt,
    createdAt: parsed.data.createdAt,
    updatedAt: parsed.data.updatedAt,
  };
}

async function checkPixQrCodeStatus(
  config: AbacatePayConfig,
  pixId: string,
): Promise<PixStatusData> {
  const response = await fetch(
    `${ABACATEPAY_BASE_URL}/transparents/check?id=${pixId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
    },
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Failed to check transparent PIX checkout status with AbacatePay (${response.status}): ${body}`,
    );
  }

  const parsed = JSON.parse(body);
  if (!parsed.data) {
    throw new Error(
      `AbacatePay returned no data for check transparent PIX checkout status: ${JSON.stringify(parsed.error ?? "unknown error")}`,
    );
  }

  return {
    status: parsed.data.status,
    expiresAt: parsed.data.expiresAt,
  };
}

function normalizePurchaseStatus(status: string): PaymentStatus {
  const normalized = status.trim().toUpperCase();
  switch (normalized) {
    case "PAID":
    case "APPROVED":
    case "REDEEMED":
      return "paid";
    case "EXPIRED":
      return "expired";
    case "CANCELLED":
      return "cancelled";
    case "REFUNDED":
    case "UNDER_DISPUTE":
      return "refunded";
    default:
      return "pending";
  }
}

async function getOrCreateSession(userId: string) {
  const db = getDb();

  const existing = await db
    .select()
    .from(readingSessions)
    .where(eq(readingSessions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const now = new Date();
  const inserted = await db
    .insert(readingSessions)
    .values({
      userId,
      lastResetAt: now,
    })
    .returning();

  return inserted[0];
}

export const prepareExtraCardPurchase = createServerFn({
  method: "POST",
}).handler(async () => {
  const authUser = await requireAuthenticatedUser();
  if (!authUser.displayName) {
    throw new Error("Complete o seu perfil antes de comprar cartas extras");
  }

  const db = getDb();
  const session = await getOrCreateSession(authUser.id);

  // If already has extra cards
  if (session.purchasedCardsAvailable > 0) {
    return {
      status: "carta_extra_ja_disponivel",
      purchase: null,
      purchasedCardsAvailable: session.purchasedCardsAvailable,
      pendingPaymentCount: 0,
    };
  }

  // Check for existing pending purchase
  const pendingPurchases = await db
    .select()
    .from(pixPayments)
    .where(
      and(
        eq(pixPayments.userId, authUser.id),
        eq(pixPayments.status, "pending"),
      ),
    )
    .orderBy(desc(pixPayments.createdAt))
    .limit(1);

  if (pendingPurchases.length > 0) {
    const purchase = pendingPurchases[0];
    return {
      status: "pix_pendente_existente",
      purchase: {
        pixId: purchase.externalPaymentId,
        amountCents: purchase.amountCents,
        cardQuantity: purchase.itemQuantity,
        status: purchase.status,
        brCode: purchase.pixCode,
        brCodeBase64: purchase.qrCodeBase64,
        expiresAt: purchase.expiresAt?.toISOString() ?? "",
        createdAt: purchase.createdAt?.toISOString() ?? "",
        updatedAt: purchase.updatedAt?.toISOString() ?? "",
      },
      purchasedCardsAvailable: session.purchasedCardsAvailable,
      pendingPaymentCount: pendingPurchases.length,
    };
  }

  // Create new PIX
  const config = getAbacatePayConfig();
  const qrCode = await createPixQrCode(config, authUser.id);
  const now = new Date();

  await db.insert(pixPayments).values({
    userId: authUser.id,
    gateway: "abacatepay",
    externalPaymentId: qrCode.id,
    amountCents: qrCode.amount,
    itemQuantity: EXTRA_CARD_QUANTITY,
    status: normalizePurchaseStatus(qrCode.status),
    pixCode: qrCode.brCode,
    qrCodeBase64: qrCode.brCodeBase64,
    expiresAt: qrCode.expiresAt ? new Date(qrCode.expiresAt) : now,
  });

  const pendingCount = await db
    .select()
    .from(pixPayments)
    .where(
      and(
        eq(pixPayments.userId, authUser.id),
        eq(pixPayments.status, "pending"),
      ),
    );

  return {
    status: "pix_gerado",
    purchase: {
      pixId: qrCode.id,
      amountCents: qrCode.amount,
      cardQuantity: EXTRA_CARD_QUANTITY,
      status: normalizePurchaseStatus(qrCode.status),
      brCode: qrCode.brCode,
      brCodeBase64: qrCode.brCodeBase64,
      expiresAt: qrCode.expiresAt ?? "",
      createdAt: qrCode.createdAt ?? now.toISOString(),
      updatedAt: qrCode.updatedAt ?? now.toISOString(),
    },
    purchasedCardsAvailable: session.purchasedCardsAvailable,
    pendingPaymentCount: pendingCount.length,
  };
});

export const verifyExtraCardPurchase = createServerFn({
  method: "POST",
}).handler(async () => {
  const authUser = await requireAuthenticatedUser();
  if (!authUser.displayName) {
    throw new Error("Complete o seu perfil antes de verificar pagamentos");
  }

  const db = getDb();

  // Get latest pending purchase
  const pendingPurchases = await db
    .select()
    .from(pixPayments)
    .where(
      and(
        eq(pixPayments.userId, authUser.id),
        eq(pixPayments.status, "pending"),
      ),
    )
    .orderBy(desc(pixPayments.createdAt))
    .limit(1);

  if (pendingPurchases.length === 0) {
    const session = await getOrCreateSession(authUser.id);
    return {
      status: "sem_pagamento_registrado",
      creditedNow: false,
      purchase: null,
      purchasedCardsAvailable: session.purchasedCardsAvailable,
      pendingPaymentCount: 0,
    };
  }

  const purchase = pendingPurchases[0];

  // Check status with AbacatePay
  try {
    const config = getAbacatePayConfig();
    const remoteStatus = await checkPixQrCodeStatus(
      config,
      purchase.externalPaymentId,
    );
    const normalizedStatus = normalizePurchaseStatus(remoteStatus.status);
    const now = new Date();

    // Update local status
    await db
      .update(pixPayments)
      .set({
        status: normalizedStatus,
        expiresAt: remoteStatus.expiresAt
          ? new Date(remoteStatus.expiresAt)
          : purchase.expiresAt,
        paidAt: normalizedStatus === "paid" ? now : purchase.paidAt,
        updatedAt: now,
      })
      .where(eq(pixPayments.id, purchase.id));

    // If paid, credit the card
    let creditedNow = false;
    if (normalizedStatus === "paid" && !purchase.creditedAt) {
      await db
        .update(pixPayments)
        .set({ creditedAt: now, updatedAt: now })
        .where(eq(pixPayments.id, purchase.id));

      const session = await getOrCreateSession(authUser.id);
      await db
        .update(readingSessions)
        .set({
          purchasedCardsAvailable:
            session.purchasedCardsAvailable + purchase.itemQuantity,
          updatedAt: now,
        })
        .where(eq(readingSessions.userId, authUser.id));

      creditedNow = true;
    }

    const session = await getOrCreateSession(authUser.id);
    const pendingCount = await db
      .select()
      .from(pixPayments)
      .where(
        and(
          eq(pixPayments.userId, authUser.id),
          eq(pixPayments.status, "pending"),
        ),
      );

    let statusLabel: string;
    if (normalizedStatus === "paid" && creditedNow) {
      statusLabel = "pago_creditado_agora";
    } else if (normalizedStatus === "paid") {
      statusLabel = "pago_creditado";
    } else {
      statusLabel = `pagamento_${normalizedStatus}`;
    }

    return {
      status: statusLabel,
      creditedNow,
      purchase: {
        pixId: purchase.externalPaymentId,
        amountCents: purchase.amountCents,
        cardQuantity: purchase.itemQuantity,
        status: normalizedStatus,
        brCode: purchase.pixCode,
        brCodeBase64: purchase.qrCodeBase64,
        expiresAt: purchase.expiresAt?.toISOString() ?? "",
        createdAt: purchase.createdAt?.toISOString() ?? "",
        updatedAt: now.toISOString(),
      },
      purchasedCardsAvailable: session.purchasedCardsAvailable,
      pendingPaymentCount: pendingCount.length,
    };
  } catch {
    // If AbacatePay check fails, return current local state
    const session = await getOrCreateSession(authUser.id);
    return {
      status: "pagamento_pendente",
      creditedNow: false,
      purchase: {
        pixId: purchase.externalPaymentId,
        amountCents: purchase.amountCents,
        cardQuantity: purchase.itemQuantity,
        status: purchase.status,
        brCode: purchase.pixCode,
        brCodeBase64: purchase.qrCodeBase64,
        expiresAt: purchase.expiresAt?.toISOString() ?? "",
        createdAt: purchase.createdAt?.toISOString() ?? "",
        updatedAt: purchase.updatedAt?.toISOString() ?? "",
      },
      purchasedCardsAvailable: session.purchasedCardsAvailable,
      pendingPaymentCount: 1,
    };
  }
});
