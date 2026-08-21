import shutil
import time
from pathlib import Path

from core.config import settings
from core.logger import get_logger

logger = get_logger("ingestion.cleanup")


class CleanupService:
    @staticmethod
    def remove_stale_repositories(
        max_age_seconds: int = 60 * 60 * 24
    ):
        repository_root = Path(
            settings.temp_repositories_dir
        )

        if not repository_root.exists():
            return 0

        removed_count = 0
        now = time.time()

        for path in repository_root.iterdir():
            if not path.is_dir():
                continue

            age = now - path.stat().st_mtime

            if age < max_age_seconds:
                continue

            shutil.rmtree(path)
            removed_count += 1
            logger.info(
                "Removed stale repository clone: %s",
                path
            )

        return removed_count
