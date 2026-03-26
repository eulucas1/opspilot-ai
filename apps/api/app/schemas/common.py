from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ORMBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CreatedSchema(ORMBaseSchema):
    id: UUID
    created_at: datetime


class TimestampedSchema(CreatedSchema):
    updated_at: datetime
