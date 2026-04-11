import type { TicketFilters, TicketSummary } from "@/types";

const DEFAULT_API_BASE_URLS = ["http://localhost:8000", "http://api:8000"] as const;

function buildTicketQuery(filters: TicketFilters): string {
  const searchParams = new URLSearchParams();

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  if (filters.priority) {
    searchParams.set("priority", filters.priority);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function getApiBaseUrls(): string[] {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  return [configuredBaseUrl, ...DEFAULT_API_BASE_URLS]
    .filter((value): value is string => Boolean(value))
    .filter((value, index, values) => values.indexOf(value) === index);
}

export async function fetchTickets(
  filters: TicketFilters,
  signal?: AbortSignal,
): Promise<TicketSummary[]> {
  const response = await fetch(`/api/tickets${buildTicketQuery(filters)}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    let errorMessage = "Failed to load tickets from the API.";

    try {
      const errorPayload = (await response.json()) as { detail?: string };
      if (errorPayload.detail) {
        errorMessage = errorPayload.detail;
      }
    } catch {
      // Keep the generic error message when the response is not JSON.
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as TicketSummary[];
}

export async function proxyTicketsRequest(search: string): Promise<Response> {
  let lastError: unknown = null;

  for (const apiBaseUrl of getApiBaseUrls()) {
    try {
      return await fetch(`${apiBaseUrl}/tickets${search}`, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });
    } catch (error) {
      lastError = error;
    }
  }

  const errorMessage =
    lastError instanceof Error
      ? lastError.message
      : "Failed to connect to the OpsPilot API.";

  return new Response(JSON.stringify({ detail: errorMessage }), {
    status: 502,
    headers: {
      "content-type": "application/json",
    },
  });
}
