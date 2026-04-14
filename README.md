# OpsPilot AI

OpsPilot AI e um produto em evolucao para operacoes B2B com foco em tickets operacionais, rastreabilidade de mudancas e base tecnica escalavel.

## Proposta de Valor

- Centralizar tickets operacionais em uma interface unica e simples.
- Manter historico auditavel de mudancas (status, responsavel e comentarios).
- Entregar uma base de produto real, com arquitetura limpa para evolucao rapida.

## O Que Ja Esta Implementado

### Backend (FastAPI + PostgreSQL)

- API com OpenAPI/Swagger em `/docs`.
- Endpoint de saude: `GET /health`.
- Dominio inicial com `Organization`, `User`, `Ticket`, `Comment` e `AuditLog`.
- Tickets com criacao, consulta, filtros, atualizacao de status e atribuicao de responsavel.
- Comentarios por ticket (listagem e criacao).
- Historico consolidado de atividade por ticket via `AuditLog`.
- Validacoes de regras basicas (status, priority, existencia de entidades e consistencia de organizacao).
- Migrations com Alembic e seed idempotente de desenvolvimento.
- Testes backend com `pytest`.

### Frontend (Next.js App Router)

- Landing page do produto.
- Lista de tickets (`/tickets`) com integracao real com API.
- Filtros por status e prioridade na lista, com persistencia na URL.
- Summary cards no topo reagindo ao conjunto de tickets exibido.
- Detalhe de ticket (`/tickets/[ticketId]`) com visao geral e metadados.
- Atualizacao de status e responsavel direto no detalhe.
- Listagem e criacao de comentarios no detalhe.
- Feed de atividade consolidada no detalhe.
- Criacao de ticket (`/tickets/new`) integrada ao `POST /tickets`.
- Sistema global reutilizavel de feedback visual (success, error, info).
- Refinos de responsividade para mobile, tablet e desktop.

## Stack Tecnica

| Camada | Tecnologias |
| --- | --- |
| Monorepo | npm workspaces |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12, Pydantic Settings |
| Persistencia | PostgreSQL 16, SQLAlchemy 2 |
| Migrations | Alembic |
| Testes Backend | pytest |
| Testes Frontend | Playwright (estrutura inicial) |
| Infra local | Docker Compose |
| CI | GitHub Actions (backend e frontend) |

## Arquitetura Resumida

```text
Browser
  -> Next.js (apps/web)
    -> Rotas /api do frontend (proxy server-side)
      -> FastAPI (apps/api)
        -> SQLAlchemy
          -> PostgreSQL
```

## Estrutura Principal Do Monorepo

```text
.
|- apps/
|  |- api/
|  |  |- alembic/
|  |  |- app/
|  |  |  |- api/
|  |  |  |- core/
|  |  |  |- db/
|  |  |  |- models/
|  |  |  |- schemas/
|  |  |  |- services/
|  |  |  |- scripts/
|  |  |  '- tests/
|  |  '- pyproject.toml
|  '- web/
|     |- src/
|     |  |- app/
|     |  |- components/
|     |  |- lib/
|     |  '- types/
|     '- package.json
|- packages/
|  '- shared-types/
|- docs/
|  |- architecture/
|  |- product/
|  '- adr/
|- infra/
|  '- docker/
|- .github/
|  '- workflows/
|- docker-compose.yml
|- Makefile
'- README.md
```

## Como Rodar Localmente

### Pre-requisitos

- Node.js 22+
- npm 10+
- Python 3.12+
- PostgreSQL 16 (ou Docker para subir o banco)

### Opcao 1: Desenvolvimento Hibrido (recomendado)

Suba apenas o Postgres em container:

```bash
docker compose up -d postgres
```

Backend:

```bash
cd apps/api
pip install -e ".[dev]"
alembic upgrade head
python -m app.scripts.seed_dev
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (na raiz do repo):

```bash
npm install
npm run web:dev
```

### Opcao 2: Tudo com Docker Compose

```bash
cp .env.example .env
# PowerShell (Windows): Copy-Item .env.example .env
docker compose up --build -d
docker compose exec api alembic upgrade head
docker compose run --rm api python -m app.scripts.seed_dev
```

Endpoints locais:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- OpenAPI/Swagger: `http://localhost:8000/docs`

## Migrations E Seed

Aplicar migrations:

```bash
cd apps/api
alembic upgrade head
```

Executar seed (idempotente):

```bash
make api-seed
```

Ou diretamente:

```bash
docker compose run --rm api python -m app.scripts.seed_dev
```

Registros garantidos pelo seed:

- Organization `11111111-1111-1111-1111-111111111111` (`OpsPilot Demo Org`)
- User `22222222-2222-2222-2222-222222222222` (`Lucas Demo`, `lucas@example.com`)

## Rotas E Features Disponiveis

### API Backend

- `GET /health`
- `GET /tickets` com filtros opcionais: `status`, `priority`, `organization_id`, `created_by_user_id`, `assignee_user_id`
- `GET /tickets/{ticket_id}`
- `POST /tickets`
- `PATCH /tickets/{ticket_id}/status`
- `PATCH /tickets/{ticket_id}/assignee`
- `GET /tickets/{ticket_id}/comments`
- `POST /tickets/{ticket_id}/comments`
- `GET /tickets/{ticket_id}/activity`

### Frontend

- `/` landing page.
- `/tickets` listagem com filtros e URL compartilhavel.
- `/tickets/new` criacao de ticket.
- `/tickets/[ticketId]` detalhe com status, responsavel, comentarios e activity.

## Visao Tecnica Rapida

### Backend

- FastAPI com routers organizados em `app/api/routes`.
- Servicos em `app/services` para separar regras de dominio das rotas.
- SQLAlchemy models com UUID e campos de timestamp padronizados.
- `AuditLog` como fonte de historico para eventos de ticket e comentario.

### Frontend

- App Router com componentes organizados por responsabilidade.
- Rotas `/api` no Next.js atuando como proxy para a API (evita acoplamento direto da UI ao host do backend).
- Tipos centralizados em `src/types` e pacote compartilhado em `packages/shared-types`.

## Qualidade E CI

- Workflow de backend: instala dependencias e roda `pytest` com Postgres de suporte.
- Workflow de frontend: instala dependencias, roda lint, typecheck e build.
- Estrutura pronta para E2E com Playwright (`apps/web/tests/e2e`).

## Demo Flow (5 Minutos)

1. Subir stack local e aplicar migrations.
2. Rodar seed de desenvolvimento.
3. Acessar `/tickets/new` e criar um ticket.
4. Abrir detalhe do ticket para trocar status, atribuir responsavel e criar comentario.
5. Voltar para `/tickets`, aplicar filtros e compartilhar URL com query params.

## Documentacao Complementar

- Arquitetura: [`docs/architecture/overview.md`](docs/architecture/overview.md)
- Backlog de produto: [`docs/product/backlog.md`](docs/product/backlog.md)
- ADR monorepo: [`docs/adr/0001-monorepo.md`](docs/adr/0001-monorepo.md)

## Roadmap Curto

- Autenticacao e autorizacao por tenant/role.
- Selecao dinamica de organizacao e usuario no frontend.
- Paginacao e busca textual na listagem de tickets.
- Expansao de cobertura E2E com Playwright.
- Evolucao de observabilidade e telemetria da API.

## Screenshots

Esta secao pode receber capturas reais do produto para reforcar o portfolio:

- Lista de tickets (`/tickets`)
- Tela de criacao (`/tickets/new`)
- Tela de detalhe com actions, comments e activity (`/tickets/[ticketId]`)

## Decisoes Tecnicas Relevantes

- Monorepo para acelerar iteracao entre frontend, backend e docs.
- Proxy de API no frontend para simplificar integracao e ambiente local.
- `AuditLog` consolidando eventos de ticket e comentario em historico unico.
- Seed fixo e idempotente para reduzir friccao de onboarding e reset de ambiente.
