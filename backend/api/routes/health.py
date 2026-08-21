from fastapi import APIRouter
from core.config import settings
from embeddings.vector_store import VectorStore

router = APIRouter()

@router.get("/health")
async def health_check():
    validation = settings.validate()

    return {
        "success": True,
        "status": (
            "healthy"
            if not validation["errors"]
            else "misconfigured"
        ),
        "service": "DevInsight AI Pro API",
        "ollama_model": settings.ollama_model,
        "ollama_configured": bool(settings.ollama_host),
        "vector_count": VectorStore.index.ntotal,
        "warnings": validation["warnings"],
        "errors": validation["errors"]
    }
