import type { Metadata } from "next";
import { Suspense } from "react";

import { TicketsPageContent } from "@/components/tickets-page-content";

export const metadata: Metadata = {
  title: "Tickets | OpsPilot AI",
  description: "Real ticket list integration powered by the OpsPilot AI backend.",
};

export default function TicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
          <div className="h-24 rounded-[2rem] border border-ink/10 bg-white/80 p-6 shadow-soft" />
          <div className="h-32 rounded-[1.75rem] border border-ink/10 bg-white/70 p-6 shadow-soft" />
          <div className="space-y-4">
            <div className="h-32 rounded-[1.5rem] border border-ink/10 bg-white/70 p-5 shadow-soft" />
            <div className="h-32 rounded-[1.5rem] border border-ink/10 bg-white/70 p-5 shadow-soft" />
            <div className="h-32 rounded-[1.5rem] border border-ink/10 bg-white/70 p-5 shadow-soft" />
          </div>
        </div>
      }
    >
      <TicketsPageContent />
    </Suspense>
  );
}
