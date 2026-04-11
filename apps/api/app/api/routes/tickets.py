from uuid import UUID

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.audit_log import AuditLogRead
from app.schemas.comment import CommentCreateRequest, CommentRead
from app.schemas.error import ErrorResponse, ValidationErrorResponse
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


def error_response(description: str, example_detail: str) -> dict[str, Any]:
    return {
        "model": ErrorResponse,
        "description": description,
        "content": {
            "application/json": {
                "example": {
                    "detail": example_detail,
                }
            }
        },
    }


VALIDATION_ERROR_RESPONSE = {
    "model": ValidationErrorResponse,
    "description": "The request payload, path parameters or query parameters could not be validated.",
}


@router.get(
    "",
    response_model=list[TicketRead],
    status_code=status.HTTP_200_OK,
    summary="List tickets",
    description=(
        "Return tickets ordered by most recent creation first. All query filters are optional "
        "and can be combined."
    ),
    response_description="List of tickets that match the provided filters.",
    responses={
        400: error_response(
            "The provided ticket filters are syntactically valid but semantically invalid.",
            "status must be one of: open, in_progress, resolved, closed",
        ),
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def get_tickets(
    ticket_status: str | None = Query(
        default=None,
        alias="status",
        description="Filter by ticket status. Allowed values: open, in_progress, resolved or closed.",
        examples=["open"],
    ),
    priority: str | None = Query(
        default=None,
        description="Filter by ticket priority. Allowed values: low, medium or high.",
        examples=["high"],
    ),
    organization_id: UUID | None = Query(
        default=None,
        description="Filter tickets by organization identifier.",
    ),
    created_by_user_id: UUID | None = Query(
        default=None,
        description="Filter tickets by the user that created them.",
    ),
    assignee_user_id: UUID | None = Query(
        default=None,
        description="Filter tickets by the current assignee user identifier.",
    ),
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


@router.get(
    "/{ticket_id}",
    response_model=TicketRead,
    status_code=status.HTTP_200_OK,
    summary="Get ticket details",
    description="Return a single ticket by its identifier.",
    response_description="Ticket details.",
    responses={
        404: error_response("The requested ticket was not found.", "Ticket not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def get_ticket(ticket_id: UUID, db: Session = Depends(get_db)) -> TicketRead:
    ticket = get_ticket_by_id(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    return ticket


@router.post(
    "",
    response_model=TicketRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create ticket",
    description="Create a new ticket with initial status `open`.",
    response_description="Created ticket.",
    responses={
        400: error_response(
            "The request violates business validation rules for ticket creation.",
            "created_by_user_id does not belong to organization_id",
        ),
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def post_ticket(payload: TicketCreateRequest, db: Session = Depends(get_db)) -> TicketRead:
    try:
        return create_ticket(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch(
    "/{ticket_id}/status",
    response_model=TicketRead,
    status_code=status.HTTP_200_OK,
    summary="Update ticket status",
    description="Update the lifecycle status of an existing ticket.",
    response_description="Updated ticket after the status change.",
    responses={
        400: error_response(
            "The request violates business validation rules for ticket status changes.",
            "status is already set to 'open'",
        ),
        404: error_response("The requested ticket was not found.", "Ticket not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
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
    status_code=status.HTTP_200_OK,
    summary="Update ticket assignee",
    description="Assign or change the responsible user for an existing ticket.",
    response_description="Updated ticket after the assignee change.",
    responses={
        400: error_response(
            "The request violates business validation rules for ticket assignment.",
            "assignee_user_id does not belong to ticket organization",
        ),
        404: error_response("The requested ticket was not found.", "Ticket not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
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
    status_code=status.HTTP_200_OK,
    summary="List ticket activity",
    description=(
        "Return the consolidated activity history for a ticket using `AuditLog`, including "
        "ticket-level events and comment-related events."
    ),
    response_description="Chronological list of activity events for the ticket.",
    responses={
        404: error_response("The requested ticket was not found.", "Ticket not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def get_ticket_activity(ticket_id: UUID, db: Session = Depends(get_db)) -> list[AuditLogRead]:
    try:
        return list_ticket_activity(db, ticket_id=ticket_id)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get(
    "/{ticket_id}/comments",
    response_model=list[CommentRead],
    status_code=status.HTTP_200_OK,
    summary="List ticket comments",
    description="Return ticket comments ordered from oldest to newest.",
    response_description="Chronological list of comments for the ticket.",
    responses={
        404: error_response("The requested ticket was not found.", "Ticket not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
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
    summary="Create ticket comment",
    description="Create a new comment for a ticket and register the action in the audit log.",
    response_description="Created comment.",
    responses={
        400: error_response(
            "The request violates business validation rules for ticket comments.",
            "organization_id does not match ticket organization",
        ),
        404: error_response("The requested ticket was not found.", "Ticket not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
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
