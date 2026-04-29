# Tarot Migration Completion Plan

## Context

Migrating the Guia da Roda tarot app from Rust (Dioxus + SurrealDB + rig-core) to TypeScript (TanStack Start + PostgreSQL + Drizzle + DeepSeek). The schemas and type definitions are done; all server logic and UI remain.

## Architecture Decisions

| Decision                  | Choice                                          | Rationale                                            |
| ------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| Where to put server logic | TanStack Start server functions + package repos | Clean separation, matches existing package structure |
| Auth session storage      | HTTP-only cookies (same as Rust)                | Proven pattern, compatible with SSR                  |
| AI provider               | DeepSeek (same as Rust)                         | Already have API key, same behavior                  |
| DB connection             | Drizzle + postgres                              | Already in tarot-db deps                             |
| AbacatePay                | Direct HTTP client in payments-core             | Simple, matches Rust approach                        |

## Implementation Phases

### Phase 1: Foundation

- [x] Create .env file
- [ ] Set up DB connection utility in tarot-db
- [ ] Set up auth server functions in tarot-web
- [ ] Create base repository classes

### Phase 2: Auth Implementation

- [ ] Auth repository (users, magic links, sessions)
- [ ] Magic link token generation + hashing
- [ ] Resend email integration
- [ ] Session cookie management
- [ ] Server functions: request_magic_link, consume_magic_link, get_auth_status, complete_profile, logout

### Phase 3: Tarot Domain Implementation

- [ ] Tarot repository (sessions, readings, purchases)
- [ ] Daily card refresh logic
- [ ] Card draw logic
- [ ] Server functions: ensure_session, send_message, load_dashboard

### Phase 4: AI Agent

- [ ] DeepSeek client setup
- [ ] Tool definitions (SortearCarta, GerarPixCartaExtra, VerificarPixCartaExtra)
- [ ] Agent builder with system prompt
- [ ] Chat orchestrator with fallback

### Phase 5: Payments

- [ ] AbacatePay API client
- [ ] PIX QR code creation + status check
- [ ] Webhook handler
- [ ] Server functions: prepare_purchase, verify_purchase

### Phase 6: UI Implementation

- [ ] Root layout with navigation
- [ ] Home page (magic link login form)
- [ ] Auth callback page
- [ ] Profile page (complete profile form)
- [ ] Reading page (chat interface)
- [ ] Market page (PIX purchase flow)
- [ ] Wallet page (balance + history)
- [ ] CSS styles (migrate from Rust)

## Key Files to Create/Modify

### New Files

- `apps/tarot-web/src/lib/db.ts` - DB connection
- `apps/tarot-web/src/lib/auth.ts` - Auth server functions
- `apps/tarot-web/src/lib/tarot.ts` - Tarot server functions
- `apps/tarot-web/src/lib/agent.ts` - AI agent
- `apps/tarot-web/src/lib/abacatepay.ts` - Payments
- `apps/tarot-web/src/lib/time.ts` - Time utilities
- `apps/tarot-web/src/components/ChatInput.tsx`
- `apps/tarot-web/src/components/ChatMessage.tsx`
- `apps/tarot-web/src/components/Navigation.tsx`
- `apps/tarot-web/src/styles/*.module.css`

### Modified Files

- All route files in `apps/tarot-web/src/routes/`
- `apps/tarot-web/package.json` (add missing deps)

## Test Priority

1. Auth flow: magic link creation, consumption, session validation
2. Tarot session: creation, daily reset, card draw
3. Payments: PIX creation, status check, crediting
4. Reading flow: message send, AI response, tool execution

## Validation Plan

- `pnpm typecheck` - all packages
- `pnpm test` - tarot-core tests
- Manual smoke test of auth flow
- Manual smoke test of reading flow
