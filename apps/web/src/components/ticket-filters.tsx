import type {
  TicketFilters as TicketFiltersValues,
  TicketPriorityFilter,
  TicketStatusFilter,
} from "@/types";

type TicketFiltersProps = {
  filters: TicketFiltersValues;
  isLoading: boolean;
  onPriorityChange: (value: TicketPriorityFilter) => void;
  onReset: () => void;
  onStatusChange: (value: TicketStatusFilter) => void;
};

const statusOptions: Array<{ label: string; value: TicketStatusFilter }> = [
  { label: "All statuses", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const priorityOptions: Array<{ label: string; value: TicketPriorityFilter }> = [
  { label: "All priorities", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export function TicketFilters({
  filters,
  isLoading,
  onPriorityChange,
  onReset,
  onStatusChange,
}: TicketFiltersProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            Filters
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Refine the ticket list</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-ink/70">
            Narrow the current list by status or priority while keeping the newest
            tickets at the top.
          </p>
        </div>

        <button
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={onReset}
          type="button"
        >
          Clear filters
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Status</span>
          <select
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper"
            disabled={isLoading}
            onChange={(event) => onStatusChange(event.target.value as TicketStatusFilter)}
            value={filters.status}
          >
            {statusOptions.map((option) => (
              <option key={option.value || "all-statuses"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink/70">Priority</span>
          <select
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper"
            disabled={isLoading}
            onChange={(event) => onPriorityChange(event.target.value as TicketPriorityFilter)}
            value={filters.priority}
          >
            {priorityOptions.map((option) => (
              <option key={option.value || "all-priorities"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
