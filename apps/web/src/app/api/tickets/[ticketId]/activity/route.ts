import { NextRequest, NextResponse } from "next/server";

import { proxyTicketActivityRequest } from "@/lib/api";

type TicketActivityRouteProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: TicketActivityRouteProps,
) {
  const { ticketId } = await params;
  const response = await proxyTicketActivityRequest(ticketId);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
