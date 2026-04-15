from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.models.project import Project
from app.schemas.project import ProjectCreateRequest


def list_projects(db: Session) -> list[Project]:
    statement = select(Project).order_by(Project.created_at.desc())
    return list(db.scalars(statement).all())


def get_project_by_id(db: Session, project_id: UUID) -> Project | None:
    return db.get(Project, project_id)


def create_project(db: Session, payload: ProjectCreateRequest) -> Project:
    organization = db.get(Organization, payload.organization_id)
    if organization is None:
        raise ValueError("organization_id does not exist")

    existing_slug = db.scalar(
        select(Project.id).where(
            Project.organization_id == payload.organization_id,
            Project.slug == payload.slug,
        )
    )
    if existing_slug is not None:
        raise ValueError("slug already exists for this organization")

    existing_key = db.scalar(
        select(Project.id).where(
            Project.organization_id == payload.organization_id,
            Project.key == payload.key,
        )
    )
    if existing_key is not None:
        raise ValueError("key already exists for this organization")

    project = Project(
        organization_id=payload.organization_id,
        name=payload.name,
        slug=payload.slug,
        key=payload.key,
        description=payload.description,
        is_active=True,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return project
