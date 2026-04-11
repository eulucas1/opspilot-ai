import { NextRequest, NextResponse } from "next/server";

import { proxyTicketDetailRequest } from "@/lib/api";

type TicketDetailRouteProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: TicketDetailRouteProps,
) {
  const { ticketId } = await params;
  const response = await proxyTicketDetailRequest(ticketId);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
