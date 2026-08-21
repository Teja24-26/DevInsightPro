from threading import Lock
import os
import gc

from core.logger import get_logger

logger = get_logger("embeddings.generator")


class EmbeddingGenerator:

    model = None
    lock = Lock()

    @classmethod
    def get_model(cls):

        if cls.model is None:
            with cls.lock:
                if cls.model is None:
                    import torch
                    torch.set_num_threads(1)
                    from sentence_transformers import SentenceTransformer

                    logger.info("Loading embedding model.")
                    cls.model = SentenceTransformer(
                        "all-MiniLM-L6-v2",
                        device="cpu"
                    )
                    logger.info("Embedding model loaded.")

        return cls.model

    @staticmethod
    def generate_embedding(text: str):
        model = EmbeddingGenerator.get_model()
        import torch
        with torch.inference_mode():
            embedding = model.encode(
                text,
                show_progress_bar=False,
                normalize_embeddings=True
            )
        return embedding.tolist()

    @staticmethod
    def generate_embeddings(texts: list[str]):
        if not texts:
            return []
        model = EmbeddingGenerator.get_model()
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

    @staticmethod
    def generate_query_embedding(query: str):
        model = EmbeddingGenerator.get_model()
        import torch
        with torch.inference_mode():
            embedding = model.encode(
                query,
                show_progress_bar=False,
                normalize_embeddings=True
            )
        return embedding.tolist()
