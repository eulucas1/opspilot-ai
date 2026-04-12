"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { TicketSummary } from "@/types";

type TicketSummaryCardsProps = {
  hasActiveFilters: boolean;
  hasError: boolean;
  isLoading: boolean;
  tickets: TicketSummary[];
};

type SummaryCardKey = "total" | "open" | "in_progress" | "resolved" | "closed";

type SummaryCard = {
  key: SummaryCardKey;
  label: string;
  tone: string;
  value: number | null;
};

const baseCardClass =
  "rounded-[1.35rem] border px-4 py-4 shadow-soft backdrop-blur transition";

const toneByCardKey: Record<SummaryCardKey, string> = {
  total: "border-ink/15 bg-white/90 text-ink",
  open: "border-amber-200 bg-amber-50/95 text-amber-900",
  in_progress: "border-sky-200 bg-sky-50/95 text-sky-900",
  resolved: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
  closed: "border-slate-200 bg-slate-50/95 text-slate-900",
};

function buildSummaryCards(tickets: TicketSummary[]): SummaryCard[] {
  const counts = {
    total: tickets.length,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  };

  for (const ticket of tickets) {
    counts[ticket.status] += 1;
  }

  return [
    {
      key: "total",
      label: "Total",
      tone: toneByCardKey.total,
      value: counts.total,
    },
    {
      key: "open",
      label: "Open",
      tone: toneByCardKey.open,
      value: counts.open,
    },
    {
      key: "in_progress",
      label: "In Progress",
      tone: toneByCardKey.in_progress,
      value: counts.in_progress,
    },
    {
      key: "resolved",
      label: "Resolved",
      tone: toneByCardKey.resolved,
      value: counts.resolved,
    },
    {
      key: "closed",
      label: "Closed",
      tone: toneByCardKey.closed,
      value: counts.closed,
    },
  ];
}

function SummaryCardItem({ card }: { card: SummaryCard }) {
  return (
    <article className={`${baseCardClass} ${card.tone}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
        {card.label}
      </p>
      <p className="mt-3 text-3xl font-semibold leading-none">
        {card.value === null ? "-" : card.value}
      </p>
    </article>
  );
}

function LoadingCardItem({ index }: { index: number }) {
  return (
    <article
      className={`${baseCardClass} animate-pulse border-ink/10 bg-white/70`}
    >
      <div className="h-3 w-20 rounded-full bg-ink/10" />
      <div className="mt-3 h-8 w-14 rounded-full bg-ink/10" />
    </article>
  );
}

export function TicketSummaryCards({
  hasActiveFilters,
  hasError,
  isLoading,
  tickets,
}: TicketSummaryCardsProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const summaryCards = isLoading
    ? []
    : hasError
      ? buildSummaryCards([]).map((card) => ({ ...card, value: null }))
      : buildSummaryCards(tickets);

  const updateScrollControls = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setHasOverflow(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = Math.max(element.scrollWidth - element.clientWidth, 0);
    const nextHasOverflow = maxScroll > 1;
    const nextCanScrollLeft = element.scrollLeft > 1;
    const nextCanScrollRight = maxScroll - element.scrollLeft > 1;

    setHasOverflow(nextHasOverflow);
    setCanScrollLeft(nextHasOverflow && nextCanScrollLeft);
    setCanScrollRight(nextHasOverflow && nextCanScrollRight);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    updateScrollControls();

    const handleScroll = () => {
      updateScrollControls();
    };

    element.addEventListener("scroll", handleScroll, { passive: true });

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateScrollControls();
          })
        : null;
    observer?.observe(element);

    window.addEventListener("resize", updateScrollControls);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      observer?.disconnect();
      window.removeEventListener("resize", updateScrollControls);
    };
  }, [updateScrollControls, isLoading, hasError, tickets]);

  function scrollByStep(direction: "left" | "right") {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const amount = Math.max(element.clientWidth * 0.9, 220);

    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  const loadingItems = Array.from({ length: 5 });

  return (
    <section className="rounded-[1.75rem] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-copper">
            Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Ticket summary</h2>
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-ink/55">
          {isLoading
            ? "Loading data"
            : hasError
              ? "Summary unavailable"
              : hasActiveFilters
                ? "Filtered view"
                : "All tickets"}
        </p>
      </div>

      <div className="mt-5 lg:hidden">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? loadingItems.map((_, index) => (
                <div
                  key={`summary-loading-mobile-${index}`}
                  className="min-w-[180px] snap-start"
                >
                  <LoadingCardItem index={index} />
                </div>
              ))
            : summaryCards.map((card) => (
                <div key={card.key} className="min-w-[180px] snap-start">
                  <SummaryCardItem card={card} />
                </div>
              ))}
        </div>

        {hasOverflow ? (
          <div className="mt-3 flex justify-end gap-2">
            <button
              aria-label="Scroll summary left"
              className="rounded-full border border-ink/15 bg-white/75 px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canScrollLeft}
              onClick={() => scrollByStep("left")}
              type="button"
            >
              {"<"}
            </button>
            <button
              aria-label="Scroll summary right"
              className="rounded-full border border-ink/15 bg-white/75 px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-copper hover:text-copper disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canScrollRight}
              onClick={() => scrollByStep("right")}
              type="button"
            >
              {">"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 hidden gap-3 lg:grid lg:grid-cols-5">
        {isLoading
          ? loadingItems.map((_, index) => (
              <LoadingCardItem key={`summary-loading-desktop-${index}`} index={index} />
            ))
          : summaryCards.map((card) => <SummaryCardItem key={card.key} card={card} />)}
      </div>
    </section>
  );
}
