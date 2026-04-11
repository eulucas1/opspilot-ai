export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export type TicketStatusFilter = "" | TicketStatus;
export type TicketPriorityFilter = "" | TicketPriority;

export interface TicketSummary {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  assignee_user_id: string | null;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface TicketFilters {
  status: TicketStatusFilter;
  priority: TicketPriorityFilter;
}
