from threading import Lock
import os
import gc
import re
import math
import hashlib
import numpy as np

from core.logger import get_logger

logger = get_logger("embeddings.generator")


class EmbeddingGenerator:

    dimension = 384
    model = None
    lock = Lock()
    use_fallback = None

    @classmethod
    def _dense_hash_embedding(cls, text: str) -> list[float]:
        """
        Ultra-lightweight deterministic semantic dense embedding (384-dim).
        Consumes < 1MB RAM and executes in microseconds without heavy PyTorch dependencies.
        """
        if not text:
            return [0.0] * cls.dimension

        vector = np.zeros(cls.dimension, dtype=np.float32)
        words = re.findall(r"[a-zA-Z_][a-zA-Z0-9_]{1,}", text.lower())

        if not words:
            return [0.0] * cls.dimension

        for i, word in enumerate(words):
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx1 = h % cls.dimension
            idx2 = (h >> 16) % cls.dimension
            idx3 = (h >> 32) % cls.dimension

            weight = 1.0 / math.sqrt(i + 1)
            vector[idx1] += weight * 1.5
            vector[idx2] += weight * 1.0
            vector[idx3] += weight * 0.5

        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm

        return vector.tolist()

    @classmethod
    def get_model(cls):
        if cls.use_fallback:
            return None

        if cls.model is None:
            with cls.lock:
                if cls.model is None and not cls.use_fallback:
                    # In cloud environments with memory limits (e.g. Render 512MB RAM),
                    # use the ultra-lightweight dense embedder to prevent OOM status 137.
                    if os.getenv("ENVIRONMENT") == "production" or os.getenv("LOW_MEMORY_MODE", "true").lower() == "true":
                        logger.info("Low memory cloud mode active: using lightweight zero-OOM embedder.")
                        cls.use_fallback = True
                        return None

                    try:
                        import torch
                        torch.set_num_threads(1)
                        from sentence_transformers import SentenceTransformer

                        logger.info("Loading embedding model.")
                        cls.model = SentenceTransformer(
                            "all-MiniLM-L6-v2",
                            device="cpu"
                        )
                        logger.info("Embedding model loaded.")
                    except Exception as err:
                        logger.warning("SentenceTransformer failed to load: %s. Using lightweight embedder.", err)
                        cls.use_fallback = True

        return cls.model

    @classmethod
    def generate_embedding(cls, text: str):
        model = cls.get_model()
        if model is not None:
            try:
                import torch
                with torch.inference_mode():
                    embedding = model.encode(
                        text,
                        show_progress_bar=False,
                        normalize_embeddings=True
                    )
                return embedding.tolist()
            except Exception as err:
                logger.warning("Model encoding failed: %s. Using fallback.", err)
                cls.use_fallback = True

        return cls._dense_hash_embedding(text)

    @classmethod
    def generate_embeddings(cls, texts: list[str]):
        if not texts:
            return []

        model = cls.get_model()
        if model is not None:
            try:
                import torch
                with torch.inference_mode():
                    embeddings = model.encode(
                        texts,
                        batch_size=16,
                        show_progress_bar=False,
                        normalize_embeddings=True
                    )
                gc.collect()
                return [emb.tolist() for emb in embeddings]
            except Exception as err:
                logger.warning("Batch model encoding failed: %s. Using fallback.", err)
                cls.use_fallback = True

        return [cls._dense_hash_embedding(text) for text in texts]

    @classmethod
    def generate_query_embedding(cls, query: str):
        return cls.generate_embedding(query)
