# Architecture Overview

## Purpose

OpsPilot AI starts as a simple, well-structured monorepo for an operations workflow platform. The goal of this phase is not feature depth, but a reliable foundation for future delivery.

## High-Level Architecture

- `apps/web`: Next.js frontend for the product experience
- `apps/api`: FastAPI backend for HTTP APIs and business services
- `packages/shared-types`: shared TypeScript contracts for frontend packages
- `infra/docker`: container definitions for local environments
- `docs`: architecture, product, and decision records

## Initial Runtime Flow

1. The browser loads the Next.js application from `apps/web`.
2. The frontend communicates with the FastAPI service in `apps/api`.
3. The API uses SQLAlchemy for data access and PostgreSQL as the persistence layer.
4. Alembic manages database schema evolution over time.

## Backend Design

- FastAPI routes are grouped under `app/api`.
- Settings live in `app/core` and are centralized with Pydantic Settings.
- SQLAlchemy base and sessions live under `app/db`.
- Schemas live in `app/schemas`.
- Service orchestration logic lives in `app/services`.
- Tests are colocated under `app/tests`.

## Frontend Design

- Next.js App Router is used for the initial application shell.
- Tailwind CSS provides styling with low ceremony.
- Reusable UI blocks live in `src/components`.
- View-specific helpers and product content live in `src/lib`.
- Local UI types live in `src/types`.

## Infrastructure

- Docker Compose orchestrates `web`, `api`, and `postgres` for local development.
- GitHub Actions runs frontend and backend pipelines independently.
- Environment variables are documented in `.env.example`.

## Next Architectural Additions

- Authentication and authorization
- Domain models and first migrations
- API versioning strategy when business endpoints grow
- Background jobs, observability, and event-driven workflows
