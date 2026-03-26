from typing import Any
from uuid import UUID

from pydantic import Field

from app.schemas.common import CreatedSchema


class AuditLogRead(CreatedSchema):
    organization_id: UUID
    user_id: UUID
    entity_type: str
    entity_id: UUID
    action: str
    metadata: dict[str, Any] | None = Field(default=None, alias="metadata_")
