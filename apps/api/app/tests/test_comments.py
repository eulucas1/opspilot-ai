from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.comment import Comment
from app.models.organization import Organization
from app.models.ticket import Ticket
from app.models.user import User


def seed_organization_and_user(db_session: Session) -> tuple[Organization, User]:
    organization = Organization(
        name="Comment Ops",
        slug=f"comment-org-{uuid4().hex[:8]}",
    )
    user = User(
        organization=organization,
        name="Comment User",
        email=f"comment-{uuid4().hex[:8]}@example.com",
        role="analyst",
        is_active=True,
    )

    db_session.add_all([organization, user])
    db_session.commit()
    db_session.refresh(organization)
    db_session.refresh(user)

    return organization, user


def seed_ticket(db_session: Session) -> tuple[Organization, User, Ticket]:
    organization, user = seed_organization_and_user(db_session)
    ticket = Ticket(
        organization_id=organization.id,
        created_by_user_id=user.id,
        title="Ticket with comments",
        description="Seeded ticket for comment tests",
        status="open",
        priority="medium",
    )

    db_session.add(ticket)
    db_session.commit()
    db_session.refresh(ticket)

    return organization, user, ticket


def test_get_ticket_comments_returns_empty_list(client, db_session: Session) -> None:
    _, _, ticket = seed_ticket(db_session)

    response = client.get(f"/tickets/{ticket.id}/comments")

    assert response.status_code == 200
    assert response.json() == []


def test_post_ticket_comments_creates_comment_and_audit_log(client, db_session: Session) -> None:
    organization, user, ticket = seed_ticket(db_session)

    response = client.post(
        f"/tickets/{ticket.id}/comments",
        json={
            "organization_id": str(organization.id),
            "user_id": str(user.id),
            "content": "First internal note.",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["ticket_id"] == str(ticket.id)
    assert data["organization_id"] == str(organization.id)
    assert data["user_id"] == str(user.id)
    assert data["content"] == "First internal note."

    audit_log = db_session.scalar(select(AuditLog).where(AuditLog.entity_id == UUID(data["id"])))

    assert audit_log is not None
    assert audit_log.organization_id == organization.id
    assert audit_log.user_id == user.id
    assert audit_log.entity_type == "ticket_comment"
    assert audit_log.action == "ticket_comment_created"


def test_get_ticket_comments_returns_created_item_in_oldest_first_order(client, db_session: Session) -> None:
    organization, user, ticket = seed_ticket(db_session)
    older_comment = Comment(
        ticket_id=ticket.id,
        organization_id=organization.id,
        user_id=user.id,
        content="Older comment",
        created_at=datetime.now(UTC) - timedelta(days=1),
    )
    newer_comment = Comment(
        ticket_id=ticket.id,
        organization_id=organization.id,
        user_id=user.id,
        content="Newer comment",
        created_at=datetime.now(UTC),
    )

    db_session.add_all([older_comment, newer_comment])
    db_session.commit()

    response = client.get(f"/tickets/{ticket.id}/comments")

    assert response.status_code == 200
    assert [item["content"] for item in response.json()] == ["Older comment", "Newer comment"]


def test_get_ticket_comments_returns_404_when_ticket_does_not_exist(client) -> None:
    response = client.get(f"/tickets/{uuid4()}/comments")

    assert response.status_code == 404
    assert response.json() == {"detail": "Ticket not found"}


def test_post_ticket_comments_returns_404_when_ticket_does_not_exist(client) -> None:
    response = client.post(
        f"/tickets/{uuid4()}/comments",
        json={
            "organization_id": str(uuid4()),
            "user_id": str(uuid4()),
            "content": "Should fail because ticket does not exist.",
        },
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Ticket not found"}


def test_post_ticket_comments_returns_400_when_user_id_does_not_exist(client, db_session: Session) -> None:
    organization, _, ticket = seed_ticket(db_session)

    response = client.post(
        f"/tickets/{ticket.id}/comments",
        json={
            "organization_id": str(organization.id),
            "user_id": str(uuid4()),
            "content": "Missing user.",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "user_id does not exist"}


def test_post_ticket_comments_returns_400_when_organization_id_does_not_exist(client, db_session: Session) -> None:
    _, user, ticket = seed_ticket(db_session)

    response = client.post(
        f"/tickets/{ticket.id}/comments",
        json={
            "organization_id": str(uuid4()),
            "user_id": str(user.id),
            "content": "Missing organization.",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "organization_id does not exist"}
