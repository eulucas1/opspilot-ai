# OpsPilot AI API

FastAPI application for the OpsPilot AI platform.

## Development

```bash
pip install -e ".[dev]"
pytest
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
