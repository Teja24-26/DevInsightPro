import hashlib
import os
import uuid
import shutil
import stat

from git import Repo

from core.config import settings
from core.logger import get_logger

logger = get_logger("ingestion.github")
TEMP_REPOSITORIES_DIR = settings.temp_repositories_dir

TEMP_REPOSITORIES_DIR.mkdir(
    parents=True,
    exist_ok=True
)


class GitHubLoader:

    @staticmethod
    def clone_repository(repo_url: str):

        repo_id = hashlib.sha256(
            repo_url.lower().encode("utf-8")
        ).hexdigest()[:16]

        clone_path = TEMP_REPOSITORIES_DIR / str(uuid.uuid4())

        os.environ["GIT_TERMINAL_PROMPT"] = "0"

        logger.info(
            "Starting repository clone: %s",
            repo_url
        )

        Repo.clone_from(
            repo_url,
            str(clone_path),
            depth=1,
            single_branch=True
        )

        logger.info(
            "Repository clone completed: %s",
            repo_id
        )

        return {
            "repo_id": repo_id,
            "clone_path": str(clone_path)
        }

    @staticmethod
    def _handle_remove_readonly(func, path, exc_info):
        """
        Windows sometimes marks Git pack files as read-only.
        Force write permission and retry deletion.
        """
        os.chmod(path, stat.S_IWRITE)
        func(path)

    @staticmethod
    def cleanup_repository(path: str):

        if not path:
            return

        resolved_path = os.path.abspath(path)

        allowed_root = os.path.abspath(
            str(TEMP_REPOSITORIES_DIR)
        )

        if os.path.commonpath(
            [resolved_path, allowed_root]
        ) != allowed_root:
            logger.warning(
                "Skipped unsafe cleanup path: %s",
                resolved_path
            )
            return

        if os.path.exists(resolved_path):

            shutil.rmtree(
                resolved_path,
                onerror=GitHubLoader._handle_remove_readonly
            )

            logger.info(
                "Cleaned repository clone: %s",
                resolved_path
            )
