import type { Metadata } from "next";

import { TicketsPageContent } from "@/components/tickets-page-content";

export const metadata: Metadata = {
  title: "Tickets | OpsPilot AI",
  description: "Real ticket list integration powered by the OpsPilot AI backend.",
};

export default function TicketsPage() {
  return <TicketsPageContent />;
}
