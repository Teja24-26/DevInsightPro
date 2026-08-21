from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from core.logger import get_logger

logger = get_logger("api.errors")


class AppError(Exception):
    def __init__(
        self,
        error: str,
        details: str = "",
        status_code: int = 400
    ):
        self.error = error
        self.details = details
        self.status_code = status_code


def error_response(
    error: str,
    details: str = "",
    status_code: int = 500
):
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": error,
            "details": details
        }
    )


async def app_error_handler(
    request: Request,
    exc: AppError
):
    logger.warning(
        "%s %s failed: %s",
        request.method,
        request.url.path,
        exc.error
    )
    return error_response(
        exc.error,
        exc.details,
        exc.status_code
    )


async def unhandled_error_handler(
    request: Request,
    exc: Exception
):
    logger.error(
        "%s %s failed unexpectedly: %s",
        request.method,
        request.url.path,
        exc,
        exc_info=True
    )
    return error_response(
        "Unexpected server error.",
        "Review backend logs for the full failure details.",
        500
    )


async def validation_error_handler(
    request: Request,
    exc: RequestValidationError
):
    logger.warning(
        "%s %s validation failed: %s",
        request.method,
        request.url.path,
        exc.errors()
    )
    return error_response(
        "Request validation failed.",
        str(exc.errors()),
        422
    )
