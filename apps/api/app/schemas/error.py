from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ErrorResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": "Ticket not found",
            }
        }
    )

    detail: str = Field(description="Human-readable error message.")


class ValidationErrorItem(BaseModel):
    type: str = Field(description="Validation error type identifier.")
    loc: list[str | int] = Field(description="Location of the invalid field or parameter.")
    msg: str = Field(description="Human-readable validation error message.")
    input: Any | None = Field(default=None, description="Original value that failed validation.")


class ValidationErrorResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": [
                    {
                        "type": "uuid_parsing",
                        "loc": ["path", "ticket_id"],
                        "msg": "Input should be a valid UUID",
                        "input": "invalid-ticket-id",
                    }
                ]
            }
        }
    )

    detail: list[ValidationErrorItem] = Field(
        description="Detailed list of request validation errors returned by FastAPI."
    )
