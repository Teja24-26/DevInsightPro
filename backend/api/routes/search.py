from fastapi import APIRouter
from pydantic import BaseModel, Field
from pathlib import PurePath
from core.errors import AppError
from core.logger import get_logger

from embeddings.embedding_generator import (
    EmbeddingGenerator
)

from embeddings.vector_store import (
    VectorStore
)

router = APIRouter()
logger = get_logger("api.search")


class SearchRequest(BaseModel):
    query: str = Field(
        min_length=2,
        max_length=500
    )
    repository_id: str | None = None
    repositoryId: str | None = None


def format_search_results(raw_results):
    return [
        {
            "repository": chunk.get("repository_id", ""),
            "file": PurePath(
                chunk.get("source_file", "").replace("\\", "/")
            ).name,
            "score": chunk.get("relevance_score", 0),
            "chunkPreview": chunk.get("content", "")[:420],
            "relativePath": chunk.get("source_file", ""),
            "chunkIndex": chunk.get("chunk_index", 0)
        }
        for chunk in raw_results.get("chunks", [])
    ]


@router.post("/search")
async def search_code(
    payload: SearchRequest
):
    logger.info(
        "Semantic search requested. repository=%s",
        payload.repositoryId or payload.repository_id or "all"
    )

    repository_id = (
        payload.repositoryId
        or payload.repository_id
    )

    query_embedding = (
        EmbeddingGenerator.generate_query_embedding(
            payload.query
        )
    )

    results = VectorStore.search(
        query_embedding,
        repository_id=repository_id,
        query=payload.query
    )

    return {
        "success": True,
        "results": format_search_results(results)
    }


@router.post("/semantic-search")
async def semantic_search(
    payload: SearchRequest
):
    if not payload.query.strip():
        raise AppError(
            "Search query is required.",
            status_code=422
        )

    repository_id = (
        payload.repositoryId
        or payload.repository_id
    )

    query_embedding = (
        EmbeddingGenerator.generate_query_embedding(
            payload.query
        )
    )

    results = VectorStore.search(
        query_embedding,
        repository_id=repository_id,
        query=payload.query
    )

    return {
        "success": True,
        "query": payload.query,
        "results": results
    }
