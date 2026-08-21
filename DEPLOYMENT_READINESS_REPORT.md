# Deployment Readiness Report

Date: 2026-06-09

## Issues Found

- Frontend build and lint were clean before patching.
- Prisma schema validation and client generation were clean.
- `prisma db push` failed because `frontend/.env` used a SQLite-style URL while the schema is PostgreSQL.
- Backend Python was not available on PATH in this shell; validation required the project virtualenv executable.
- Backend CORS allowed every origin and did not use deployment environment variables.
- Backend startup validation only logged warnings and did not fail clearly for missing required AI configuration.
- Repository cleanup used an unsafe `os.path.abspath` call with a tuple-like argument.
- Repository parser used prefix matching for path safety instead of `commonpath`.
- Frontend backend API URL had a hardcoded local fallback.
- Next API persistence routes had a few brittle request edge cases.
- Runtime folders and generated artifacts existed in the workspace and needed stronger ignore coverage.

## Fixes Applied

- Added environment-driven backend API base URL handling in `frontend/services/api.ts`.
- Changed Prisma config to require `DATABASE_URL` instead of falling back to a local PostgreSQL URL.
- Updated local frontend env shape to PostgreSQL.
- Added backend startup validation for Ollama host/model, production CORS, integer env values, and rate-limit values.
- Added configurable backend CORS through `FRONTEND_ORIGIN` and `CORS_ORIGINS`.
- Hardened repository cleanup and parser path checks.
- Hardened Ollama streaming chunk parsing.
- Made repository persistence tolerate missing chunk metadata.
- Added role validation to chat message persistence.
- Updated `.env.example` files for frontend and backend.
- Added Vercel config for the frontend.
- Added Render config for the backend.
- Expanded `.gitignore` for runtime, generated, cache, log, and editor files.
- Added root `README.md`, `DEPLOYMENT_GUIDE.md`, and this readiness report.

## Verification

- `npm run lint`: passed after final edits.
- `npm run build`: passed after final edits.
- `npx prisma validate`: passed.
- `npx prisma generate`: passed.
- Backend compile check: passed through the backend virtualenv executable.
- Backend startup smoke test: passed; `/api/health` returned healthy with explicit env values.
- FAISS persistence smoke test: passed; one vector persisted and reloaded successfully from disk.
- Semantic search smoke test: passed with a synthetic vector and repository filter.
- Ollama discovery: passed; local Ollama returned installed models including `llama3.2:1b`.
- AI streaming generation: blocked by local Ollama installation error: `llama-server binary not found`. Backend error handling now converts this to a clean `AI streaming failed` application error.
- `npx prisma db push`: still blocked locally because PostgreSQL is not reachable at the configured URL. Docker is not installed in this shell, so `docker compose up -d postgres` could not be used here.
- Secret scan: no obvious API keys, GitHub tokens, or secret assignment patterns found in source after excluding ignored runtime/generated folders.

## Remaining Risks

- End-to-end ingestion, semantic search, and streaming chat require network access to GitHub, a running Ollama host, and a live PostgreSQL database.
- FAISS persistence survives restart when `VECTOR_STORE_PATH` is on durable storage; some platforms provide ephemeral filesystem storage unless configured otherwise.
- Production Ollama hosting must be secured and reachable from the backend.
- The local Ollama install must be repaired or reinstalled before streaming generation can pass on this machine.
- A local or managed PostgreSQL instance must be running before `prisma db push` and persistence E2E verification can pass.
- This workspace is not currently a Git repository root, so git status cannot verify tracked/untracked cleanliness here.

## Deployment Checklist

- Configure frontend env vars in Vercel.
- Configure backend env vars in Render.
- Provision PostgreSQL and run `npx prisma db push`.
- Provision Ollama and pull `OLLAMA_MODEL`.
- Set `VECTOR_STORE_PATH` to durable storage if backend restarts must preserve indexes.
- Run frontend lint/build and backend startup checks.
- Ingest a small public repository.
- Verify semantic search returns repository-specific chunks.
- Verify streaming chat emits tokens.
- Restart backend and verify FAISS-backed search still works.
- Confirm `.env`, runtime clones, vector stores, virtualenvs, and generated output are not committed.
