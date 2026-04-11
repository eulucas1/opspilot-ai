import type { TicketActivityEvent } from "@/types";
import { formatTicketDate, formatTokenLabel } from "@/lib/ticket-display";

type TicketActivitySectionProps = {
  activity: TicketActivityEvent[];
};

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export function TicketActivitySection({
  activity,
}: TicketActivitySectionProps) {
  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            Activity
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">
            Ticket history
          </h3>
        </div>
        <div className="rounded-full bg-sand px-4 py-2 text-sm font-medium text-ink">
          {activity.length} event(s)
        </div>
      </div>

      {activity.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-ink/15 bg-sand/40 p-6 text-center">
          <p className="text-lg font-semibold text-ink">No activity yet</p>
          <p className="mt-2 text-sm leading-7 text-ink/70">
            This ticket does not have registered activity in the audit log.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {activity.map((event) => (
            <article
              key={event.id}
              className="rounded-[1.5rem] border border-ink/10 bg-sand/45 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                      Action
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink">
                      {formatTokenLabel(event.action)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper">
                      Entity Type
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink">
                      {formatTokenLabel(event.entity_type)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-ink/60">
                  {formatTicketDate(event.created_at)}
                </p>
              </div>

              {event.metadata && Object.keys(event.metadata).length > 0 ? (
                <div className="mt-5 rounded-2xl border border-ink/10 bg-white/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                    Metadata
                  </p>
                  <dl className="mt-3 grid gap-3">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-1 md:grid-cols-[180px_1fr] md:items-start"
                      >
                        <dt className="text-sm font-medium text-ink/65">
                          {formatTokenLabel(key)}
                        </dt>
                        <dd className="break-all text-sm text-ink">
                          {formatMetadataValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
