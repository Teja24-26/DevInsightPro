# DevInsight AI Pro

DevInsight AI Pro is an AI SaaS MVP for ingesting public GitHub repositories, indexing their code semantically, and chatting with repository-aware context.

## Architecture

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Persistence: PostgreSQL with Prisma
- Backend: FastAPI
- AI runtime: Ollama
- Embeddings: sentence-transformers `all-MiniLM-L6-v2`
- Vector search: FAISS with persisted index and metadata
- Core flows: repository ingestion, semantic search, streaming AI chat, chat/session persistence

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Ollama with the configured model installed
- Git

## Local Setup

1. Copy environment files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Install and prepare the frontend:

```bash
cd frontend
npm ci
npx prisma generate
npx prisma db push
npm run dev
```

4. Install and run the backend:

```bash
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\uvicorn main:app --reload --port 8000
```

5. Start Ollama and pull the configured model:

```bash
ollama pull llama3.2:1b
ollama serve
```

## Validation Commands

Run these before pushing or deploying:

```bash
cd frontend
npm run lint
npm run build
npx prisma generate
npx prisma db push
```

```bash
cd backend
python -m compileall api core embeddings ingestion services main.py
uvicorn main:app --host 127.0.0.1 --port 8000
```

## Repository Hygiene

Runtime clones, FAISS artifacts, virtual environments, generated Prisma clients, build output, and local env files are ignored. Do not commit `.env`, `backend/temp_repositories`, `backend/vector_store`, `backend/venv`, `frontend/.next`, or `frontend/generated`.

## Deployment

Use `DEPLOYMENT_GUIDE.md` for Vercel, Render, PostgreSQL, Ollama, and environment variable setup.
