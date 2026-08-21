# DevInsight AI Pro Frontend

Next.js frontend and Prisma persistence layer for DevInsight AI Pro.

## PostgreSQL Setup

Start PostgreSQL from the project root:

```bash
docker compose up -d postgres
```

Create `frontend/.env` from `.env.example`, then run:

```bash
npm install
npm run db:deploy
npm run dev
```

The local database URL is:

```text
postgresql://postgres:postgres@localhost:5432/devinsight_ai_pro?schema=public
```

## Prisma Commands

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:deploy
```

Use `db:migrate` while developing schema changes. Use `db:deploy` to apply checked-in migrations in deployment environments.

## Persistence Architecture

FastAPI remains responsible for repository ingestion, FAISS vectors, semantic retrieval, and Ollama streaming. Next.js route handlers use Prisma to persist repository history, embedding metadata, chat sessions, and chat messages in PostgreSQL.

FAISS vector values remain local for now. PostgreSQL stores the stable repository record and semantic chunk metadata needed for future authentication, repository management, and durable chat history.
