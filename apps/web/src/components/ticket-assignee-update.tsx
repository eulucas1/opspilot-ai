"use client";

import { useEffect, useState } from "react";

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
      return;
    }

    if (isSameAssignee) {
      setErrorMessage("Choose a different assignee before submitting.");
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSubmit(selectedAssignee);
      setSuccessMessage("Assignee updated successfully.");
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Failed to update the ticket assignee.";

      setErrorMessage(nextErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentAssigneeLabel =
    ASSIGNEE_OPTIONS.find((option) => option.value === normalizedCurrentAssignee)
      ?.label ?? "Unknown";

  const isSubmitDisabled = isSubmitting || isSameAssignee || isVisualOnly;

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            Assignee update
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">Assign a ticket owner</h3>
          <p className="mt-2 text-sm leading-7 text-ink/70">
            Current assignee:{" "}
            <span className="font-semibold text-ink">{currentAssigneeLabel}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block">
            <span className="text-sm font-medium text-ink/70">New assignee</span>
            <select
              className="mt-2 w-full min-w-[220px] rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper disabled:cursor-not-allowed disabled:opacity-70"
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
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Updating..." : "Update assignee"}
          </button>
        </div>
      </div>

      {isSameAssignee && !isVisualOnly ? (
        <p className="mt-4 text-sm text-ink/60">
          Select a different assignee to enable the update action.
        </p>
      ) : null}

      {isVisualOnly ? (
        <p className="mt-4 text-sm text-ink/60">
          Unassigned is shown for context only and cannot be submitted yet.
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
