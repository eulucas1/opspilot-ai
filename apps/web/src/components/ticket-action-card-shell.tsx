"use client";

import type { ReactNode } from "react";

type TicketActionCardShellProps = {
  body: ReactNode;
  description: ReactNode;
  footer?: ReactNode;
  label: string;
  title: string;
};

export function TicketActionCardShell({
  body,
  description,
  footer,
  label,
  title,
}: TicketActionCardShellProps) {
  return (
    <section className="rounded-[1.35rem] border border-ink/10 bg-white/92 p-5 shadow-[0_8px_24px_rgba(13,38,59,0.06)] backdrop-blur">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-copper/90">
          {label}
        </p>
        <h3 className="mt-1 text-xl font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/68">{description}</p>
      </header>

      <div className="mt-4">{body}</div>

      <footer className="mt-4">{footer}</footer>
    </section>
  );
}
