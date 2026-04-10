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


def seed_user_in_organization(
    db_session: Session,
    organization: Organization,
    *,
    name: str = "Support User",
    role: str = "analyst",
) -> User:
    user = User(
        organization=organization,
        name=name,
        email=f"{name.lower().replace(' ', '-')}-{uuid4().hex[:8]}@example.com",
        role=role,
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def seed_ticket(
    db_session: Session,
    *,
    status: str = "open",
    priority: str = "medium",
    assignee_user_id: UUID | None = None,
    updated_at: datetime | None = None,
) -> tuple[Organization, User, Ticket]:
    organization, user = seed_organization_and_user(db_session)
    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=user.id,
        assignee_user_id=assignee_user_id,
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


def create_ticket_record(
    db_session: Session,
    *,
    organization: Organization,
    created_by_user: User,
    title: str,
    description: str = "Seeded description",
    status: str = "open",
    priority: str = "medium",
    assignee_user_id: UUID | None = None,
    created_at: datetime | None = None,
) -> Ticket:
    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=created_by_user.id,
        assignee_user_id=assignee_user_id,
        title=title,
        description=description,
        status=status,
        priority=priority,
        created_at=created_at,
    )

    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)

    return ticket


def test_get_tickets_returns_most_recent_first(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Older ticket",
        description="Older description",
        status="open",
        priority="low",
        created_at=datetime.now(UTC) - timedelta(days=1),
    )
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Newer ticket",
        description="Newer description",
        status="open",
        priority="high",
        created_at=datetime.now(UTC),
    )

    response = client.get("/tickets")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == ["Newer ticket", "Older ticket"]


def test_get_tickets_filters_by_status(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Open ticket",
        status="open",
    )
    matching_ticket = create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Resolved ticket",
        status="resolved",
    )

    response = client.get("/tickets", params={"status": "resolved"})

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [str(matching_ticket.id)]


def test_get_tickets_filters_by_priority(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Low priority ticket",
        priority="low",
    )
    matching_ticket = create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="High priority ticket",
        priority="high",
    )

    response = client.get("/tickets", params={"priority": "high"})

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [str(matching_ticket.id)]


def test_get_tickets_filters_by_organization_id(client, db_session: Session) -> None:
    matching_organization, matching_user = seed_organization_and_user(db_session)
    other_organization, other_user = seed_organization_and_user(db_session)
    matching_ticket = create_ticket_record(
        db_session,
        organization=matching_organization,
        created_by_user=matching_user,
        title="Matching organization ticket",
    )
    create_ticket_record(
        db_session,
        organization=other_organization,
        created_by_user=other_user,
        title="Other organization ticket",
    )

    response = client.get(
        "/tickets",
        params={"organization_id": str(matching_organization.id)},
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [str(matching_ticket.id)]


def test_get_tickets_filters_by_created_by_user_id(client, db_session: Session) -> None:
    organization, created_by_user = seed_organization_and_user(db_session)
    other_user = seed_user_in_organization(db_session, organization, name="Second User")
    matching_ticket = create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=created_by_user,
        title="Creator match ticket",
    )
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=other_user,
        title="Other creator ticket",
    )

    response = client.get(
        "/tickets",
        params={"created_by_user_id": str(created_by_user.id)},
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [str(matching_ticket.id)]


def test_get_tickets_filters_by_assignee_user_id(client, db_session: Session) -> None:
    organization, created_by_user = seed_organization_and_user(db_session)
    matching_assignee = seed_user_in_organization(db_session, organization, name="Assigned Analyst")
    other_assignee = seed_user_in_organization(db_session, organization, name="Other Analyst")
    matching_ticket = create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=created_by_user,
        title="Matching assignee ticket",
        assignee_user_id=matching_assignee.id,
    )
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=created_by_user,
        title="Other assignee ticket",
        assignee_user_id=other_assignee.id,
    )

    response = client.get(
        "/tickets",
        params={"assignee_user_id": str(matching_assignee.id)},
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [str(matching_ticket.id)]


def test_get_tickets_filters_by_status_and_priority(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    matching_ticket = create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Resolved high ticket",
        status="resolved",
        priority="high",
    )
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Resolved low ticket",
        status="resolved",
        priority="low",
    )
    create_ticket_record(
        db_session,
        organization=organization,
        created_by_user=user,
        title="Open high ticket",
        status="open",
        priority="high",
    )

    response = client.get(
        "/tickets",
        params={
            "status": "resolved",
            "priority": "high",
        },
    )

    assert response.status_code == 200
    assert [item["id"] for item in response.json()] == [str(matching_ticket.id)]


def test_get_tickets_returns_400_when_status_filter_is_invalid(client) -> None:
    response = client.get("/tickets", params={"status": "pending"})

    assert response.status_code == 400
    assert response.json() == {
        "detail": "status must be one of: open, in_progress, resolved, closed"
    }


def test_get_tickets_returns_400_when_priority_filter_is_invalid(client) -> None:
    response = client.get("/tickets", params={"priority": "urgent"})

    assert response.status_code == 400
    assert response.json() == {
        "detail": "priority must be one of: low, medium, high"
    }


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


def test_patch_ticket_assignee_assigns_user_and_creates_audit_log(client, db_session: Session) -> None:
    old_timestamp = datetime.now(UTC) - timedelta(days=1)
    organization, created_by_user, ticket = seed_ticket(db_session, updated_at=old_timestamp)
    assignee = User(
        organization=organization,
        name="Assigned User",
        email=f"assigned-{uuid4().hex[:8]}@example.com",
        role="analyst",
        is_active=True,
    )
    db_session.add(assignee)
    db_session.commit()
    db_session.refresh(assignee)

    response = client.patch(
        f"/tickets/{ticket.id}/assignee",
        json={"assignee_user_id": str(assignee.id)},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(ticket.id)
    assert data["assignee_user_id"] == str(assignee.id)

    db_session.refresh(ticket)
    assert ticket.assignee_user_id == assignee.id
    assert ticket.updated_at > old_timestamp

    audit_log = db_session.scalar(
        select(AuditLog).where(
            AuditLog.entity_id == ticket.id,
            AuditLog.action == "ticket_assignee_changed",
        )
    )

    assert audit_log is not None
    assert audit_log.organization_id == organization.id
    assert audit_log.user_id == created_by_user.id
    assert audit_log.metadata_ == {
        "old_assignee_user_id": None,
        "new_assignee_user_id": str(assignee.id),
    }


def test_patch_ticket_assignee_returns_404_when_ticket_does_not_exist(client) -> None:
    response = client.patch(
        f"/tickets/{uuid4()}/assignee",
        json={"assignee_user_id": str(uuid4())},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ticket not found"}


def test_patch_ticket_assignee_returns_400_when_user_does_not_exist(client, db_session: Session) -> None:
    _, _, ticket = seed_ticket(db_session)

    response = client.patch(
        f"/tickets/{ticket.id}/assignee",
        json={"assignee_user_id": str(uuid4())},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "assignee_user_id does not exist"}


def test_patch_ticket_assignee_returns_400_when_user_is_from_other_organization(
    client,
    db_session: Session,
) -> None:
    _, _, ticket = seed_ticket(db_session)
    other_organization = Organization(
        name="Other Org",
        slug=f"other-org-{uuid4().hex[:8]}",
    )
    other_user = User(
        organization=other_organization,
        name="External User",
        email=f"external-{uuid4().hex[:8]}@example.com",
        role="analyst",
        is_active=True,
    )
    db_session.add_all([other_organization, other_user])
    db_session.commit()
    db_session.refresh(other_user)

    response = client.patch(
        f"/tickets/{ticket.id}/assignee",
        json={"assignee_user_id": str(other_user.id)},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "assignee_user_id does not belong to ticket organization"}


def test_patch_ticket_assignee_returns_400_when_assignee_is_the_same(client, db_session: Session) -> None:
    organization, _ = seed_organization_and_user(db_session)
    assignee = User(
        organization=organization,
        name="Repeated Assignee",
        email=f"repeat-{uuid4().hex[:8]}@example.com",
        role="analyst",
        is_active=True,
    )
    db_session.add(assignee)
    db_session.commit()
    db_session.refresh(assignee)

    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=assignee.id,
        assignee_user_id=assignee.id,
        title="Already assigned",
        description="Ticket already assigned to the same user",
        status="open",
        priority="medium",
    )
    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)

    response = client.patch(
        f"/tickets/{ticket.id}/assignee",
        json={"assignee_user_id": str(assignee.id)},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "assignee_user_id is already assigned to this ticket"}
