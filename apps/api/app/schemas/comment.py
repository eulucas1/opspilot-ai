from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import TimestampedSchema


class CommentCreateRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "user_id": "22222222-2222-2222-2222-222222222222",
                "content": "Investigating the issue with the payments provider.",
            }
        }
    )

    organization_id: UUID = Field(description="Organization that owns the ticket comment.")
    user_id: UUID = Field(description="User responsible for creating the comment.")
    content: str = Field(
        min_length=1,
        description="Comment content stored in the ticket timeline.",
    )


class CommentRead(TimestampedSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "55555555-5555-5555-5555-555555555555",
                "ticket_id": "44444444-4444-4444-4444-444444444444",
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "user_id": "22222222-2222-2222-2222-222222222222",
                "content": "Investigating the issue with the payments provider.",
                "created_at": "2026-04-10T13:10:00Z",
                "updated_at": "2026-04-10T13:10:00Z",
            }
        },
    )

    ticket_id: UUID = Field(description="Ticket that owns the comment.")
    organization_id: UUID = Field(description="Organization that owns the comment.")
    user_id: UUID = Field(description="User that created the comment.")
    content: str = Field(description="Comment body.")
