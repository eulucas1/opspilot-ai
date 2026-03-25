# ADR 0001: Adopt a Monorepo Structure

## Status

Accepted

## Context

OpsPilot AI needs a foundation that supports a web application, an API, shared contracts, infrastructure assets, and documentation. Splitting this too early across multiple repositories would increase coordination overhead and slow down the initial delivery phase.

## Decision

Adopt a monorepo structure with:

- `apps/web` for the Next.js frontend
- `apps/api` for the FastAPI backend
- `packages/shared-types` for shared frontend contracts
- `docs` for product, architecture, and ADRs
- `infra/docker` for container definitions

## Consequences

### Positive

- Shared visibility across product and platform layers
- Easier refactoring across frontend and backend boundaries
- Simpler onboarding for early contributors
- Centralized CI, local setup, and documentation

### Trade-Offs

- Tooling needs to be organized clearly from the start
- Dependency management must stay disciplined as packages grow
- CI workflows should remain scoped to avoid unnecessary build time
