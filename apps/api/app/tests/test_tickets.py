from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

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


def seed_ticket(
    db_session: Session,
    *,
    status: str = "open",
    priority: str = "medium",
    updated_at: datetime | None = None,
) -> tuple[Organization, User, Ticket]:
    organization, user = seed_organization_and_user(db_session)
    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=user.id,
        title="Seeded ticket",
        description="Seeded description",
        status=status,
        priority=priority,
        updated_at=updated_at,
    )

    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)

    return organization, user, ticket


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
    _, _, ticket = seed_ticket(db_session)

    response = client.get(f"/tickets/{ticket.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(ticket.id)
    assert response.json()["title"] == "Seeded ticket"


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

    audit_log = db_session.scalar(select(AuditLog).where(AuditLog.entity_id == UUID(data["id"])))

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


def test_patch_ticket_status_updates_status_and_creates_audit_log(client, db_session: Session) -> None:
    old_timestamp = datetime.now(UTC) - timedelta(days=1)
    organization, user, ticket = seed_ticket(db_session, updated_at=old_timestamp)

    response = client.patch(
        f"/tickets/{ticket.id}/status",
        json={"status": "resolved"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(ticket.id)
    assert data["status"] == "resolved"

    db_session.refresh(ticket)
    assert ticket.updated_at > old_timestamp

    audit_log = db_session.scalar(
        select(AuditLog).where(
            AuditLog.entity_id == ticket.id,
            AuditLog.action == "ticket_status_changed",
        )
    )

    assert audit_log is not None
    assert audit_log.organization_id == organization.id
    assert audit_log.user_id == user.id
    assert audit_log.metadata_ == {
        "old_status": "open",
        "new_status": "resolved",
    }


def test_patch_ticket_status_returns_404_when_ticket_does_not_exist(client) -> None:
    response = client.patch(
        f"/tickets/{uuid4()}/status",
        json={"status": "resolved"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ticket not found"}


def test_patch_ticket_status_returns_400_when_status_is_invalid(client, db_session: Session) -> None:
    _, _, ticket = seed_ticket(db_session)

    response = client.patch(
        f"/tickets/{ticket.id}/status",
        json={"status": "pending"},
    )

    assert response.status_code == 400
    assert response.json() == {
        "detail": "status must be one of: open, in_progress, resolved, closed"
    }


def test_patch_ticket_status_returns_400_when_status_is_the_same(client, db_session: Session) -> None:
    _, _, ticket = seed_ticket(db_session, status="open")

    response = client.patch(
        f"/tickets/{ticket.id}/status",
        json={"status": "open"},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "status is already set to 'open'"}
