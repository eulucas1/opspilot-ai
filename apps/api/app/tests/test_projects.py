from datetime import UTC, datetime, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.project import Project


def seed_organization(db_session: Session) -> Organization:
    organization = Organization(
        name="Projects Org",
        slug=f"projects-org-{uuid4().hex[:8]}",
    )
    db_session.add(organization)
    db_session.commit()
    db_session.refresh(organization)

    return organization


def create_project_record(
    db_session: Session,
    *,
    organization: Organization,
    name: str,
    slug: str,
    key: str,
    description: str | None = None,
    created_at: datetime | None = None,
) -> Project:
    project = Project(
        organization_id=organization.id,
        name=name,
        slug=slug,
        key=key,
        description=description,
        created_at=created_at,
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    return project


def test_post_projects_creates_project(client, db_session: Session) -> None:
    organization = seed_organization(db_session)

    response = client.post(
        "/projects",
        json={
            "organization_id": str(organization.id),
            "name": "Payments",
            "slug": "payments",
            "key": "PAY",
            "description": "Operational project for payment flows.",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["organization_id"] == str(organization.id)
    assert data["name"] == "Payments"
    assert data["slug"] == "payments"
    assert data["key"] == "PAY"
    assert data["description"] == "Operational project for payment flows."
    assert data["is_active"] is True


def test_get_projects_returns_most_recent_first(client, db_session: Session) -> None:
    organization = seed_organization(db_session)
    create_project_record(
        db_session,
        organization=organization,
        name="Older Project",
        slug="older-project",
        key="OLD",
        created_at=datetime.now(UTC) - timedelta(days=1),
    )
    create_project_record(
        db_session,
        organization=organization,
        name="Newer Project",
        slug="newer-project",
        key="NEW",
        created_at=datetime.now(UTC),
    )

    response = client.get("/projects")

    assert response.status_code == 200
    assert [item["name"] for item in response.json()] == ["Newer Project", "Older Project"]


def test_get_project_by_id_returns_project(client, db_session: Session) -> None:
    organization = seed_organization(db_session)
    project = create_project_record(
        db_session,
        organization=organization,
        name="Platform",
        slug="platform",
        key="PLT",
    )

    response = client.get(f"/projects/{project.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(project.id)
    assert response.json()["name"] == "Platform"


def test_get_project_by_id_returns_404_when_missing(client) -> None:
    response = client.get(f"/projects/{uuid4()}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}


def test_post_projects_returns_400_when_organization_does_not_exist(client) -> None:
    response = client.post(
        "/projects",
        json={
            "organization_id": str(uuid4()),
            "name": "Invalid Org",
            "slug": "invalid-org",
            "key": "INV",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "organization_id does not exist"}


def test_post_projects_returns_400_when_slug_conflicts_in_same_organization(
    client,
    db_session: Session,
) -> None:
    organization = seed_organization(db_session)
    create_project_record(
        db_session,
        organization=organization,
        name="Existing Project",
        slug="ops-core",
        key="OPS",
    )

    response = client.post(
        "/projects",
        json={
            "organization_id": str(organization.id),
            "name": "Another Project",
            "slug": "ops-core",
            "key": "ANO",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "slug already exists for this organization"}


def test_post_projects_returns_400_when_key_conflicts_in_same_organization(
    client,
    db_session: Session,
) -> None:
    organization = seed_organization(db_session)
    create_project_record(
        db_session,
        organization=organization,
        name="Existing Project",
        slug="existing-project",
        key="OPS",
    )

    response = client.post(
        "/projects",
        json={
            "organization_id": str(organization.id),
            "name": "Another Project",
            "slug": "another-project",
            "key": "OPS",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "key already exists for this organization"}
