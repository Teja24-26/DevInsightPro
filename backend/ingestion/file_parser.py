import os

from ingestion.constants import (
    SUPPORTED_EXTENSIONS,
    IGNORED_DIRECTORIES
)
from core.logger import get_logger

logger = get_logger("ingestion.parser")


class RepositoryParser:

    @staticmethod
    def parse_repository(repo_path: str):

        collected_files = []
        repository_root = os.path.abspath(repo_path)

        for root, dirs, files in os.walk(repo_path):

            dirs[:] = [
                d for d in dirs
                if d not in IGNORED_DIRECTORIES
            ]

            for file in files:

                extension = os.path.splitext(file)[1]

                if file.lower() == "readme":
                    extension = ".md"

                if extension in SUPPORTED_EXTENSIONS:

                    file_path = os.path.join(root, file)
                    resolved_file_path = os.path.abspath(
                        file_path
                    )

                    if os.path.commonpath([
                        resolved_file_path,
                        repository_root
                    ]) != repository_root:
                        logger.warning(
                            "Skipped unsafe path: %s",
                            resolved_file_path
                        )
                        continue

                    logger.info(
                        "Detected supported file: %s",
                        file
                    )

                    collected_files.append({
                        "name": file,
                        "path": resolved_file_path,
                        "relative_path": os.path.relpath(
                            resolved_file_path,
                            repository_root
                        ),
                        "extension": extension,
                        "size": os.path.getsize(file_path)
                    })

        return collected_files
