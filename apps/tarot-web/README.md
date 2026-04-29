# Tarot Web (Guia da Roda)

A tarot reading web application built with TanStack Start, featuring AI-powered chat with streaming responses.

## Development

```bash
# From the monorepo root
pnpm dev  # Starts the playground which includes tarot-web
```

## API Documentation

See [docs/API.md](./docs/API.md) for endpoint documentation, including:

- Tarot streaming chat endpoint
- Webhook simulation for testing payments
- Production webhook handler

## Quick Testing

To simulate a payment during development:

1. Find your pending payment ID in the database
2. Call the simulation endpoint:

```javascript
fetch("/api/webhooks/simulate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data: { externalPaymentId: "pix_char_YOUR_ID" },
  }),
});
```

## Architecture

- `src/routes/` - TanStack Router pages
- `src/routes/api/` - Server functions and API endpoints
- `src/lib/` - Business logic and server helpers
- `src/components/` - Shared UI components
