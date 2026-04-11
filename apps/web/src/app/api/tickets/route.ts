import { NextRequest, NextResponse } from "next/server";

import { proxyTicketsRequest } from "@/lib/api";

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
