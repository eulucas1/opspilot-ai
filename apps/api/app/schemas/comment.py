from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedSchema


class CommentCreateRequest(BaseModel):
    organization_id: UUID
    user_id: UUID
    content: str = Field(min_length=1)


class CommentRead(TimestampedSchema):
    ticket_id: UUID
    organization_id: UUID
    user_id: UUID
    content: str
