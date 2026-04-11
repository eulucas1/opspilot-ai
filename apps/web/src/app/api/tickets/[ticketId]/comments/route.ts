import { NextRequest, NextResponse } from "next/server";

import { proxyTicketCommentsRequest } from "@/lib/api";

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
