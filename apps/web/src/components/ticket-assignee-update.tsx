"use client";

import { useEffect, useState } from "react";

import { useFeedback } from "@/components/feedback-provider";
import { TicketActionCardShell } from "@/components/ticket-action-card-shell";

type AssigneeOption = {
  label: string;
  value: string;
  isVisualOnly?: boolean;
};

type TicketAssigneeUpdateProps = {
  currentAssigneeId: string | null;
  onSubmit: (nextAssigneeId: string) => Promise<void>;
};

const ASSIGNEE_OPTIONS: AssigneeOption[] = [
  {
    label: "Unassigned",
    value: "unassigned",
    isVisualOnly: true,
  },
  {
    label: "Lucas Demo",
    value: "22222222-2222-2222-2222-222222222222",
  },
];

export function TicketAssigneeUpdate({
  currentAssigneeId,
  onSubmit,
}: TicketAssigneeUpdateProps) {
  const feedback = useFeedback();
  const normalizedCurrentAssignee = currentAssigneeId ?? "unassigned";
  const [selectedAssignee, setSelectedAssignee] = useState(normalizedCurrentAssignee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAssignee(normalizedCurrentAssignee);
    setErrorMessage(null);
  }, [normalizedCurrentAssignee]);

  const selectedOption =
    ASSIGNEE_OPTIONS.find((option) => option.value === selectedAssignee) ?? null;
  const isVisualOnly = Boolean(selectedOption?.isVisualOnly);
  const isSameAssignee = selectedAssignee === normalizedCurrentAssignee;

  async function handleSubmit() {
    if (isVisualOnly) {
      setErrorMessage("Unassigned is visual-only for now.");
      setSuccessMessage(null);
      feedback.info("Unassigned is visual-only in this initial version.");
      return;
    }

    if (isSameAssignee) {
      setErrorMessage("Choose a different assignee before submitting.");
      setSuccessMessage(null);
      feedback.info("Select a different assignee to continue.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSubmit(selectedAssignee);
      setSuccessMessage("Assignee updated successfully.");
      feedback.success("Ticket assignee updated.");
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update the ticket assignee.";

      setErrorMessage(nextErrorMessage);
      feedback.error(nextErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentAssigneeLabel =
    ASSIGNEE_OPTIONS.find((option) => option.value === normalizedCurrentAssignee)
      ?.label ?? "Unknown";

  const isSubmitDisabled = isSubmitting || isSameAssignee || isVisualOnly;

  const footer = (
    <div className="space-y-2">
      {isSameAssignee && !isVisualOnly ? (
        <p className="text-sm text-ink/60">
          Select a different assignee to enable the action.
        </p>
      ) : null}

      {isVisualOnly ? (
        <p className="text-sm text-ink/60">
          Unassigned is visual-only in this version.
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
        <span className="text-sm font-medium text-ink/70">New assignee</span>
        <select
          className="mt-2 w-full rounded-2xl border border-ink/12 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-sand/35 disabled:text-ink/45"
          disabled={isSubmitting}
          onChange={(event) => {
            setSelectedAssignee(event.target.value);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          value={selectedAssignee}
        >
          {ASSIGNEE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:bg-ink/35 disabled:text-sand/80"
        disabled={isSubmitDisabled}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? "Updating..." : "Update assignee"}
      </button>
    </div>
  );

  return (
    <TicketActionCardShell
      body={body}
      description={
        <>
          Current: <span className="font-semibold text-ink">{currentAssigneeLabel}</span>
        </>
      }
      footer={footer}
      label="Ownership"
      title="Update assignee"
    />
  );
}
