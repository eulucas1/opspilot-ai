from typing import Any
from uuid import UUID

from pydantic import ConfigDict, Field

from app.schemas.common import CreatedSchema


class AuditLogRead(CreatedSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "66666666-6666-6666-6666-666666666666",
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "user_id": "22222222-2222-2222-2222-222222222222",
                "entity_type": "ticket",
                "entity_id": "44444444-4444-4444-4444-444444444444",
                "action": "ticket_status_changed",
                "metadata": {
                    "old_status": "open",
                    "new_status": "in_progress",
                },
                "created_at": "2026-04-10T13:15:00Z",
            }
        },
    )

    organization_id: UUID = Field(description="Organization related to the activity event.")
    user_id: UUID = Field(description="User associated with the activity event.")
    entity_type: str = Field(description="Type of entity associated with the event.")
    entity_id: UUID = Field(description="Identifier of the entity associated with the event.")
    action: str = Field(description="Normalized action name stored in the audit log.")
    metadata: dict[str, Any] | None = Field(
        default=None,
        validation_alias="metadata_",
        description="Structured metadata attached to the activity event, when available.",
    )
