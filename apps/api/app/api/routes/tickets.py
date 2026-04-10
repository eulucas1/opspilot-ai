from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.comment import CommentCreateRequest, CommentRead
from app.schemas.audit_log import AuditLogRead
from app.schemas.ticket import (
    TicketAssigneeUpdateRequest,
    TicketCreateRequest,
    TicketRead,
    TicketStatusUpdateRequest,
)
from app.services.comment_service import create_ticket_comment, list_ticket_comments
from app.services.ticket_service import (
    create_ticket,
    get_ticket_by_id,
    list_ticket_activity,
    list_tickets,
    update_ticket_assignee,
    update_ticket_status,
)

router = APIRouter(prefix="/tickets")


@router.get("", response_model=list[TicketRead], summary="List tickets")
def get_tickets(
    ticket_status: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    organization_id: UUID | None = None,
    created_by_user_id: UUID | None = None,
    assignee_user_id: UUID | None = None,
    db: Session = Depends(get_db),
) -> list[TicketRead]:
    try:
        return list_tickets(
            db,
            status=ticket_status,
            priority=priority,
            organization_id=organization_id,
            created_by_user_id=created_by_user_id,
            assignee_user_id=assignee_user_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/{ticket_id}", response_model=TicketRead, summary="Get a ticket by id")
def get_ticket(ticket_id: UUID, db: Session = Depends(get_db)) -> TicketRead:
    ticket = get_ticket_by_id(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return ticket


@router.post("", response_model=TicketRead, status_code=status.HTTP_201_CREATED, summary="Create a ticket")
def post_ticket(payload: TicketCreateRequest, db: Session = Depends(get_db)) -> TicketRead:
    try:
        return create_ticket(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch(
    "/{ticket_id}/status",
    response_model=TicketRead,
    summary="Update a ticket status",
)
def patch_ticket_status(
    ticket_id: UUID,
    payload: TicketStatusUpdateRequest,
    db: Session = Depends(get_db),
) -> TicketRead:
    try:
        return update_ticket_status(db, ticket_id=ticket_id, new_status=payload.status)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch(
    "/{ticket_id}/assignee",
    response_model=TicketRead,
    summary="Assign a ticket to a user",
)
def patch_ticket_assignee(
    ticket_id: UUID,
    payload: TicketAssigneeUpdateRequest,
    db: Session = Depends(get_db),
) -> TicketRead:
    try:
        return update_ticket_assignee(
            db,
            ticket_id=ticket_id,
            assignee_user_id=payload.assignee_user_id,
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get(
    "/{ticket_id}/activity",
    response_model=list[AuditLogRead],
    summary="List activity for a ticket",
)
def get_ticket_activity(ticket_id: UUID, db: Session = Depends(get_db)) -> list[AuditLogRead]:
    try:
        return list_ticket_activity(db, ticket_id=ticket_id)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/{ticket_id}/comments",
    response_model=list[CommentRead],
    summary="List comments for a ticket",
)
def get_ticket_comments(ticket_id: UUID, db: Session = Depends(get_db)) -> list[CommentRead]:
    try:
        return list_ticket_comments(db, ticket_id=ticket_id)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/{ticket_id}/comments",
    response_model=CommentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a comment for a ticket",
)
def post_ticket_comment(
    ticket_id: UUID,
    payload: CommentCreateRequest,
    db: Session = Depends(get_db),
) -> CommentRead:
    try:
        return create_ticket_comment(db, ticket_id=ticket_id, payload=payload)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
