"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TicketFilters } from "@/components/ticket-filters";
import { TicketList } from "@/components/ticket-list";
import { fetchTickets } from "@/lib/api";
import type {
  TicketFilters as TicketFiltersValues,
  TicketPriorityFilter,
  TicketStatusFilter,
  TicketSummary,
} from "@/types";

const defaultFilters: TicketFiltersValues = {
  status: "",
  priority: "",
};

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to load tickets from the API.";
}

export function TicketsPageContent() {
  const [filters, setFilters] = useState<TicketFiltersValues>(defaultFilters);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestVersion, setRequestVersion] = useState(0);

  const hasActiveFilters = Boolean(filters.status || filters.priority);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadTickets() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextTickets = await fetchTickets(filters, abortController.signal);

        if (abortController.signal.aborted) {
          return;
        }

        setTickets(nextTickets);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setTickets([]);
        setErrorMessage(extractErrorMessage(error));
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTickets();

    return () => {
      abortController.abort();
    };
  }, [filters, requestVersion]);

  function updateStatusFilter(status: TicketStatusFilter) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      status,
    }));
  }

  function updatePriorityFilter(priority: TicketPriorityFilter) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      priority,
    }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  function retryRequest() {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="rounded-[2rem] border border-ink/10 bg-white/80 px-6 py-8 shadow-soft backdrop-blur sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copper">
              Real API Integration
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Tickets
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
              First frontend integration with the live OpsPilot AI backend. This view
              consumes the real <span className="font-semibold">GET /tickets</span>{" "}
              endpoint and keeps the interface intentionally simple.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
              href="/"
            >
              Back to home
            </Link>
            <div className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-sand">
              {isLoading ? "Loading tickets..." : `${tickets.length} ticket(s)`}
            </div>
          </div>
        </div>
      </section>

      <TicketFilters
        filters={filters}
        isLoading={isLoading}
        onPriorityChange={updatePriorityFilter}
        onReset={resetFilters}
        onStatusChange={updateStatusFilter}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
              Ticket Feed
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              Latest operational tickets
            </h2>
          </div>
        </div>

        <TicketList
          errorMessage={errorMessage}
          hasActiveFilters={hasActiveFilters}
          isLoading={isLoading}
          onClearFilters={resetFilters}
          onRetry={retryRequest}
          tickets={tickets}
        />
      </section>
    </main>
  );
}
