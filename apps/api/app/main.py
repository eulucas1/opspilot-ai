from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()

OPENAPI_TAGS = [
    {
        "name": "Health",
        "description": "Operational health and readiness endpoints for the API service.",
    },
    {
        "name": "Tickets",
        "description": "Ticket lifecycle endpoints, including creation, status, assignment, comments and activity history.",
    },
]

app = FastAPI(
    title=settings.app_name,
    description=(
        "OpsPilot AI backend API for managing organizations, tickets, comments and "
        "ticket activity history."
    ),
    debug=settings.app_debug,
    version="0.1.0",
    openapi_tags=OPENAPI_TAGS,
    contact={
        "name": "OpsPilot AI",
    },
)

app.include_router(api_router)
