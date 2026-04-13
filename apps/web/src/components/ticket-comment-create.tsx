"use client";

import { useState } from "react";

import { useFeedback } from "@/components/feedback-provider";
import { TicketActionCardShell } from "@/components/ticket-action-card-shell";

type TicketCommentCreateProps = {
  organizationId: string;
  userId: string;
  onSubmit: (content: string) => Promise<void>;
};

function shortId(value: string): string {
  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function TicketCommentCreate({
  organizationId,
  userId,
  onSubmit,
}: TicketCommentCreateProps) {
  const feedback = useFeedback();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent.length === 0;
  const hasFooterFeedback =
    (isContentEmpty && !isSubmitting) ||
    Boolean(successMessage) ||
    Boolean(errorMessage);

  async function handleSubmit() {
    if (isContentEmpty) {
      setErrorMessage("Comment content is required.");
      setSuccessMessage(null);
      feedback.info("Write a comment before posting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSubmit(trimmedContent);
      setContent("");
      setSuccessMessage("Comment added successfully.");
      feedback.success("Comment added to the ticket.");
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Failed to add the comment.";

      setErrorMessage(nextErrorMessage);
      feedback.error(nextErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const footer = hasFooterFeedback ? (
    <div className="space-y-2">
      {isContentEmpty && !isSubmitting ? (
        <p className="text-sm text-ink/60">Write a message to enable posting.</p>
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
  ) : null;

  const body = (
    <div className="space-y-3">
      <p className="text-xs leading-5 text-ink/58">
        Actor <span className="font-semibold text-ink/72">{shortId(userId)}</span> • Org{" "}
        <span className="font-semibold text-ink/72">{shortId(organizationId)}</span>
      </p>

      <label className="block">
        <span className="text-sm font-medium text-ink/70">Comment</span>
        <textarea
          className="mt-2 min-h-[96px] w-full resize-none rounded-2xl border border-ink/12 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper disabled:cursor-not-allowed disabled:border-ink/10 disabled:bg-sand/35 disabled:text-ink/45"
          disabled={isSubmitting}
          onChange={(event) => {
            setContent(event.target.value);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          placeholder="Share an update or add context for this ticket."
          value={content}
        />
      </label>

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:bg-ink/35 disabled:text-sand/80"
        disabled={isSubmitting || isContentEmpty}
        onClick={handleSubmit}
        type="button"
      >
        {isSubmitting ? "Posting..." : "Post comment"}
      </button>
    </div>
  );

  return (
    <TicketActionCardShell
      body={body}
      description={
        <>
          Quick context update for this ticket.
        </>
      }
      footer={footer}
      label="Comment"
      title="Add note"
    />
  );
}
