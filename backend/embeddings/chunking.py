from core.logger import get_logger

logger = get_logger("embeddings.chunking")


class CodeChunker:

    @staticmethod
    def read_file_content(file_path: str):

        try:
            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:

                return file.read()

        except Exception as error:
            logger.warning(
                "Error reading file %s: %s",
                file_path,
                error
            )

            return None

    @staticmethod
    def create_chunks(
        content: str,
        file_name: str,
        repo_id: str,
        chunk_size: int = 500,
        overlap: int = 100
    ):

        if not content:
            return []

        chunks = []

        step = chunk_size - overlap

        for index in range(0, len(content), step):

            chunk = content[
                index:index + chunk_size
            ]

            chunks.append({
                "chunk_index": len(chunks),
                "repository_id": repo_id,
                "source_file": file_name,
                "content": chunk,
                "length": len(chunk)
            })

        return chunks
