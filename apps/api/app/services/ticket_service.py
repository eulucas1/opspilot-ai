from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreateRequest


def list_tickets(db: Session) -> list[Ticket]:
    statement = select(Ticket).order_by(Ticket.created_at.desc())
    return list(db.scalars(statement).all())


def get_ticket_by_id(db: Session, ticket_id: UUID) -> Ticket | None:
    return db.get(Ticket, ticket_id)


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
