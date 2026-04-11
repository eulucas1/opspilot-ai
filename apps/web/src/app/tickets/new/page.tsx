import type { Metadata } from "next";

import { NewTicketPageContent } from "@/components/new-ticket-page-content";

export const metadata: Metadata = {
  title: "New ticket | OpsPilot AI",
  description: "Create a new ticket using the OpsPilot AI backend.",
};

export default function NewTicketPage() {
  return <NewTicketPageContent />;
}
