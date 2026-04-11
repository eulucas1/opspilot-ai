"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { ApiRequestError, createTicket } from "@/lib/api";
import type {
  TicketCreatePayload,
  TicketCreatePriority,
  TicketCreateValues,
} from "@/types";

const DEMO_ORGANIZATION_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_CREATED_BY_USER_ID = "22222222-2222-2222-2222-222222222222";

const defaultValues: TicketCreateValues = {
  title: "",
  description: "",
  priority: "",
};

type FieldErrors = Partial<Record<keyof TicketCreateValues, string>>;
type SubmissionState = "idle" | "submitting" | "success" | "error";

const priorityOptions: Array<{ label: string; value: TicketCreatePriority }> = [
  { label: "Select priority", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

function validateForm(values: TicketCreateValues): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (!values.title.trim()) {
    nextErrors.title = "Title is required.";
  }

  if (!values.description.trim()) {
    nextErrors.description = "Description is required.";
  }

  if (!values.priority) {
    nextErrors.priority = "Priority is required.";
  }

  return nextErrors;
}

function buildPayload(values: TicketCreateValues): TicketCreatePayload {
  return {
    organization_id: DEMO_ORGANIZATION_ID,
    created_by_user_id: DEMO_CREATED_BY_USER_ID,
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority as Exclude<TicketCreatePriority, "">,
  };
}

export function NewTicketPageContent() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [values, setValues] = useState<TicketCreateValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof TicketCreateValues>(
    field: K,
    value: TicketCreateValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));

    setFormError(null);

    if (submissionState === "error" || submissionState === "success") {
      setSubmissionState("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    const nextErrors = validateForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setFormError("Please fix the highlighted fields before submitting.");
      setSubmissionState("error");
      return;
    }

    setFieldErrors({});
    setFormError(null);
    setSubmissionState("submitting");

    try {
      const createdTicket = await createTicket(buildPayload(values));

      setSubmissionState("success");
      redirectTimeoutRef.current = setTimeout(() => {
        startTransition(() => {
          router.push(`/tickets/${createdTicket.id}`);
        });
      }, 900);
    } catch (error) {
      const errorMessage =
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error && error.message
            ? error.message
            : "Failed to create the ticket.";

      setSubmissionState("error");
      setFormError(errorMessage);
    }
  }

  const isSubmitting = submissionState === "submitting";
  const isSuccess = submissionState === "success";

  function fieldClasses(hasError: boolean): string {
    return [
      "mt-2 w-full rounded-2xl border bg-sand/70 px-4 py-3 text-sm text-ink outline-none transition",
      hasError ? "border-rose-400 focus:border-rose-500" : "border-ink/10 focus:border-copper",
    ].join(" ");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="rounded-[2rem] border border-ink/10 bg-white/80 px-6 py-8 shadow-soft backdrop-blur sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copper">
              Ticket Creation
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              New ticket
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-ink/75">
              Create a new ticket using the real <span className="font-semibold">POST /tickets</span>{" "}
              endpoint. This initial flow uses the seeded demo organization and user.
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

      <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
              Demo context
            </p>
            <p className="mt-3 text-sm leading-7 text-ink/70">
              Organization ID: <span className="font-semibold text-ink">{DEMO_ORGANIZATION_ID}</span>
            </p>
            <p className="text-sm leading-7 text-ink/70">
              Created By User ID: <span className="font-semibold text-ink">{DEMO_CREATED_BY_USER_ID}</span>
            </p>
          </div>
          <div className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-sand">
            {isSubmitting
              ? "Submitting..."
              : isSuccess
                ? "Created, redirecting..."
                : "Ready to submit"}
          </div>
        </div>

        {submissionState === "error" && formError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {formError}
          </div>
        ) : null}

        {isSuccess ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Ticket created successfully. Redirecting to the detail page...
          </div>
        ) : null}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-ink/70">Title</span>
            <input
              className={fieldClasses(Boolean(fieldErrors.title))}
              disabled={isSubmitting || isSuccess}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Payment retry queue stopped"
              type="text"
              value={values.title}
            />
            {fieldErrors.title ? (
              <p className="mt-2 text-sm text-rose-700">{fieldErrors.title}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink/70">Description</span>
            <textarea
              className={fieldClasses(Boolean(fieldErrors.description))}
              disabled={isSubmitting || isSuccess}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the operational issue or request in a bit more detail."
              rows={7}
              value={values.description}
            />
            {fieldErrors.description ? (
              <p className="mt-2 text-sm text-rose-700">{fieldErrors.description}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink/70">Priority</span>
            <select
              className={fieldClasses(Boolean(fieldErrors.priority))}
              disabled={isSubmitting || isSuccess}
              onChange={(event) =>
                updateField("priority", event.target.value as TicketCreatePriority)
              }
              value={values.priority}
            >
              {priorityOptions.map((option) => (
                <option key={option.value || "empty-priority"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldErrors.priority ? (
              <p className="mt-2 text-sm text-rose-700">{fieldErrors.priority}</p>
            ) : null}
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-sand transition hover:bg-[#18324d] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || isSuccess}
              type="submit"
            >
              {isSubmitting
                ? "Creating ticket..."
                : isSuccess
                  ? "Ticket created"
                  : "Create ticket"}
            </button>
            <Link
              className="rounded-full border border-ink/10 px-5 py-3 text-sm font-medium text-ink transition hover:border-copper hover:text-copper"
              href="/tickets"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
