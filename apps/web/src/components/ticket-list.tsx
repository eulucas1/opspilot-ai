import type { TicketPriority, TicketSummary, TicketStatus } from "@/types";

type TicketListProps = {
  errorMessage: string | null;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
  tickets: TicketSummary[];
};

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-sky-100 text-sky-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-rose-100 text-rose-800",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    case "open":
    default:
      return "Open";
  }
}

function formatPriorityLabel(priority: TicketPriority): string {
  switch (priority) {
    case "high":
      return "High";
    case "low":
      return "Low";
    case "medium":
    default:
      return "Medium";
  }
}

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
      {hasActiveFilters ? (
        <button
          className="mt-5 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
          onClick={onClearFilters}
          type="button"
        >
          Clear filters
        </button>
      ) : null}
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
          className="rounded-[1.5rem] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                Ticket
              </p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{ticket.title}</h3>
              <p className="mt-3 text-sm leading-7 text-ink/65">
                Created on {dateFormatter.format(new Date(ticket.created_at))}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${statusStyles[ticket.status]}`}
              >
                {formatStatusLabel(ticket.status)}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${priorityStyles[ticket.priority]}`}
              >
                {formatPriorityLabel(ticket.priority)}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
