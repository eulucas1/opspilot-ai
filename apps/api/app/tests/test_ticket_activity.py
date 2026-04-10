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
        name="Activity Ops",
        slug=f"activity-org-{uuid4().hex[:8]}",
    )
    user = User(
        organization=organization,
        name="Activity User",
        email=f"activity-{uuid4().hex[:8]}@example.com",
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
    name: str,
) -> User:
    user = User(
        organization=organization,
        name=name,
        email=f"{name.lower().replace(' ', '-')}-{uuid4().hex[:8]}@example.com",
        role="analyst",
        is_active=True,
    )

    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    return user


def seed_ticket_without_activity(
    db_session: Session,
    *,
    organization: Organization,
    created_by_user: User,
) -> Ticket:
    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=created_by_user.id,
        title="Ticket without activity",
        description="Created directly in the database for activity tests",
        status="open",
        priority="medium",
    )

    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)

    return ticket


def create_ticket_via_api(client, organization: Organization, user: User) -> dict:
    response = client.post(
        "/tickets",
        json={
            "organization_id": str(organization.id),
            "created_by_user_id": str(user.id),
            "title": "Activity ticket",
            "description": "Seeded through the API",
            "priority": "medium",
        },
    )

    assert response.status_code == 201
    return response.json()


def test_get_ticket_activity_returns_empty_list_when_ticket_has_no_activity(
    client,
    db_session: Session,
) -> None:
    organization, user = seed_organization_and_user(db_session)
    ticket = seed_ticket_without_activity(
        db_session,
        organization=organization,
        created_by_user=user,
    )

    response = client.get(f"/tickets/{ticket.id}/activity")

    assert response.status_code == 200
    assert response.json() == []


def test_get_ticket_activity_returns_ticket_creation_event(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    ticket = create_ticket_via_api(client, organization, user)

    response = client.get(f"/tickets/{ticket['id']}/activity")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": response.json()[0]["id"],
            "action": "ticket_created",
            "entity_type": "ticket",
            "entity_id": ticket["id"],
            "user_id": str(user.id),
            "organization_id": str(organization.id),
            "metadata": None,
            "created_at": response.json()[0]["created_at"],
        }
    ]


def test_get_ticket_activity_returns_status_change_event(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    ticket = create_ticket_via_api(client, organization, user)

    status_response = client.patch(
        f"/tickets/{ticket['id']}/status",
        json={"status": "resolved"},
    )
    assert status_response.status_code == 200

    response = client.get(f"/tickets/{ticket['id']}/activity")

    assert response.status_code == 200
    status_event = next(item for item in response.json() if item["action"] == "ticket_status_changed")
    assert status_event["entity_type"] == "ticket"
    assert status_event["entity_id"] == ticket["id"]
    assert status_event["user_id"] == str(user.id)
    assert status_event["organization_id"] == str(organization.id)
    assert status_event["metadata"] == {
        "old_status": "open",
        "new_status": "resolved",
    }


def test_get_ticket_activity_returns_assignee_change_event(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    assignee = seed_user_in_organization(db_session, organization, name="Assigned User")
    ticket = create_ticket_via_api(client, organization, user)

    assignee_response = client.patch(
        f"/tickets/{ticket['id']}/assignee",
        json={"assignee_user_id": str(assignee.id)},
    )
    assert assignee_response.status_code == 200

    response = client.get(f"/tickets/{ticket['id']}/activity")

    assert response.status_code == 200
    assignee_event = next(
        item for item in response.json() if item["action"] == "ticket_assignee_changed"
    )
    assert assignee_event["entity_type"] == "ticket"
    assert assignee_event["entity_id"] == ticket["id"]
    assert assignee_event["metadata"] == {
        "old_assignee_user_id": None,
        "new_assignee_user_id": str(assignee.id),
    }


def test_get_ticket_activity_returns_comment_event(client, db_session: Session) -> None:
    organization, user = seed_organization_and_user(db_session)
    ticket = create_ticket_via_api(client, organization, user)

    comment_response = client.post(
        f"/tickets/{ticket['id']}/comments",
        json={
            "organization_id": str(organization.id),
            "user_id": str(user.id),
            "content": "Investigating the incident.",
        },
    )
    assert comment_response.status_code == 201
    comment = comment_response.json()

    response = client.get(f"/tickets/{ticket['id']}/activity")

    assert response.status_code == 200
    comment_event = next(item for item in response.json() if item["action"] == "ticket_comment_created")
    assert comment_event["entity_type"] == "ticket_comment"
    assert comment_event["entity_id"] == comment["id"]
    assert comment_event["user_id"] == str(user.id)
    assert comment_event["organization_id"] == str(organization.id)
    assert comment_event["metadata"] is None


def test_get_ticket_activity_returns_events_in_chronological_order(
    client,
    db_session: Session,
) -> None:
    organization, user = seed_organization_and_user(db_session)
    assignee = seed_user_in_organization(db_session, organization, name="Assigned Analyst")
    ticket = create_ticket_via_api(client, organization, user)
    ticket_id = UUID(ticket["id"])

    status_response = client.patch(
        f"/tickets/{ticket['id']}/status",
        json={"status": "in_progress"},
    )
    assert status_response.status_code == 200

    assignee_response = client.patch(
        f"/tickets/{ticket['id']}/assignee",
        json={"assignee_user_id": str(assignee.id)},
    )
    assert assignee_response.status_code == 200

    comment_response = client.post(
        f"/tickets/{ticket['id']}/comments",
        json={
            "organization_id": str(organization.id),
            "user_id": str(user.id),
            "content": "First update on the ticket.",
        },
    )
    assert comment_response.status_code == 201
    comment_id = UUID(comment_response.json()["id"])

    created_event = db_session.scalar(
        select(AuditLog).where(
            AuditLog.entity_type == "ticket",
            AuditLog.entity_id == ticket_id,
            AuditLog.action == "ticket_created",
        )
    )
    status_event = db_session.scalar(
        select(AuditLog).where(
            AuditLog.entity_type == "ticket",
            AuditLog.entity_id == ticket_id,
            AuditLog.action == "ticket_status_changed",
        )
    )
    assignee_event = db_session.scalar(
        select(AuditLog).where(
            AuditLog.entity_type == "ticket",
            AuditLog.entity_id == ticket_id,
            AuditLog.action == "ticket_assignee_changed",
        )
    )
    comment_event = db_session.scalar(
        select(AuditLog).where(
            AuditLog.entity_type == "ticket_comment",
            AuditLog.entity_id == comment_id,
            AuditLog.action == "ticket_comment_created",
        )
    )

    base_time = datetime.now(UTC) - timedelta(days=1)
    assert created_event is not None
    assert status_event is not None
    assert assignee_event is not None
    assert comment_event is not None

    created_event.created_at = base_time
    status_event.created_at = base_time + timedelta(minutes=1)
    assignee_event.created_at = base_time + timedelta(minutes=2)
    comment_event.created_at = base_time + timedelta(minutes=3)
    db_session.commit()

    response = client.get(f"/tickets/{ticket['id']}/activity")

    assert response.status_code == 200
    assert [item["action"] for item in response.json()] == [
        "ticket_created",
        "ticket_status_changed",
        "ticket_assignee_changed",
        "ticket_comment_created",
    ]


def test_get_ticket_activity_returns_404_when_ticket_does_not_exist(client) -> None:
    response = client.get(f"/tickets/{uuid4()}/activity")

    assert response.status_code == 404
    assert response.json() == {"detail": "Ticket not found"}
