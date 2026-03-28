from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.comment import Comment
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.comment import CommentCreateRequest


def list_ticket_comments(db: Session, ticket_id: UUID) -> list[Comment]:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise LookupError("Ticket not found")

    statement = (
        select(Comment)
        .where(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.asc())
    )
    return list(db.scalars(statement).all())


def create_ticket_comment(db: Session, ticket_id: UUID, payload: CommentCreateRequest) -> Comment:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise LookupError("Ticket not found")

    organization = db.get(Organization, payload.organization_id)
    if organization is None:
        raise ValueError("organization_id does not exist")

    user = db.get(User, payload.user_id)
    if user is None:
        raise ValueError("user_id does not exist")

    if ticket.organization_id != payload.organization_id:
        raise ValueError("organization_id does not match ticket organization")

    if user.organization_id != payload.organization_id:
        raise ValueError("user_id does not belong to organization_id")

    comment = Comment(
        ticket_id=ticket_id,
        organization_id=payload.organization_id,
        user_id=payload.user_id,
        content=payload.content,
    )
    db.add(comment)
    db.flush()

    audit_log = AuditLog(
        organization_id=payload.organization_id,
        user_id=payload.user_id,
        entity_type="ticket_comment",
        entity_id=comment.id,
        action="ticket_comment_created",
    )
    db.add(audit_log)

    db.commit()
    db.refresh(comment)

    return comment
