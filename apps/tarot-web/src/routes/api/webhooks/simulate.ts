/**
 * Webhook Simulation Endpoint
 *
 * Used for testing payment flow without actual AbacatePay integration.
 * This bypasses signature verification and directly calls creditCardPurchase().
 *
 * @警告 WARNING: NOT for production use. This endpoint should be restricted
 * or removed in production environments.
 *
 * @example
 * // Browser console (while logged in)
 * fetch('/api/webhooks/simulate', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ data: { externalPaymentId: 'pix_char_xxx' } })
 * })
 *
 * @see docs/API.md for full documentation
 */

import { createServerFn } from "@tanstack/react-start";
import { creditCardPurchase } from "../../../lib/webhooks.server";

const simulatePaymentWebhook = createServerFn({ method: "POST" })
  .inputValidator((data: { externalPaymentId: string }) => data)
  .handler(async ({ data }) => {
    const { externalPaymentId } = data;

    if (!externalPaymentId) {
      throw new Error("externalPaymentId is required");
    }

    console.log(`[SIMULATE] Processing payment: ${externalPaymentId}`);

    try {
      await creditCardPurchase(externalPaymentId);
      return {
        status: "ok",
        message: `Payment ${externalPaymentId} simulated successfully`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`[SIMULATE] Error: ${errorMessage}`);
      throw new Error(`Simulation failed: ${errorMessage}`);
    }
  });
