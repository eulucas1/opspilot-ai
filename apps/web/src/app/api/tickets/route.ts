import { NextRequest, NextResponse } from "next/server";

import type { TicketCreatePayload } from "@/types";

import { proxyCreateTicketRequest, proxyTicketsRequest } from "@/lib/api";

export async function GET(request: NextRequest) {
  const response = await proxyTicketsRequest(request.nextUrl.search);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(request: NextRequest) {
  let payload: TicketCreatePayload;

  try {
    payload = (await request.json()) as TicketCreatePayload;
  } catch {
    return NextResponse.json(
      {
        detail: "Invalid JSON body.",
      },
      { status: 400 },
    );
  }

  const response = await proxyCreateTicketRequest(payload);
  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
