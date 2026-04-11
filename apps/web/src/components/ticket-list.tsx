import Link from "next/link";

import type { TicketSummary } from "@/types";
import {
  formatTicketDate,
  formatTicketPriorityLabel,
  formatTicketStatusLabel,
  getTicketPriorityClasses,
  getTicketStatusClasses,
} from "@/lib/ticket-display";

type TicketListProps = {
  errorMessage: string | null;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
  tickets: TicketSummary[];
};

function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`ticket-skeleton-${index}`}
          className="animate-pulse rounded-[1.5rem] border border-ink/10 bg-white/70 p-5"
        >
          <div className="h-5 w-40 rounded-full bg-ink/10" />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-8 w-24 rounded-full bg-ink/10" />
            <div className="h-8 w-20 rounded-full bg-ink/10" />
          </div>
          <div className="mt-5 h-4 w-32 rounded-full bg-ink/10" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  errorMessage,
  onRetry,
}: {
  errorMessage: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-6 text-rose-900">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
        API Error
      </p>
      <h3 className="mt-2 text-xl font-semibold">We could not load tickets right now</h3>
      <p className="mt-3 text-sm leading-7 text-rose-800">{errorMessage}</p>
      <button
        className="mt-5 rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white/65 p-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
        No tickets
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">
        {hasActiveFilters ? "No tickets match the current filters" : "No tickets available yet"}
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink/70">
        {hasActiveFilters
          ? "Try removing one of the active filters to broaden the result set."
          : "Once the backend has tickets available, they will appear here automatically."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {hasActiveFilters ? (
          <button
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
            onClick={onClearFilters}
            type="button"
          >
            Clear filters
          </button>
        ) : null}
        <Link
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-sand transition hover:bg-[#18324d]"
          href="/tickets/new"
        >
          Create a ticket
        </Link>
      </div>
    </div>
  );
}

export function TicketList({
  errorMessage,
  hasActiveFilters,
  isLoading,
  onClearFilters,
  onRetry,
  tickets,
}: TicketListProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (errorMessage) {
    return <ErrorState errorMessage={errorMessage} onRetry={onRetry} />;
  }

  if (tickets.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <article
          key={ticket.id}
          className="group rounded-[1.5rem] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-lg"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper">
                Ticket
              </p>
              <h3 className="text-2xl font-semibold text-ink">
                <Link
                  className="transition group-hover:text-copper"
                  href={`/tickets/${ticket.id}`}
                >
                  {ticket.title}
                </Link>
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink/70">
                <span className="rounded-full border border-ink/10 bg-sand/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
                  Created
                </span>
                <span className="text-sm font-medium text-ink/70">
                  {formatTicketDate(ticket.created_at)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border border-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${getTicketStatusClasses(ticket.status)}`}
              >
                {formatTicketStatusLabel(ticket.status)}
              </span>
              <span
                className={`rounded-full border border-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${getTicketPriorityClasses(ticket.priority)}`}
              >
                {formatTicketPriorityLabel(ticket.priority)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.2em] text-ink/50">
              View the full ticket details and history
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
              href={`/tickets/${ticket.id}`}
            >
              View details
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
