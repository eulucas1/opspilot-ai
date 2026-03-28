from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedSchema


class TicketCreateRequest(BaseModel):
    organization_id: UUID
    created_by_user_id: UUID
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    priority: str = Field(min_length=1, max_length=100)


class TicketStatusUpdateRequest(BaseModel):
    status: str = Field(min_length=1, max_length=100)


class TicketAssigneeUpdateRequest(BaseModel):
    assignee_user_id: UUID


class TicketRead(TimestampedSchema):
    organization_id: UUID
    created_by_user_id: UUID
    assignee_user_id: UUID | None
    title: str
    description: str
    status: str
    priority: str
