from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.services.health_service import build_health_payload

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=200,
    summary="Check API health",
    description="Return a lightweight health payload for the OpsPilot AI API service.",
    response_description="Health information for the current API instance.",
)
def health_check() -> HealthResponse:
    return build_health_payload()
