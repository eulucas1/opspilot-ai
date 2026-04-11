import { NextRequest, NextResponse } from "next/server";

import type { TicketStatusUpdatePayload } from "@/types";

import { proxyUpdateTicketStatusRequest } from "@/lib/api";

type TicketStatusRouteProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: TicketStatusRouteProps,
) {
  const { ticketId } = await params;

  let payload: TicketStatusUpdatePayload;

  try {
    payload = (await request.json()) as TicketStatusUpdatePayload;
  } catch {
    return NextResponse.json(
      {
        detail: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const response = await proxyUpdateTicketStatusRequest(ticketId, payload);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
