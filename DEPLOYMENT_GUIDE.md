# Deployment Guide

## Frontend on Vercel

Set the Vercel project root to `frontend`.

Required environment variables:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
NEXT_PUBLIC_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api
```

Build settings are provided in `frontend/vercel.json`.

Deploy steps:

```bash
cd frontend
npm ci
npx prisma generate
npm run build
```

Run migrations or schema push against the production database before first use:

```bash
npx prisma db push
```

## Backend on Render

Use `backend/render.yaml` or create a Render Web Service with:

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
FRONTEND_ORIGIN=https://YOUR_FRONTEND_DOMAIN
CORS_ORIGINS=https://YOUR_FRONTEND_DOMAIN
OLLAMA_MODEL=llama3.2:1b
OLLAMA_HOST=https://YOUR_OLLAMA_HOST
VECTOR_STORE_PATH=/opt/render/project/src/vector_store
TEMP_REPOSITORIES_DIR=/tmp/devinsight-repositories
REQUEST_TIMEOUT_SECONDS=120
RATE_LIMIT_REQUESTS=120
RATE_LIMIT_WINDOW_SECONDS=60
```

## PostgreSQL

Use a managed PostgreSQL database from Vercel, Render, Railway, Neon, Supabase, or another provider. The Prisma schema is PostgreSQL-only.

After the database is provisioned:

```bash
cd frontend
npx prisma generate
npx prisma db push
```

## Ollama

The backend calls Ollama through `OLLAMA_HOST`. For production, use a reachable Ollama host or a private service in the same deployment network. Confirm the model exists on that host:

```bash
ollama pull llama3.2:1b
```

## Smoke Test

1. Open the frontend.
2. Ingest a small public GitHub repository.
3. Confirm the repository appears in the repositories dashboard.
4. Run semantic search against the repository.
5. Ask a streaming chat question about an indexed file.
6. Restart the backend and confirm search still returns results from the persisted FAISS store.
7. Confirm chat sessions and repository metadata still exist in PostgreSQL.
