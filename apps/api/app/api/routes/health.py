from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.services.health_service import build_health_payload

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health_check() -> HealthResponse:
    return build_health_payload()
