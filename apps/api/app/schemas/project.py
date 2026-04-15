from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import TimestampedSchema


class ProjectCreateRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "name": "Payments",
                "slug": "payments",
                "key": "PAY",
                "description": "Operational project for payment-related workflows.",
            }
        }
    )

    organization_id: UUID = Field(description="Organization that owns the project.")
    name: str = Field(
        min_length=1,
        max_length=255,
        description="Project display name.",
    )
    slug: str = Field(
        min_length=1,
        max_length=255,
        description="Project slug unique within the organization.",
    )
    key: str = Field(
        min_length=1,
        max_length=50,
        description="Short project key unique within the organization.",
    )
    description: str | None = Field(
        default=None,
        description="Optional project description.",
    )


class ProjectRead(TimestampedSchema):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "77777777-7777-7777-7777-777777777777",
                "organization_id": "11111111-1111-1111-1111-111111111111",
                "name": "Payments",
                "slug": "payments",
                "key": "PAY",
                "description": "Operational project for payment-related workflows.",
                "is_active": True,
                "created_at": "2026-04-10T12:00:00Z",
                "updated_at": "2026-04-10T12:00:00Z",
            }
        },
    )

    organization_id: UUID = Field(description="Organization that owns the project.")
    name: str = Field(description="Project display name.")
    slug: str = Field(description="Project slug unique within the organization.")
    key: str = Field(description="Short project key unique within the organization.")
    description: str | None = Field(default=None, description="Optional project description.")
    is_active: bool = Field(description="Whether the project is active.")
