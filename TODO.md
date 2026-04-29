# TODO

Use this file as the working checklist for non-trivial tasks.
Keep it updated during Research -> Plan -> Execute.

## Active - Tarot Migration Completion

### Phase 1: Foundation ✅

- [x] Create .env file
- [x] Set up DB connection utility in tarot-web
- [x] Set up time utilities (Sao Paulo timezone)
- [x] Install dependencies (drizzle-orm, postgres)

### Phase 2: Auth Implementation ✅

- [x] Auth server functions (magic links, sessions)
- [x] Magic link token generation + SHA-256 hashing
- [x] Resend email integration (with dev-log fallback)
- [x] Session cookie management (HTTP-only, SameSite Lax)
- [x] Server functions: request_magic_link, consume_magic_link, get_auth_status, complete_profile, logout

### Phase 3: Tarot Domain Implementation ✅

- [x] Tarot server functions (sessions, readings)
- [x] Daily card refresh logic (midnight Sao Paulo reset)
- [x] Card draw logic (daily free + purchased extras)
- [x] Server functions: ensure_session, send_message, load_dashboard

### Phase 4: AI Agent ✅

- [x] DeepSeek client module with tool calling
- [x] Tool definitions (SortearCarta, GerarPixCartaExtra, VerificarPixCartaExtra)
- [x] Chat orchestrator with fallback
- [x] Full AI integration with tool execution
- [x] Tool handlers wired to tarot/payments functions

### Phase 5: Payments ✅

- [x] AbacatePay API client
- [x] PIX QR code creation + status check
- [x] Server functions: prepare_purchase, verify_purchase
- [x] Webhook handler with signature verification

### Phase 6: UI Implementation ✅

- [x] Root layout with navigation
- [x] Home page (magic link login form)
- [x] Auth callback page
- [x] Profile page (complete profile form)
- [x] Reading page (chat interface)
- [x] Market page (PIX purchase flow)
- [x] Wallet page (balance + history)
- [x] CSS styles

### Validation

- [x] `pnpm typecheck` passes
- [x] `pnpm test` (tarot-core) passes
- [ ] Minor Biome lint warnings (button types, ARIA)

## Completed - All Core Features ✅

The migration from Rust to TypeScript is now complete with:

- Full auth flow (magic links, sessions, cookies)
- AI agent with DeepSeek integration and tool calling
- AbacatePay PIX payments with webhook handling
- Complete UI for all user flows

## Next Steps

- [ ] Test the full auth flow with a real email
- [ ] Run database migrations
- [ ] Add card image assets
- [ ] Deploy to production

## Next ideas

- [ ] Add app-specific harness files when new apps or services are created
- [ ] Add a Hono API app with OpenAPI/Swagger when tarot needs a public or mobile-facing API
- [ ] Consider a pi extension later if we want automated guards or custom commands
- [ ] Add pgvector and search-driven memory features after parity is reached

## Done

- [x] Bootstrap pi harness for this monorepo
- [x] Migrate Copilot guidance into `AGENTS.md`
- [x] Add project-local skills for workflow, fullstack features, backend services, and UI component authoring
- [x] Add project-local prompt templates for planning, feature work, service work, review, and verification
- [x] Establish pi-native project guidance alongside `.github/copilot-instructions.md`
- [x] Port tarot-core package (schemas, deck, reading session)
- [x] Define Drizzle schema for all tables
- [x] Define Zod schemas for auth, payments, AI
- [x] Scaffold tarot-web routes
- [x] Implement auth server functions
- [x] Implement tarot server functions
- [x] Implement payments server functions
- [x] Implement AI agent module
- [x] Create all UI components (Navigation, ChatInput, ChatMessage)
- [x] Create all page routes (Home, Auth, Profile, Reading, Market, Wallet)
- [x] Create CSS styles
- [x] Wire up full AI agent with DeepSeek tool calling
- [x] Implement AbacatePay webhook handler
