"use client";

import { useEffect, useState } from "react";

import { useFeedback } from "@/components/feedback-provider";
import type { TicketStatus } from "@/types";
import { formatTicketStatusLabel } from "@/lib/ticket-display";

type TicketStatusUpdateProps = {
  currentStatus: TicketStatus;
  onSubmit: (nextStatus: TicketStatus) => Promise<void>;
};

const statusOptions: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export function TicketStatusUpdate({
  currentStatus,
  onSubmit,
}: TicketStatusUpdateProps) {
  const feedback = useFeedback();
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedStatus(currentStatus);
    setErrorMessage(null);
  }, [currentStatus]);

  async function handleSubmit() {
    if (selectedStatus === currentStatus) {
      setErrorMessage("Choose a different status before submitting.");
      setSuccessMessage(null);
      feedback.info("Select a different status to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSubmit(selectedStatus);
      setSuccessMessage("Status updated successfully.");
      feedback.success("Ticket status updated.");
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update the ticket status.";

      setErrorMessage(nextErrorMessage);
      feedback.error(nextErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSameStatus = selectedStatus === currentStatus;

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            Status update
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            Change ticket status
          </h3>
          <p className="mt-2 text-sm leading-7 text-ink/70">
            Current status: <span className="font-semibold text-ink">{formatTicketStatusLabel(currentStatus)}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block">
            <span className="text-sm font-medium text-ink/70">New status</span>
            <select
              className="mt-2 w-full min-w-[220px] rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              onChange={(event) => {
                setSelectedStatus(event.target.value as TicketStatus);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              value={selectedStatus}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatTicketStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <button
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting || isSameStatus}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Updating..." : "Update status"}
          </button>
        </div>
      </div>

      {isSameStatus ? (
        <p className="mt-4 text-sm text-ink/60">
          Select a different status to enable the update action.
        </p>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
