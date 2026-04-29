---
name: wd-backend-service
description: Build backend services and APIs with Hono, Zod schemas, Drizzle, and OpenAPI/Swagger documentation using feature and use-case oriented clean architecture.
---

# Webdrops Backend Service

Use this skill when creating or changing APIs, BFF endpoints, or standalone backend services.

## Default Stack

- **Hono** for HTTP APIs and services
- **Zod** for request, response, domain, and contract schemas
- **Drizzle** for persistence
- **OpenAPI + Swagger** for documentation and discoverability

## Architecture Rules

- Model the work around **features** and **use cases**.
- Keep business rules and use cases in core packages when they should be reusable or independently testable.
- Keep the service/app layer responsible for:
  - Hono route definitions
  - request/response adaptation
  - auth and transport concerns
  - service composition
- Do not let database or HTTP concerns leak into domain logic without need.

## Research Checklist

- Inspect existing route, schema, and persistence patterns first.
- Use **Context7** for current Hono, Drizzle, Zod, and OpenAPI docs.
- Identify:
  - transport contracts
  - use cases
  - persistence adapters
  - error mapping
  - docs endpoints and swagger wiring

## Planning Checklist

Document:

- feature/use cases
- route surface
- request/response schemas
- persistence responsibilities
- OpenAPI and Swagger updates
- tests to add first

Use an options table for critical decisions such as:

- service-local vs shared core logic
- repository pattern vs direct adapter usage
- sync vs async orchestration boundaries

## Implementation Checklist

- Define Zod schemas early.
- Ensure handlers map cleanly onto use cases.
- Keep Drizzle isolated behind clear adapters or repositories when helpful.
- Update OpenAPI definitions and Swagger exposure with every API change.
- Write failing tests before the final implementation pass whenever practical.

## Validation

Validate with a scope-appropriate mix of:

- unit tests for use cases
- handler/contract tests for API boundaries
- typecheck
- build
- manual verification of OpenAPI/Swagger routes when applicable
