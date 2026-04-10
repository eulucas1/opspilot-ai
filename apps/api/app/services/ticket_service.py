from uuid import UUID

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.comment import Comment
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreateRequest

VALID_TICKET_STATUSES = ("open", "in_progress", "resolved", "closed")
VALID_TICKET_PRIORITIES = ("low", "medium", "high")


def list_tickets(
    db: Session,
    *,
    status: str | None = None,
    priority: str | None = None,
    organization_id: UUID | None = None,
    created_by_user_id: UUID | None = None,
    assignee_user_id: UUID | None = None,
) -> list[Ticket]:
    if status is not None and status not in VALID_TICKET_STATUSES:
        valid_statuses = ", ".join(VALID_TICKET_STATUSES)
        raise ValueError(f"status must be one of: {valid_statuses}")

    if priority is not None and priority not in VALID_TICKET_PRIORITIES:
        valid_priorities = ", ".join(VALID_TICKET_PRIORITIES)
        raise ValueError(f"priority must be one of: {valid_priorities}")

    statement = select(Ticket)

    if status is not None:
        statement = statement.where(Ticket.status == status)

    if priority is not None:
        statement = statement.where(Ticket.priority == priority)

    if organization_id is not None:
        statement = statement.where(Ticket.organization_id == organization_id)

    if created_by_user_id is not None:
        statement = statement.where(Ticket.created_by_user_id == created_by_user_id)

    if assignee_user_id is not None:
        statement = statement.where(Ticket.assignee_user_id == assignee_user_id)

    statement = statement.order_by(Ticket.created_at.desc())
    return list(db.scalars(statement).all())


def get_ticket_by_id(db: Session, ticket_id: UUID) -> Ticket | None:
    return db.get(Ticket, ticket_id)


def list_ticket_activity(db: Session, ticket_id: UUID) -> list[AuditLog]:
    ticket = get_ticket_by_id(db, ticket_id)
    if ticket is None:
        raise LookupError("Ticket not found")

    comment_ids_for_ticket = select(Comment.id).where(Comment.ticket_id == ticket_id)
    statement = (
        select(AuditLog)
        .where(
            or_(
                and_(
                    AuditLog.entity_type == "ticket",
                    AuditLog.entity_id == ticket_id,
                ),
                and_(
                    AuditLog.entity_type == "ticket_comment",
                    AuditLog.entity_id.in_(comment_ids_for_ticket),
                ),
            )
        )
        .order_by(AuditLog.created_at.asc())
    )
    return list(db.scalars(statement).all())


def create_ticket(db: Session, payload: TicketCreateRequest) -> Ticket:
    organization = db.get(Organization, payload.organization_id)
    if organization is None:
        raise ValueError("organization_id does not exist")

    user = db.get(User, payload.created_by_user_id)
    if user is None:
        raise ValueError("created_by_user_id does not exist")

    if user.organization_id != organization.id:
        raise ValueError("created_by_user_id does not belong to organization_id")

    ticket = Ticket(
        organization_id=payload.organization_id,
        created_by_user_id=payload.created_by_user_id,
        title=payload.title,
        description=payload.description,
        status="open",
        priority=payload.priority,
    )
    db.add(ticket)
    db.flush()

    audit_log = AuditLog(
        organization_id=payload.organization_id,
        user_id=payload.created_by_user_id,
        entity_type="ticket",
        entity_id=ticket.id,
        action="ticket_created",
    )
    db.add(audit_log)

    db.commit()
    db.refresh(ticket)

    return ticket


def update_ticket_status(db: Session, ticket_id: UUID, new_status: str) -> Ticket:
    ticket = get_ticket_by_id(db, ticket_id)
    if ticket is None:
        raise LookupError("Ticket not found")

    if new_status not in VALID_TICKET_STATUSES:
        valid_statuses = ", ".join(VALID_TICKET_STATUSES)
        raise ValueError(f"status must be one of: {valid_statuses}")

    if new_status == ticket.status:
        raise ValueError(f"status is already set to '{new_status}'")

    old_status = ticket.status
    ticket.status = new_status

    audit_log = AuditLog(
        organization_id=ticket.organization_id,
        user_id=ticket.created_by_user_id,
        entity_type="ticket",
        entity_id=ticket.id,
        action="ticket_status_changed",
        metadata_={
            "old_status": old_status,
            "new_status": new_status,
        },
    )
    db.add(audit_log)

    db.commit()
    db.refresh(ticket)

    return ticket


def update_ticket_assignee(db: Session, ticket_id: UUID, assignee_user_id: UUID) -> Ticket:
    ticket = get_ticket_by_id(db, ticket_id)
    if ticket is None:
        raise LookupError("Ticket not found")

    assignee = db.get(User, assignee_user_id)
    if assignee is None:
        raise ValueError("assignee_user_id does not exist")

    if assignee.organization_id != ticket.organization_id:
        raise ValueError("assignee_user_id does not belong to ticket organization")

    if ticket.assignee_user_id == assignee_user_id:
        raise ValueError("assignee_user_id is already assigned to this ticket")

    old_assignee_user_id = (
        str(ticket.assignee_user_id) if ticket.assignee_user_id is not None else None
    )
    ticket.assignee_user_id = assignee_user_id

    audit_log = AuditLog(
        organization_id=ticket.organization_id,
        user_id=ticket.created_by_user_id,
        entity_type="ticket",
        entity_id=ticket.id,
        action="ticket_assignee_changed",
        metadata_={
            "old_assignee_user_id": old_assignee_user_id,
            "new_assignee_user_id": str(assignee_user_id),
        },
    )
    db.add(audit_log)

    db.commit()
    db.refresh(ticket)

    return ticket
