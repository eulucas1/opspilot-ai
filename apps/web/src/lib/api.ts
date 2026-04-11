import type {
  TicketActivityEvent,
  TicketComment,
  TicketCommentCreatePayload,
  TicketCreatePayload,
  TicketDetail,
  TicketFilters,
  TicketAssigneeUpdatePayload,
  TicketStatus,
  TicketStatusUpdatePayload,
  TicketSummary,
} from "@/types";

const DEFAULT_API_BASE_URLS = ["http://localhost:8000", "http://api:8000"] as const;

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

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

function normalizeApiBaseUrl(apiBaseUrl: string): string {
  return apiBaseUrl.replace(/\/+$/, "");
}

async function buildApiRequestError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiRequestError> {
  let errorMessage = fallbackMessage;

  try {
    const errorPayload = (await response.json()) as { detail?: string };
    if (errorPayload.detail) {
      errorMessage = errorPayload.detail;
    }
  } catch {
    // Keep the fallback error message when the response is not JSON.
  }

  return new ApiRequestError(response.status, errorMessage);
}

async function fetchFromFrontendApi(
  path: string,
  fallbackMessage: string,
  init: RequestInit = {},
): Promise<Response> {
  const response = await fetch(path, {
    method: init.method ?? "GET",
    ...init,
  });

  if (!response.ok) {
    throw await buildApiRequestError(response, fallbackMessage);
  }

  return response;
}

export async function fetchTickets(
  filters: TicketFilters,
  signal?: AbortSignal,
): Promise<TicketSummary[]> {
  const response = await fetchFromFrontendApi(
    `/api/tickets${buildTicketQuery(filters)}`,
    "Failed to load tickets from the API.",
    {
      signal,
    },
  );

  return (await response.json()) as TicketSummary[];
}

export async function fetchTicketById(
  ticketId: string,
  signal?: AbortSignal,
): Promise<TicketDetail> {
  const response = await fetchFromFrontendApi(
    `/api/tickets/${ticketId}`,
    "Failed to load ticket details from the API.",
    {
      signal,
    },
  );

  return (await response.json()) as TicketDetail;
}

export async function fetchTicketComments(
  ticketId: string,
  signal?: AbortSignal,
): Promise<TicketComment[]> {
  const response = await fetchFromFrontendApi(
    `/api/tickets/${ticketId}/comments`,
    "Failed to load ticket comments from the API.",
    {
      signal,
    },
  );

  return (await response.json()) as TicketComment[];
}

export async function createTicketComment(
  ticketId: string,
  payload: TicketCommentCreatePayload,
  signal?: AbortSignal,
): Promise<TicketComment> {
  const response = await fetchFromFrontendApi(
    `/api/tickets/${ticketId}/comments`,
    "Failed to create the ticket comment.",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    },
  );

  return (await response.json()) as TicketComment;
}

export async function fetchTicketActivity(
  ticketId: string,
  signal?: AbortSignal,
): Promise<TicketActivityEvent[]> {
  const response = await fetchFromFrontendApi(
    `/api/tickets/${ticketId}/activity`,
    "Failed to load ticket activity from the API.",
    {
      signal,
    },
  );

  return (await response.json()) as TicketActivityEvent[];
}

export async function createTicket(
  payload: TicketCreatePayload,
  signal?: AbortSignal,
): Promise<TicketDetail> {
  const response = await fetchFromFrontendApi(
    "/api/tickets",
    "Failed to create the ticket.",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    },
  );

  return (await response.json()) as TicketDetail;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  signal?: AbortSignal,
): Promise<TicketDetail> {
  const payload: TicketStatusUpdatePayload = { status };

  const response = await fetchFromFrontendApi(
    `/api/tickets/${ticketId}/status`,
    "Failed to update the ticket status.",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    },
  );

  return (await response.json()) as TicketDetail;
}

export async function updateTicketAssignee(
  ticketId: string,
  assigneeUserId: string,
  signal?: AbortSignal,
): Promise<TicketDetail> {
  const payload: TicketAssigneeUpdatePayload = { assignee_user_id: assigneeUserId };

  const response = await fetchFromFrontendApi(
    `/api/tickets/${ticketId}/assignee`,
    "Failed to update the ticket assignee.",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    },
  );

  return (await response.json()) as TicketDetail;
}

async function proxyApiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  let lastError: unknown = null;

  for (const apiBaseUrl of getApiBaseUrls()) {
    try {
      return await fetch(`${normalizeApiBaseUrl(apiBaseUrl)}${path}`, {
        method: init.method ?? "GET",
        ...init,
        headers: {
          Accept: "application/json",
          ...(init.headers ?? {}),
        },
        ...(init.method && init.method !== "GET" ? {} : { cache: "no-store" }),
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

export async function proxyTicketsRequest(search: string): Promise<Response> {
  return proxyApiRequest(`/tickets${search}`);
}

export async function proxyTicketDetailRequest(ticketId: string): Promise<Response> {
  return proxyApiRequest(`/tickets/${ticketId}`);
}

export async function proxyTicketCommentsRequest(ticketId: string): Promise<Response> {
  return proxyApiRequest(`/tickets/${ticketId}/comments`);
}

export async function proxyCreateTicketCommentRequest(
  ticketId: string,
  payload: TicketCommentCreatePayload,
): Promise<Response> {
  return proxyApiRequest(`/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function proxyTicketActivityRequest(ticketId: string): Promise<Response> {
  return proxyApiRequest(`/tickets/${ticketId}/activity`);
}

export async function proxyCreateTicketRequest(
  payload: TicketCreatePayload,
): Promise<Response> {
  return proxyApiRequest("/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function proxyUpdateTicketStatusRequest(
  ticketId: string,
  payload: TicketStatusUpdatePayload,
): Promise<Response> {
  return proxyApiRequest(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function proxyUpdateTicketAssigneeRequest(
  ticketId: string,
  payload: TicketAssigneeUpdatePayload,
): Promise<Response> {
  return proxyApiRequest(`/tickets/${ticketId}/assignee`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
