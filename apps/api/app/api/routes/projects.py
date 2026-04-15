from uuid import UUID

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.error import ErrorResponse, ValidationErrorResponse
from app.schemas.project import ProjectCreateRequest, ProjectRead
from app.services.project_service import create_project, get_project_by_id, list_projects

router = APIRouter(prefix="/projects")


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
    response_model=list[ProjectRead],
    status_code=status.HTTP_200_OK,
    summary="List projects",
    description="Return projects ordered by most recent creation first.",
    response_description="List of projects.",
    responses={
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def get_projects(db: Session = Depends(get_db)) -> list[ProjectRead]:
    return list_projects(db)


@router.get(
    "/{project_id}",
    response_model=ProjectRead,
    status_code=status.HTTP_200_OK,
    summary="Get project details",
    description="Return a single project by its identifier.",
    response_description="Project details.",
    responses={
        404: error_response("The requested project was not found.", "Project not found"),
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def get_project(project_id: UUID, db: Session = Depends(get_db)) -> ProjectRead:
    project = get_project_by_id(db, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return project


@router.post(
    "",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create project",
    description="Create a new project inside an organization.",
    response_description="Created project.",
    responses={
        400: error_response(
            "The request violates business validation rules for project creation.",
            "slug already exists for this organization",
        ),
        422: VALIDATION_ERROR_RESPONSE,
    },
)
def post_project(payload: ProjectCreateRequest, db: Session = Depends(get_db)) -> ProjectRead:
    try:
        return create_project(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
