"use client";

import { useEffect, useState } from "react";

import { TicketActionCardShell } from "@/components/ticket-action-card-shell";
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

  const footer = (
    <div className="space-y-2">
      {isSameStatus ? (
        <p className="text-sm text-ink/60">
          Select a different status to enable the action.
        </p>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );

  const body = (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-ink/70">New status</span>
        <select
          className="mt-2 w-full rounded-2xl border border-ink/12 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-sand/35 disabled:text-ink/45"
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
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:bg-ink/35 disabled:text-sand/80"
        disabled={isSubmitting || isSameStatus}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? "Updating..." : "Update status"}
      </button>
    </div>
  );

  return (
    <TicketActionCardShell
      body={body}
      description={
        <>
          Current:{" "}
          <span className="font-semibold text-ink">
            {formatTicketStatusLabel(currentStatus)}
          </span>
        </>
      }
      footer={footer}
      label="Status"
      title="Update status"
    />
  );
}
