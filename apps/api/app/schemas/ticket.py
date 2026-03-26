from uuid import UUID

from app.schemas.common import TimestampedSchema


class TicketRead(TimestampedSchema):
    organization_id: UUID
    created_by_user_id: UUID
    title: str
    description: str
    status: str
    priority: str
