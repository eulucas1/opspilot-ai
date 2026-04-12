import type { TicketComment } from "@/types";
import { formatTicketDate } from "@/lib/ticket-display";

type TicketCommentsSectionProps = {
  comments: TicketComment[];
};

export function TicketCommentsSection({
  comments,
}: TicketCommentsSectionProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            Comments
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            Ticket discussion
          </h3>
          <p className="mt-2 text-sm leading-7 text-ink/70">
            Capture operational context and decisions as the ticket evolves.
          </p>
        </div>
        <div className="rounded-full border border-ink/10 bg-sand/60 px-4 py-2 text-sm font-medium text-ink">
          {comments.length} comment(s)
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-sand/40 p-6 text-center">
          <p className="text-lg font-semibold text-ink">No comments yet</p>
          <p className="mt-2 text-sm leading-7 text-ink/70">
            This ticket does not have comments in the current dataset.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[1.5rem] border border-ink/10 bg-sand/45 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                    User ID
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-ink">
                    {comment.user_id}
                  </p>
                </div>
                <p className="text-sm text-ink/60">
                  {formatTicketDate(comment.created_at)}
                </p>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ink/80">
                {comment.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
