/**
 * AbacatePay Webhook Route
 * Receives payment webhook notifications from AbacatePay.
 */

import process from "node:process";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import {
  storeAndProcessWebhook,
  verifyWebhookSignature,
} from "../../../lib/webhooks.server";

/**
 * Server function to handle AbacatePay webhooks.
 * Called via POST request with webhook data in body.
 */
export const handleAbacatePayWebhook = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const request = getRequest();

    // Verify webhook secret
    const url = new URL(request.url);
    const webhookSecret =
      url.searchParams.get("webhookSecret") ??
      request.headers.get("x-webhook-secret");

    const expectedSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;
    if (expectedSecret && webhookSecret !== expectedSecret) {
      setResponseHeader("X-Webhook-Status", "rejected");
      return { status: "error", message: "Invalid webhook secret" };
    }

    // Verify signature if present
    const signature = request.headers.get("x-webhook-signature");
    const bodyStr = JSON.stringify(data);

    if (signature && !verifyWebhookSignature(signature, bodyStr)) {
      setResponseHeader("X-Webhook-Status", "rejected");
      return { status: "error", message: "Invalid webhook signature" };
    }

    // Process the webhook
    const result = await storeAndProcessWebhook(
      data as Record<string, unknown>,
    );

    if (result.status === "ok") {
      setResponseHeader("X-Webhook-Status", "processed");
    } else {
      // Return ok status to prevent retries on processing errors
      setResponseHeader("X-Webhook-Status", "error");
    }

    return result;
  });
