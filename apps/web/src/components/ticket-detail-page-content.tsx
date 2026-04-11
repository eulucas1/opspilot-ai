"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ApiRequestError,
  fetchTicketActivity,
  fetchTicketById,
  fetchTicketComments,
  updateTicketAssignee,
  updateTicketStatus,
} from "@/lib/api";
import {
  formatTicketDate,
  formatTicketPriorityLabel,
  formatTicketStatusLabel,
  getTicketPriorityClasses,
  getTicketStatusClasses,
} from "@/lib/ticket-display";
import { TicketActivitySection } from "@/components/ticket-activity-section";
import { TicketAssigneeUpdate } from "@/components/ticket-assignee-update";
import { TicketCommentsSection } from "@/components/ticket-comments-section";
import { TicketStatusUpdate } from "@/components/ticket-status-update";
import type {
  TicketActivityEvent,
  TicketComment,
  TicketDetail,
  TicketStatus,
} from "@/types";

type TicketDetailPageContentProps = {
  ticketId: string;
};

type DetailFieldProps = {
  label: string;
  value: string;
};

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-[2rem] border border-ink/10 bg-white/80 p-8 shadow-soft">
        <div className="h-4 w-32 rounded-full bg-ink/10" />
        <div className="mt-4 h-10 w-2/3 rounded-full bg-ink/10" />
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="h-9 w-28 rounded-full bg-ink/10" />
          <div className="h-9 w-24 rounded-full bg-ink/10" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="animate-pulse rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft">
          <div className="h-4 w-24 rounded-full bg-ink/10" />
          <div className="mt-5 h-4 w-full rounded-full bg-ink/10" />
          <div className="mt-3 h-4 w-11/12 rounded-full bg-ink/10" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-ink/10" />
        </div>

        <div className="animate-pulse rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft">
          <div className="h-4 w-24 rounded-full bg-ink/10" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`detail-field-skeleton-${index}`}>
                <div className="h-3 w-24 rounded-full bg-ink/10" />
                <div className="mt-2 h-4 w-full rounded-full bg-ink/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="animate-pulse rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft">
          <div className="h-4 w-24 rounded-full bg-ink/10" />
          <div className="mt-6 h-24 rounded-[1.25rem] bg-ink/10" />
        </div>
        <div className="animate-pulse rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft">
          <div className="h-4 w-24 rounded-full bg-ink/10" />
          <div className="mt-6 h-24 rounded-[1.25rem] bg-ink/10" />
        </div>
      </div>
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
      <h2 className="mt-2 text-2xl font-semibold">We could not load this ticket</h2>
      <p className="mt-3 text-sm leading-7 text-rose-800">{errorMessage}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
        <Link
          className="rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-900 transition hover:border-rose-500"
          href="/tickets"
        >
          Back to tickets
        </Link>
      </div>
    </div>
  );
}

function NotFoundState({ ticketId }: { ticketId: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white/70 p-8 text-center shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
        Ticket not found
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-ink">
        We could not find this ticket
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-ink/70">
        The ticket identifier <span className="font-semibold text-ink">{ticketId}</span>{" "}
        does not exist in the current dataset or is no longer available.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
        href="/tickets"
      >
        Back to tickets
      </Link>
    </div>
  );
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist/70">
        {label}
      </p>
      <p className="mt-2 break-all text-sm font-medium leading-7 text-sand">{value}</p>
    </div>
  );
}

function normalizeTicketError(error: unknown): {
  isNotFound: boolean;
  message: string;
} {
  if (error instanceof ApiRequestError) {
    if (error.status === 404) {
      return {
        isNotFound: true,
        message: error.message,
      };
    }

    return {
      isNotFound: false,
      message: error.message,
    };
  }

  if (error instanceof Error && error.message) {
    return {
      isNotFound: false,
      message: error.message,
    };
  }

  return {
    isNotFound: false,
    message: "Failed to load ticket details from the API.",
  };
}

export function TicketDetailPageContent({
  ticketId,
}: TicketDetailPageContentProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [activity, setActivity] = useState<TicketActivityEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadTicketDetails() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

      try {
        const nextTicket = await fetchTicketById(ticketId, abortController.signal);

        if (abortController.signal.aborted) {
          return;
        }

        const [nextComments, nextActivity] = await Promise.all([
          fetchTicketComments(ticketId, abortController.signal),
          fetchTicketActivity(ticketId, abortController.signal),
        ]);

        if (abortController.signal.aborted) {
          return;
        }

        setTicket(nextTicket);
        setComments(nextComments);
        setActivity(nextActivity);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        const normalizedError = normalizeTicketError(error);
        setTicket(null);
        setComments([]);
        setActivity([]);
        setIsNotFound(normalizedError.isNotFound);
        setErrorMessage(normalizedError.isNotFound ? null : normalizedError.message);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTicketDetails();

    return () => {
      abortController.abort();
    };
  }, [requestVersion, ticketId]);

  function retryRequest() {
    setRequestVersion((currentVersion) => currentVersion + 1);
  }

  async function handleStatusUpdate(nextStatus: TicketStatus) {
    const updatedTicket = await updateTicketStatus(ticketId, nextStatus);
    const nextActivity = await fetchTicketActivity(ticketId);

    setTicket(updatedTicket);
    setActivity(nextActivity);
  }

  async function handleAssigneeUpdate(nextAssigneeId: string) {
    const updatedTicket = await updateTicketAssignee(ticketId, nextAssigneeId);
    const nextActivity = await fetchTicketActivity(ticketId);

    setTicket(updatedTicket);
    setActivity(nextActivity);
  }

  const description = ticket?.description.trim()
    ? ticket.description
    : "No description provided for this ticket yet.";
  const assigneeUserId = ticket?.assignee_user_id ?? "Not assigned yet";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="rounded-[2rem] border border-ink/10 bg-white/80 px-6 py-8 shadow-soft backdrop-blur sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copper">
              Ticket Detail
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {isLoading ? "Loading ticket..." : ticket?.title || "Ticket detail"}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
              Detailed view powered by the real ticket, comments and activity endpoints
              from the OpsPilot AI backend.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
              href="/tickets"
            >
              Back to tickets
            </Link>
            <Link
              className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
              href="/"
            >
              Home
            </Link>
          </div>
        </div>
      </section>

      {isLoading ? <LoadingState /> : null}
      {!isLoading && isNotFound ? <NotFoundState ticketId={ticketId} /> : null}
      {!isLoading && errorMessage ? (
        <ErrorState errorMessage={errorMessage} onRetry={retryRequest} />
      ) : null}

      {!isLoading && !errorMessage && !isNotFound && ticket ? (
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
                  Ticket Overview
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-ink">{ticket.title}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/75">{description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${getTicketStatusClasses(ticket.status)}`}
                >
                  {formatTicketStatusLabel(ticket.status)}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${getTicketPriorityClasses(ticket.priority)}`}
                >
                  {formatTicketPriorityLabel(ticket.priority)}
                </span>
              </div>
            </div>
          </section>

          <TicketStatusUpdate
            currentStatus={ticket.status}
            onSubmit={handleStatusUpdate}
          />

          <TicketAssigneeUpdate
            currentAssigneeId={ticket.assignee_user_id}
            onSubmit={handleAssigneeUpdate}
          />

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.75rem] border border-ink/10 bg-white/75 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
                Description
              </p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-ink/80">
                {description}
              </p>
            </article>

            <aside className="rounded-[1.75rem] border border-ink/10 bg-ink px-6 py-7 text-sand shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">
                Metadata
              </p>
              <div className="mt-5 grid gap-4">
                <DetailField label="Ticket ID" value={ticket.id} />
                <DetailField label="Organization ID" value={ticket.organization_id} />
                <DetailField label="Created By User ID" value={ticket.created_by_user_id} />
                <DetailField label="Assignee User ID" value={assigneeUserId} />
                <DetailField label="Created At" value={formatTicketDate(ticket.created_at)} />
                <DetailField label="Updated At" value={formatTicketDate(ticket.updated_at)} />
              </div>
            </aside>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <TicketCommentsSection comments={comments} />
            <TicketActivitySection activity={activity} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
