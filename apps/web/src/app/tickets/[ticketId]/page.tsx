import type { Metadata } from "next";

import { TicketDetailPageContent } from "@/components/ticket-detail-page-content";

export const metadata: Metadata = {
  title: "Ticket detail | OpsPilot AI",
  description: "Ticket detail view powered by the OpsPilot AI backend.",
};

type TicketDetailPageProps = {
  params: Promise<{
    ticketId: string;
  }>;
};

export default async function TicketDetailPage({
  params,
}: TicketDetailPageProps) {
  const { ticketId } = await params;

  return <TicketDetailPageContent ticketId={ticketId} />;
}
