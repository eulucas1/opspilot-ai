from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.ticket import TicketCreateRequest, TicketRead
from app.services.ticket_service import create_ticket, get_ticket_by_id, list_tickets

router = APIRouter(prefix="/tickets")


@router.get("", response_model=list[TicketRead], summary="List tickets")
def get_tickets(db: Session = Depends(get_db)) -> list[TicketRead]:
    return list_tickets(db)


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
