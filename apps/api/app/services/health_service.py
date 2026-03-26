from app.core.config import get_settings
from app.schemas.health import HealthResponse


def build_health_payload() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        environment=settings.app_env,
    )
