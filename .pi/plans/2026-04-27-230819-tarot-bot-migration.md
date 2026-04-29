# Tarot Bot Migration from rust-dioxus to Webdrops TS Monorepo

## Problem Statement

Migrate the tarot bot product currently implemented in `/home/albert-dm/code/webdrops/rust-dioxus` into this TypeScript monorepo, replacing the Dioxus/Rust stack with the monorepo's preferred fullstack architecture and stack. The migration should preserve current product behavior, improve development speed, adopt PostgreSQL, and set up a cleaner foundation for future features, APIs, and multiple apps.

## Verified Research Findings

### Source product shape

The current source implementation is centered around these Rust crates:

- `tarot_bot` — shared tarot domain and deck loading
- `tarot_bot_web` — Dioxus fullstack web app, SurrealDB persistence, tarot agent, payments, UI
- `api` — shared magic-link auth, sessions, cookies, email delivery
- `chat_orchestrator` — shared rig/deepseek chat helpers

### Current tarot product behavior

Verified from source docs and code:

- Product name: **Guia da Roda**
- Main UX: chat-based tarot guide in Brazilian Portuguese
- Current supported reading mode: **single card**
- Each user gets **one free card per day**, reset by São Paulo date
- Additional same-day cards can be purchased via PIX
- Card revelation must happen through a tool call, not be invented in text
- Current app has:
  - magic-link auth
  - profile completion for display name
  - reading view/chat
  - wallet/market/payment flows
  - persisted chat history
  - payment verification

### Current domain and data model

Verified from Rust source:

- Deck source of truth comes from `tarot_bot/resource/sortearCarta-flowise-tool.json`
- Tarot deck preserves rich metadata:
  - card slug/name/arcana/suit
  - keywords
  - reversed keywords
  - visual description
  - detailed description
- SurrealDB schema currently includes:
  - `consultant`
  - `daily_reading`
  - `extra_reading`
  - `card_purchase`
- Shared auth schema includes:
  - `auth_user`
  - `auth_magic_link_token`
  - `auth_session`

### Current AI/runtime implementation

Verified from Rust source:

- AI stack currently uses `rig-core` with DeepSeek provider helpers
- Agent preamble encodes strict tarot rules and payment behavior
- Tools currently include:
  - `SortearCarta`
  - `GerarPixCartaExtra`
  - `VerificarPixCartaExtra`

### Current target repo shape

Verified from this repo:

- Existing packages:
  - `packages/wd-builder`
  - `packages/wd-ui`
- Existing app:
  - `apps/playground`
- This repo already defines preferred future architecture around:
  - feature/use-case organization
  - clean architecture
  - TanStack Start stack for fullstack apps
  - Hono + Drizzle + OpenAPI for services
  - Zod everywhere
  - CSS Modules
  - TDD workflow

## Assumptions To Validate Later

- Whether we want tarot-specific auth immediately, or a more generic auth package that tarot consumes
- Which payments provider should replace or preserve AbacatePay integration
- Whether mobile/API consumers are expected in the first migration release or only later
- Whether we want embeddings and semantic memory in phase 1 or phase 2

## Migration Goals

- Preserve current product behavior first
- Improve development speed and maintainability with TypeScript stack
- Move persistence to PostgreSQL
- Replace rig with a TS-native AI framework
- Create clean package boundaries for domain, data, AI orchestration, and app delivery
- Leave room for future APIs, mobile apps, analytics, and richer memory features

## Major Architecture Options

### Option A — Single TanStack Start app with server functions only

| Pros                                | Cons                                                          |
| ----------------------------------- | ------------------------------------------------------------- |
| Fastest migration path              | Harder to expose shared API surface later                     |
| Fewer moving parts initially        | OpenAPI/Swagger story is weaker for internal server functions |
| Fits SSR + client-heavy + BFF needs | Can accumulate app-local business logic if not disciplined    |

### Option B — TanStack Start app + shared core/data packages + optional Hono service later

| Pros                                             | Cons                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Best balance of speed and long-term architecture | Requires discipline to keep boundaries clean before service exists |
| Uses preferred app stack now                     | Some future API extraction work still remains                      |
| Keeps business logic outside app layer           | Slightly more upfront package design                               |

### Option C — TanStack Start app + Hono API service from day one

| Pros                                   | Cons                                         |
| -------------------------------------- | -------------------------------------------- |
| Strongest explicit delivery boundaries | Highest initial complexity                   |
| Great for future mobile/API consumers  | Slower migration of an already large product |
| OpenAPI/Swagger available immediately  | More deployment/runtime coordination         |

## AI Framework Options

### Option 1 — TanStack AI

| Pros                                                 | Cons                                             |
| ---------------------------------------------------- | ------------------------------------------------ |
| Fits the preferred TanStack ecosystem                | Newer ecosystem than Vercel AI SDK               |
| Good TanStack Start integration and SSE streaming    | Smaller adoption footprint                       |
| Type-safe tool definitions and server route examples | Fewer battle-tested examples for some edge cases |

### Option 2 — Vercel AI SDK

| Pros                                    | Cons                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| Very mature TS AI toolkit               | Less aligned with the TanStack ecosystem preference     |
| Excellent streaming/tool-call support   | Slightly more neutral than stack-opinionated            |
| Strong provider support and UI patterns | Another major abstraction layer outside TanStack family |

### Option 3 — Direct provider SDK (OpenAI/Anthropic/etc.)

| Pros                   | Cons                                                 |
| ---------------------- | ---------------------------------------------------- |
| Lowest abstraction     | More custom orchestration code                       |
| Maximum control        | Provider lock-in or duplicated adapter work          |
| Simple for tiny scopes | Poor fit for a tool-driven chat product of this size |

## Recommended Architecture

Choose **Option B** for app/backend shape and **Option 1** for AI, while keeping the AI boundary abstract enough that Vercel AI SDK could replace it later if needed.

### Why

- TanStack Start is the right fit for the main app: SSR entry routes, client-heavy chat UX, and BFF-style orchestration.
- The migration is already large; introducing a Hono service immediately would slow first delivery.
- Core domain, use cases, schemas, and repositories should live in packages so a Hono service can be added later without redoing business logic.
- TanStack AI aligns with the chosen app stack and has direct TanStack Start examples for streaming chat routes and tools.

## Recommended Target Structure

```text
apps/
  tarot-web/                # TanStack Start app
packages/
  tarot-core/               # domain entities, schemas, use cases, tarot deck/catalog
  tarot-db/                 # Drizzle schema, migrations, repositories, pg utilities
  tarot-ai/                 # prompt building, tool definitions, orchestration ports/adapters
  auth-core/                # shared auth contracts and use cases
  payments-core/            # PIX/payment contracts and use cases
  tarot-ui/                 # optional app/domain-specific shared UI if it grows
```

Possible later addition:

```text
apps/
  tarot-api/                # Hono service with OpenAPI/Swagger, when external API is needed
```

## Recommended Migration Phases

### Phase 0 — Foundation decisions

- Confirm product scope for phase 1 parity
- Add project-local Node version file if desired, targeting **Node 24 LTS**, not Node 25 current
- Scaffold app/package structure
- Set up shared TypeScript, Drizzle, Vitest, and app conventions

### Phase 1 — Domain port

- Port tarot deck/catalog from Flowise export into TS domain package
- Port shared entities and schemas:
  - card
  - reading session
  - reading source/spread
  - chat message types
- Add unit tests for domain behavior and deck loading

### Phase 2 — PostgreSQL design

- Model auth, readings, purchases, and chat history in Postgres using Drizzle
- Design migration strategy from Surreal-style records to relational tables
- Add repository interfaces and tests

### Phase 3 — Auth and user lifecycle

- Implement magic-link auth in TS stack
- Add profile completion and session ownership
- Keep auth generic enough to be reused by later apps

### Phase 4 — Tarot use cases

- Daily free reading entitlement
- Extra card purchase lifecycle
- Payment verification
- Reading session loading
- Persisted chat history and tool events

### Phase 5 — AI orchestration

- Replace rig/DeepSeek orchestration with TanStack AI adapters and tools
- Preserve mandatory behavioral rules from the Rust preamble
- Implement streaming chat route and tool execution
- Add test coverage for tool-based invariants

### Phase 6 — App UI

- Build TanStack Start routes for:
  - home/login
  - auth callback
  - profile completion
  - reading/chat
  - wallet
  - market
- Use CSS Modules and minimal global CSS
- Reuse `wd-ui` only where it makes sense; do not force shared components if tarot UX needs distinct styling

### Phase 7 — Enhanced Postgres capabilities

After parity, consider:

- `pgvector` for semantic memory on messages/reflections/cards
- full-text search on readings and journal content
- recommendation or memory extraction tables
- richer analytics and personalization

## PostgreSQL Data Opportunities

Beyond simple parity, PostgreSQL can support a much richer product.

### Core relational data

- users
- auth magic links
- auth sessions
- profiles
- tarot cards / imported catalog snapshots
- reading sessions
- reading messages
- reading events / tool events
- daily reading entitlements
- extra card entitlements
- payment intents / purchases / webhooks

### Product enrichment data

- saved reflections after each reading
- user themes/tags (love, work, anxiety, family, etc.)
- card history timeline per user
- streaks and cadence of readings
- bookmarks/favorites for meaningful readings
- follow-up prompts suggested by the system
- generated summaries of reading arcs over time
- notification preferences and delivery logs

### AI and memory data

- message embeddings with `pgvector`
- card embedding/search indexes
- extracted memory facts (preferences, recurring themes, unresolved topics)
- semantic recall candidates for future chat turns
- safety/audit logs of tool calls and model outputs
- prompt/version snapshots for debugging and evaluation

### Search and analytics features

- Postgres full-text search over readings, reflections, and card descriptions
- hybrid search: full-text + vector similarity
- funnel/event analytics for activation and purchase conversion
- cohort tables for product questions later

## Important Invariants To Preserve

- The assistant must not fabricate cards.
- Card revelation must remain a tool/use-case driven operation.
- Daily free-card entitlement must be enforced server-side.
- Payment credit must only be granted from verified payment state.
- Auth state and tarot reading state should remain conceptually separate.
- Rich card metadata from the Flowise export should be preserved.
- The app should continue to speak Brazilian Portuguese by default.

## Testing Strategy

Planning ends with tests. Execution starts from failing tests wherever practical.

### Priority tests to write first

1. Deck import and card lookup compatibility tests
2. Daily reading entitlement/reset tests with São Paulo timezone rules
3. Extra card purchase crediting tests
4. Payment verification state transition tests
5. Session/chat merge and persistence tests
6. Auth magic-link lifecycle tests
7. Tool invariants: draw card only through tool-backed use case
8. Route/app integration tests for reading flow and auth gating

## Validation Plan

By phase:

- package unit tests for domain and use cases
- repository tests for Drizzle/Postgres behavior
- app route/server-function tests for integration boundaries
- package/app typecheck and lint
- workspace validation for cross-package milestones

## Immediate Next Step

Do not start the full migration blindly. Start with a **foundation PR/step** that establishes the target app/packages, chooses the Node/LTS baseline, and ports the tarot domain plus tests before touching auth, payments, or AI orchestration.
