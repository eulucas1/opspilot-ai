import type { HealthStatus, NavigationItem } from "@opspilot/shared-types";

import type { ProductHighlight, ProductPillar } from "@/types";

export const navigation: NavigationItem[] = [
  {
    label: "Architecture",
    href: "#architecture",
    description: "Overview of the initial technical foundation.",
  },
  {
    label: "Backlog",
    href: "#backlog",
    description: "Initial product direction and build slices.",
  },
  {
    label: "Setup",
    href: "#setup",
    description: "What is already prepared for local development.",
  },
];

export const apiPreview: HealthStatus = {
  status: "ok",
  service: "OpsPilot AI API",
  environment: "development",
};

export const productHighlights: ProductHighlight[] = [
  {
    eyebrow: "Monorepo",
    title: "Clear boundaries from day one",
    description:
      "Apps, shared packages, infra, CI, and decision records are organized for growth without premature complexity.",
  },
  {
    eyebrow: "Backend",
    title: "Operational API baseline",
    description:
      "FastAPI starts with centralized settings, SQLAlchemy session setup, Alembic configuration, and a tested health endpoint.",
  },
  {
    eyebrow: "Frontend",
    title: "Product shell ready to evolve",
    description:
      "Next.js App Router, Tailwind CSS, and a typed component structure provide a straightforward path for new features.",
  },
];

export const productPillars: ProductPillar[] = [
  {
    title: "Engineering Quality",
    description:
      "Keep the initial codebase easy to read, test, containerize, and extend with minimal ceremony.",
    items: [
      "CI workflows split by backend and frontend",
      "Docker Compose for local orchestration",
      "Shared types package for frontend contracts",
    ],
  },
  {
    title: "Product Readiness",
    description:
      "Document architecture, backlog, and decisions early so future features inherit a stable baseline.",
    items: [
      "Architecture overview in docs",
      "Backlog organized by delivery phases",
      "ADR capturing the monorepo decision",
    ],
  },
];

export const setupChecklist: string[] = [
  "PostgreSQL container wired for local development with health checks.",
  "FastAPI app exposes GET /health and includes pytest coverage.",
  "Next.js frontend is configured with Tailwind CSS and App Router.",
  "Playwright configuration is ready for future end-to-end coverage.",
  "GitHub Actions workflows validate frontend and backend independently.",
];
