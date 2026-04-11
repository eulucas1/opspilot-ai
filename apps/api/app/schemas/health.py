from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "ok",
                "service": "OpsPilot AI API",
                "environment": "development",
            }
        }
    )

    status: Literal["ok"] = Field(description="Current health status of the API service.")
    service: str = Field(description="Public service name reported by the API.")
    environment: str = Field(description="Runtime environment for the current API instance.")
