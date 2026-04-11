import type { TicketPriority, TicketStatus } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusStyles: Record<TicketStatus, string> = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-sky-100 text-sky-800",
  resolved: "bg-emerald-100 text-emerald-800",
  closed: "bg-slate-200 text-slate-700",
};

const priorityStyles: Record<TicketPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-rose-100 text-rose-800",
};

export function formatTicketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    case "open":
    default:
      return "Open";
  }
}

export function formatTicketPriorityLabel(priority: TicketPriority): string {
  switch (priority) {
    case "high":
      return "High";
    case "low":
      return "Low";
    case "medium":
    default:
      return "Medium";
  }
}

export function formatTicketDate(dateValue: string): string {
  return dateFormatter.format(new Date(dateValue));
}

export function getTicketStatusClasses(status: TicketStatus): string {
  return statusStyles[status];
}

export function getTicketPriorityClasses(priority: TicketPriority): string {
  return priorityStyles[priority];
}
