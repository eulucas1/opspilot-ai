.PHONY: up down logs api-test api-migrate web-install web-dev web-build web-lint

up:
	docker compose up --build -d

down:
	docker compose down --remove-orphans

logs:
	docker compose logs -f

api-test:
	cd apps/api && pytest

api-migrate:
	cd apps/api && alembic upgrade head

web-install:
	npm install

web-dev:
	npm run web:dev

web-build:
	npm run web:build

web-lint:
	npm run web:lint
