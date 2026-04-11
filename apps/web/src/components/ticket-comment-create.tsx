"use client";

import { useState } from "react";

type TicketCommentCreateProps = {
  organizationId: string;
  userId: string;
  onSubmit: (content: string) => Promise<void>;
};

export function TicketCommentCreate({
  organizationId,
  userId,
  onSubmit,
}: TicketCommentCreateProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedContent = content.trim();
  const isContentEmpty = trimmedContent.length === 0;

  async function handleSubmit() {
    if (isContentEmpty) {
      setErrorMessage("Comment content is required.");
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await onSubmit(trimmedContent);
      setContent("");
      setSuccessMessage("Comment added successfully.");
    } catch (error) {
      const nextErrorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Failed to add the comment.";

      setErrorMessage(nextErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            New comment
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">Add a comment</h3>
          <p className="mt-2 text-sm leading-7 text-ink/70">
            Posting as{" "}
            <span className="font-semibold text-ink">{userId}</span> in{" "}
            <span className="font-semibold text-ink">{organizationId}</span>.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink/70">Comment</span>
          <textarea
            className="mt-2 min-h-[140px] w-full resize-none rounded-2xl border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition focus:border-copper disabled:cursor-not-allowed disabled:opacity-70"
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
            Required
          </p>
          <button
            className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting || isContentEmpty}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </div>

      {isContentEmpty && !isSubmitting ? (
        <p className="mt-4 text-sm text-ink/60">Add a message to post a comment.</p>
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
