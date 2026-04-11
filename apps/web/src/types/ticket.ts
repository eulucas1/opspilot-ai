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

export type TicketDetail = TicketSummary;

export interface TicketComment {
  id: string;
  ticket_id: string;
  organization_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TicketActivityEvent {
  id: string;
  organization_id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type TicketCreatePriority = "" | TicketPriority;

export interface TicketCreateValues {
  title: string;
  description: string;
  priority: TicketCreatePriority;
}

export interface TicketCreatePayload {
  organization_id: string;
  created_by_user_id: string;
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface TicketStatusUpdatePayload {
  status: TicketStatus;
}

export interface TicketAssigneeUpdatePayload {
  assignee_user_id: string;
}

export interface TicketFilters {
  status: TicketStatusFilter;
  priority: TicketPriorityFilter;
}
