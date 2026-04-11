from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ORMBaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class CreatedSchema(ORMBaseSchema):
    id: UUID = Field(description="Unique identifier for the resource.")
    created_at: datetime = Field(description="Timestamp when the resource was created.")


class TimestampedSchema(CreatedSchema):
    updated_at: datetime = Field(description="Timestamp when the resource was last updated.")
