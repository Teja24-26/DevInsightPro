import re
import time
from collections import defaultdict, deque
from urllib.parse import urlparse

from fastapi import Request

from core.config import settings
from core.errors import AppError

GITHUB_REPOSITORY_PATTERN = re.compile(
    r"^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?/?$"
)

request_log = defaultdict(deque)


def validate_repository_url(repo_url: str):
    normalized_url = repo_url.strip()

    if not normalized_url:
        raise AppError(
            "Repository URL is required.",
            status_code=422
        )

    parsed_url = urlparse(normalized_url)

    if (
        parsed_url.scheme != "https"
        or parsed_url.netloc.lower() != "github.com"
        or not GITHUB_REPOSITORY_PATTERN.match(normalized_url)
    ):
        raise AppError(
            "Invalid repository URL.",
            "Only public HTTPS GitHub repository URLs are supported.",
            422
        )

    url_without_git = normalized_url.rstrip("/")
    if url_without_git.lower().endswith(".git"):
        url_without_git = url_without_git[:-4]
    return url_without_git.rstrip("/")


async def rate_limit_middleware(
    request: Request,
    call_next
):
    client_host = (
        request.client.host
        if request.client
        else "unknown"
    )
    now = time.time()
    window = settings.rate_limit_window_seconds
    requests = request_log[client_host]

    while requests and now - requests[0] > window:
        requests.popleft()

    if len(requests) >= settings.rate_limit_requests:
        raise AppError(
            "Rate limit exceeded.",
            "Wait briefly before sending more requests.",
            429
        )

    requests.append(now)

    return await call_next(request)
