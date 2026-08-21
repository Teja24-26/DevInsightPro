import json
from pathlib import Path
from threading import Lock

import faiss
import numpy as np
import re

from core.config import settings
from core.logger import get_logger

logger = get_logger("vector_store")


class VectorStore:

    dimension = 384
    store_path = Path(settings.vector_store_path)
    index_path = store_path / "faiss.index"
    metadata_path = store_path / "chunks.json"
    lock = Lock()

    index = faiss.IndexFlatIP(
        dimension
    )
    chunks = []

    @staticmethod
    def load():
        VectorStore.store_path.mkdir(
            parents=True,
            exist_ok=True
        )

        if (
            VectorStore.index_path.exists()
            and VectorStore.metadata_path.exists()
        ):
            VectorStore.index = faiss.read_index(
                str(VectorStore.index_path)
            )

            with open(
                VectorStore.metadata_path,
                "r",
                encoding="utf-8"
            ) as metadata_file:
                VectorStore.chunks = json.load(
                    metadata_file
                )

            logger.info(
                "Loaded FAISS index with %s vectors.",
                VectorStore.index.ntotal
            )

    @staticmethod
    def persist():
        VectorStore.store_path.mkdir(
            parents=True,
            exist_ok=True
        )

        faiss.write_index(
            VectorStore.index,
            str(VectorStore.index_path)
        )

        serializable_chunks = []

        for chunk in VectorStore.chunks:
            chunk_copy = chunk.copy()
            chunk_copy.pop(
                "embedding",
                None
            )
            serializable_chunks.append(chunk_copy)

        with open(
            VectorStore.metadata_path,
            "w",
            encoding="utf-8"
        ) as metadata_file:
            json.dump(
                serializable_chunks,
                metadata_file
            )

        logger.info(
            "Persisted FAISS index with %s vectors.",
            VectorStore.index.ntotal
        )

    @staticmethod
    def add_embeddings(
        embeddings,
        chunk_data
    ):
        with VectorStore.lock:
            if not embeddings:
                return

            vectors = np.array(
                embeddings
            ).astype("float32")

            faiss.normalize_L2(vectors)

            VectorStore.index.add(vectors)
            VectorStore.chunks.extend(
                chunk_data
            )
            VectorStore.persist()

    @staticmethod
    def replace_repository_embeddings(
        repository_id: str,
        embeddings,
        chunk_data
    ):
        with VectorStore.lock:
            if not repository_id:
                return

            retained_chunks = []
            retained_vectors = []

            for index, chunk in enumerate(VectorStore.chunks):
                if chunk.get("repository_id") == repository_id:
                    continue

                if index < VectorStore.index.ntotal:
                    retained_chunks.append(chunk)
                    retained_vectors.append(
                        VectorStore.index.reconstruct(index)
                    )
                else:
                    logger.warning(
                        "Skipping vector metadata without FAISS row: %s",
                        index
                    )

            VectorStore.index = faiss.IndexFlatIP(
                VectorStore.dimension
            )
            VectorStore.chunks = retained_chunks

            if retained_vectors:
                VectorStore.index.add(
                    np.array(retained_vectors).astype("float32")
                )

            if embeddings:
                vectors = np.array(
                    embeddings
                ).astype("float32")

                faiss.normalize_L2(vectors)

                VectorStore.index.add(vectors)
                VectorStore.chunks.extend(
                    chunk_data
                )

            VectorStore.persist()

    @staticmethod
    def search(
        query_embedding,
        top_k: int = 5,
        repository_id: str | None = None,
        query: str = ""
    ):
        with VectorStore.lock:
            if VectorStore.index.ntotal == 0:
                return {
                    "scores": [],
                    "indices": [],
                    "chunks": []
                }

            query_vector = np.array(
                [query_embedding]
            ).astype("float32")

            faiss.normalize_L2(query_vector)

            candidate_count = min(
                VectorStore.index.ntotal,
                max(top_k * 4, top_k)
            )

            if repository_id:
                candidate_count = VectorStore.index.ntotal

            similarities, indices = (
                VectorStore.index.search(
                    query_vector,
                    candidate_count
                )
            )

            chunks_snapshot = list(VectorStore.chunks)

        query_terms = VectorStore._tokenize(query)
        ranked_chunks = []

        for index, semantic_score in zip(
            indices[0],
            similarities[0]
        ):

            if index == -1:
                continue

            chunk_data = chunks_snapshot[index].copy()

            if (
                repository_id
                and chunk_data.get("repository_id")
                != repository_id
            ):
                continue

            chunk_data.pop(
                "embedding",
                None
            )

            keyword_score = VectorStore._keyword_score(
                query_terms,
                chunk_data.get("content", "")
            )

            relevance_score = (
                float(semantic_score) * 0.82
                + keyword_score * 0.18
            )

            chunk_data["relevance_score"] = round(
                relevance_score,
                4
            )
            chunk_data["semantic_score"] = round(
                float(semantic_score),
                4
            )
            chunk_data["keyword_score"] = round(
                keyword_score,
                4
            )

            ranked_chunks.append(chunk_data)

        ranked_chunks.sort(
            key=lambda chunk: chunk["relevance_score"],
            reverse=True
        )

        retrieved_chunks = ranked_chunks[:top_k]

        return {
            "scores": [
                chunk["relevance_score"]
                for chunk in retrieved_chunks
            ],
            "indices": indices.tolist(),
            "chunks": retrieved_chunks
        }

    @staticmethod
    def _tokenize(text: str):
        return set(
            re.findall(
                r"[a-zA-Z_][a-zA-Z0-9_]{2,}",
                text.lower()
            )
        )

    @staticmethod
    def _keyword_score(query_terms, content: str):
        if not query_terms:
            return 0.0

        content_terms = VectorStore._tokenize(content)

        return len(
            query_terms.intersection(content_terms)
        ) / len(query_terms)


VectorStore.load()
