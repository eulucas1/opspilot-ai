from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import TimestampedSchema


class TicketCreateRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "created_by_user_id": "22222222-2222-2222-2222-222222222222",
                "title": "Payment retry queue stopped",
                "description": "Retry queue stopped processing failed payments after the latest deployment.",
                "priority": "high",
            }
        }
    )

    organization_id: UUID = Field(description="Organization that owns the ticket.")
    created_by_user_id: UUID = Field(description="User responsible for creating the ticket.")
    title: str = Field(
        min_length=1,
        max_length=255,
        description="Short title that summarizes the ticket.",
    )
    description: str = Field(
        min_length=1,
        description="Detailed description of the issue or operational request.",
    )
    priority: str = Field(
        min_length=1,
        max_length=100,
        description="Ticket priority. Expected values: low, medium or high.",
    )


class TicketStatusUpdateRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "in_progress",
            }
        }
    )

    status: str = Field(
        min_length=1,
        max_length=100,
        description="New ticket status. Allowed values: open, in_progress, resolved or closed.",
    )


class TicketAssigneeUpdateRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "assignee_user_id": "33333333-3333-3333-3333-333333333333",
            }
        }
    )

    assignee_user_id: UUID = Field(
        description="User that should become the current assignee for the ticket."
    )


class TicketRead(TimestampedSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "44444444-4444-4444-4444-444444444444",
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "created_by_user_id": "22222222-2222-2222-2222-222222222222",
                "assignee_user_id": "33333333-3333-3333-3333-333333333333",
                "title": "Payment retry queue stopped",
                "description": "Retry queue stopped processing failed payments after the latest deployment.",
                "status": "open",
                "priority": "high",
                "created_at": "2026-04-10T13:00:00Z",
                "updated_at": "2026-04-10T13:05:00Z",
            }
        },
    )

    organization_id: UUID = Field(description="Organization that owns the ticket.")
    created_by_user_id: UUID = Field(description="User that created the ticket.")
    assignee_user_id: UUID | None = Field(
        default=None,
        description="Currently assigned user, when the ticket already has an assignee.",
    )
    title: str = Field(description="Short title that summarizes the ticket.")
    description: str = Field(description="Detailed description of the ticket context.")
    status: str = Field(description="Current lifecycle status of the ticket.")
    priority: str = Field(description="Current priority level of the ticket.")
