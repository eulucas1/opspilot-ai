"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { TicketFilters } from "@/components/ticket-filters";
import { TicketList } from "@/components/ticket-list";
import { TicketSummaryCards } from "@/components/ticket-summary-cards";
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

const statusValues: TicketStatusFilter[] = [
  "",
  "open",
  "in_progress",
  "resolved",
  "closed",
];
const priorityValues: TicketPriorityFilter[] = ["", "low", "medium", "high"];

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to load tickets from the API.";
}

export function TicketsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const nextStatus = searchParams?.get("status") ?? "";
    const nextPriority = searchParams?.get("priority") ?? "";

    const normalizedStatus = statusValues.includes(nextStatus as TicketStatusFilter)
      ? (nextStatus as TicketStatusFilter)
      : "";
    const normalizedPriority = priorityValues.includes(
      nextPriority as TicketPriorityFilter,
    )
      ? (nextPriority as TicketPriorityFilter)
      : "";

    setFilters((currentFilters) => {
      if (
        currentFilters.status === normalizedStatus &&
        currentFilters.priority === normalizedPriority
      ) {
        return currentFilters;
      }

      return {
        status: normalizedStatus,
        priority: normalizedPriority,
      };
    });
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.priority) {
      params.set("priority", filters.priority);
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `/tickets?${queryString}` : "/tickets";
    const currentQuery = searchParams?.toString() ?? "";
    const currentUrl = currentQuery ? `/tickets?${currentQuery}` : "/tickets";

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [filters, router, searchParams]);

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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-7 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
      <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 px-5 py-6 shadow-soft backdrop-blur sm:rounded-[2rem] sm:px-8 sm:py-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copper">
              Real API Integration
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Tickets
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-ink/75 sm:text-lg sm:leading-8">
              First frontend integration with the live OpsPilot AI backend. This view
              consumes the real <span className="font-semibold">GET /tickets</span>{" "}
              endpoint and keeps the interface intentionally simple.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto">
            <Link
              className="w-full rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-sand transition hover:bg-[#18324d] sm:w-auto"
              href="/tickets/new"
            >
              New ticket
            </Link>
            <Link
              className="w-full rounded-full border border-ink/10 px-4 py-2 text-center text-sm font-medium text-ink transition hover:border-copper hover:text-copper sm:w-auto"
              href="/"
            >
              Back to home
            </Link>
            <div className="w-full rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-sand sm:w-auto">
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

      <TicketSummaryCards
        hasActiveFilters={hasActiveFilters}
        hasError={Boolean(errorMessage)}
        isLoading={isLoading}
        tickets={tickets}
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
              Ticket Feed
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">
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
