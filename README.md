# opspilot-ai

B2B operations workflow SaaS with FastAPI, Next.js and PostgreSQL.

## Development Seed

After applying migrations, you can populate the local backend with the default demo organization and user:

```bash
make api-seed
```

Equivalent Docker command:

```bash
docker compose run --rm api python -m app.scripts.seed_dev
```

The seed is idempotent and guarantees these records exist:

- Organization `11111111-1111-1111-1111-111111111111`
- User `22222222-2222-2222-2222-222222222222`
