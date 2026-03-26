from uuid import UUID

from app.schemas.common import TimestampedSchema


class UserRead(TimestampedSchema):
    organization_id: UUID
    name: str
    email: str
    role: str
    is_active: bool
