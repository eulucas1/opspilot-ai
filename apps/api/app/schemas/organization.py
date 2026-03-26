from app.schemas.common import TimestampedSchema


class OrganizationRead(TimestampedSchema):
    name: str
    slug: str
