from threading import Lock
import os

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
                        "all-MiniLM-L6-v2"
                    )
                    logger.info("Embedding model loaded.")

        return cls.model

    @staticmethod
    def generate_embedding(text: str):

        model = EmbeddingGenerator.get_model()

        embedding = model.encode(text)

        return embedding.tolist()

    @staticmethod
    def generate_query_embedding(query: str):

        model = EmbeddingGenerator.get_model()

        embedding = model.encode(query)

        return embedding.tolist()
