from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.models.user import User


def seed_organization_and_user(db_session: Session) -> tuple[Organization, User]:
    organization = Organization(
        name="Acme Ops",
        slug=f"acme-{uuid4().hex[:8]}",
    )
    user = User(
        organization=organization,
        name="Jane Doe",
        email=f"jane-{uuid4().hex[:8]}@example.com",
        role="analyst",
        is_active=True,
    )

    db_session.add_all([organization, user])
    db_session.commit()
    db_session.refresh(organization)
    db_session.refresh(user)

    return organization, user


def test_get_tickets_returns_most_recent_first(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    older_ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=user.id,
        title="Older ticket",
        description="Older description",
        status="open",
        priority="low",
        created_at=datetime.now(UTC) - timedelta(days=1),
    )
    newer_ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=user.id,
        title="Newer ticket",
        description="Newer description",
        status="open",
        priority="high",
        created_at=datetime.now(UTC),
    )

    db_session.add_all([older_ticket, newer_ticket])
    db_session.commit()

    response = client.get("/tickets")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["Newer ticket", "Older ticket"]


def test_get_ticket_by_id_returns_ticket(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=user.id,
        title="Connectivity issue",
        description="Customer cannot access dashboard",
        status="open",
        priority="medium",
    )

    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)

    response = client.get(f"/tickets/{ticket.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(ticket.id)
    assert response.json()["title"] == "Connectivity issue"


def test_get_ticket_by_id_returns_404_when_missing(client) -> None:
    response = client.get(f"/tickets/{uuid4()}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Ticket not found"}


def test_post_tickets_creates_ticket_and_audit_log(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)

    response = client.post(
        "/tickets",
        json={
            "organization_id": str(organization.id),
            "created_by_user_id": str(user.id),
            "title": "Payment retry failure",
            "description": "Retry queue stopped processing",
            "priority": "high",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["organization_id"] == str(organization.id)
    assert data["created_by_user_id"] == str(user.id)
    assert data["title"] == "Payment retry failure"
    assert data["status"] == "open"
    assert data["priority"] == "high"

    audit_log = db_session.scalar(select(AuditLog).where(AuditLog.entity_id == data["id"]))

    assert audit_log is not None
    assert audit_log.organization_id == organization.id
    assert audit_log.user_id == user.id
    assert audit_log.entity_type == "ticket"
    assert audit_log.action == "ticket_created"


def test_post_tickets_returns_400_when_organization_does_not_exist(client, db_session: Session) -> None:
    _, user = seed_organization_and_user(db_session)

    response = client.post(
        "/tickets",
        json={
            "organization_id": str(uuid4()),
            "created_by_user_id": str(user.id),
            "title": "Invalid organization",
            "description": "This should fail",
            "priority": "low",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "organization_id does not exist"}
