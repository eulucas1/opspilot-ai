import { NextRequest, NextResponse } from "next/server";

import type { TicketAssigneeUpdatePayload } from "@/types";

import { proxyUpdateTicketAssigneeRequest } from "@/lib/api";

type TicketAssigneeRouteProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: TicketAssigneeRouteProps,
) {
  const { ticketId } = await params;

  let payload: TicketAssigneeUpdatePayload;

  try {
    payload = (await request.json()) as TicketAssigneeUpdatePayload;
  } catch {
    return NextResponse.json(
      {
        detail: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const response = await proxyUpdateTicketAssigneeRequest(ticketId, payload);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
