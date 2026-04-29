# Tarot Web API Documentation

## Overview

This document describes the API endpoints available in the tarot-web application.

## Endpoints

### Tarot Streaming Chat

**Endpoint:** `POST /api/tarot/stream`

Streams AI responses for the tarot chat using server-sent events.

**Request:**

```typescript
{
  data: {
    message: string;
  }
}
```

**Response:** Streaming text response

**Usage:** Use the `streamTarotMessage` server function from `lib/tarot.ts`:

```typescript
import { streamTarotMessage } from "../lib/tarot";

const result = await streamTarotMessage({
  data: { message: "Quero uma leitura" },
});
```

---

### Webhook Simulation (Development Only)

**Endpoint:** `POST /api/webhooks/simulate`

Simulates an AbacatePay payment webhook for testing purposes. This endpoint bypasses signature verification and directly marks a payment as paid.

> ⚠️ **WARNING:** This endpoint is for development/testing only. It should NOT be exposed in production.

**Request:**

```typescript
{
  data: {
    externalPaymentId: string;
  }
}
```

**Response:**

```typescript
{
  status: "ok",
  message: "Payment pix_char_xxx simulated successfully"
}
```

**What it does:**

1. Marks the payment as `paid` in the `pixPayments` table
2. Sets `paidAt` and `creditedAt` timestamps
3. Increments `purchasedCardsAvailable` in the user's `readingSessions`

**Usage from browser console (while logged in):**

```javascript
fetch("/api/webhooks/simulate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data: { externalPaymentId: "pix_char_YOUR_PAYMENT_ID" },
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**Usage with curl:**

```bash
curl -X POST http://localhost:3010/api/webhooks/simulate \
  -H "Content-Type: application/json" \
  -d '{"data":{"externalPaymentId":"pix_char_YOUR_PAYMENT_ID"}}'
```

---

### AbacatePay Webhook (Production)

**Endpoint:** `POST /api/webhooks/abacatepay`

Receives real payment notifications from AbacatePay. Requires signature verification.

**Headers:**

- `x-webhook-signature`: HMAC signature for verification
- `x-webhook-secret` or `?webhookSecret=`: Optional secret verification

**Supported Events:**

- `transparent.completed`: Transparent checkout completed
- `billing.paid`: PIX payment confirmed

---

## Finding Your Payment ID

To find pending payments for testing:

```sql
-- Connect to the database
docker exec -it tarot_postgres psql -U postgres -d webdrops_tarot

-- Find pending payments
SELECT id, user_id, external_payment_id, status, item_quantity
FROM pix_payments
WHERE status = 'pending'
ORDER BY created_at DESC;
```

## Testing Flow

1. Generate a PIX payment via the chat (ask AI to "gerar um pix")
2. Note the `external_payment_id` from the database
3. Simulate the payment using the `/api/webhooks/simulate` endpoint
4. Verify in chat by asking AI to "verificar meu pagamento" or "revelar uma carta"

## Related Files

- `src/routes/api/webhooks/simulate.ts` - Simulation endpoint
- `src/routes/api/webhooks/-abacatepay.ts` - Real webhook handler
- `src/lib/webhooks.server.ts` - Webhook processing logic (`creditCardPurchase`)
