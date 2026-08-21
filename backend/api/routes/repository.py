from fastapi import APIRouter
from pydantic import BaseModel, Field

from embeddings.chunking import CodeChunker
from embeddings.embedding_generator import EmbeddingGenerator
from embeddings.vector_store import VectorStore

from core.errors import AppError
from core.logger import get_logger
from core.security import validate_repository_url

from ingestion.github_loader import GitHubLoader
from ingestion.file_parser import RepositoryParser
from ingestion.cleanup import CleanupService

router = APIRouter()
logger = get_logger("api.repository")


class RepositoryRequest(BaseModel):
    repo_url: str = Field(
        min_length=1,
        max_length=300
    )


@router.post("/ingest-repository")
async def ingest_repository(payload: RepositoryRequest):

    repo_url = validate_repository_url(
        payload.repo_url
    )

    cloned_repository = None

    CleanupService.remove_stale_repositories()

    try:

        cloned_repository = GitHubLoader.clone_repository(
            repo_url
        )

        files = RepositoryParser.parse_repository(
            cloned_repository["clone_path"]
        )

        all_chunks = []
        all_embeddings = []

        logger.info(
            "Starting ingestion for repository %s with %s files.",
            cloned_repository["repo_id"],
            len(files)
        )

        for file in files:

            content = CodeChunker.read_file_content(
                file["path"]
            )

            if not content:
                continue

            chunks = CodeChunker.create_chunks(
                content,
                file["relative_path"],
                cloned_repository["repo_id"]
            )

            all_chunks.extend(chunks)

            for chunk in chunks:

                embedding = (
                    EmbeddingGenerator.generate_embedding(
                        chunk["content"]
                    )
                )

                chunk["embedding"] = embedding

                all_embeddings.append(
                    embedding
                )

        VectorStore.replace_repository_embeddings(
            cloned_repository["repo_id"],
            all_embeddings,
            all_chunks
        )

        logger.info(
            "Finished ingestion for repository %s with %s chunks.",
            cloned_repository["repo_id"],
            len(all_chunks)
        )

        return {
            "success": True,
            "repository": {
                "repo_id": cloned_repository["repo_id"],
                "files_processed": len(files),
                "total_chunks": len(all_chunks),
                "sample_chunks": all_chunks[:5],
                "files": files[:20],
                "chunk_metadata": [
                    {
                        "chunk_index": chunk["chunk_index"],
                        "source_file": chunk["source_file"],
                        "length": chunk["length"],
                        "content_preview": chunk["content"][:320]
                    }
                    for chunk in all_chunks
                ]
            }
        }

    except AppError:
        raise

    except Exception as error:

        logger.error(
            "Repository ingestion failed: %s",
            error,
            exc_info=True
        )

        raise AppError(
            "Repository ingestion failed.",
            "Check the repository URL, network access, and supported file types.",
            500
        ) from error

    finally:

        if cloned_repository:

            try:

                GitHubLoader.cleanup_repository(
                    cloned_repository.get(
                        "clone_path"
                    )
                )

            except Exception as cleanup_error:

                logger.warning(
                    "Repository cleanup failed: %s",
                    cleanup_error
                )
