import { NextRequest, NextResponse } from "next/server";

import type { TicketCommentCreatePayload } from "@/types";

import {
  proxyCreateTicketCommentRequest,
  proxyTicketCommentsRequest,
} from "@/lib/api";

type TicketCommentsRouteProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: TicketCommentsRouteProps,
) {
  const { ticketId } = await params;
  const response = await proxyTicketCommentsRequest(ticketId);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: TicketCommentsRouteProps,
) {
  const { ticketId } = await params;

  let payload: TicketCommentCreatePayload;

  try {
    payload = (await request.json()) as TicketCommentCreatePayload;
  } catch {
    return NextResponse.json(
      {
        detail: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const response = await proxyCreateTicketCommentRequest(ticketId, payload);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
