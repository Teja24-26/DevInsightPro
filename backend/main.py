from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.errors import (
    AppError,
    app_error_handler,
    unhandled_error_handler,
    validation_error_handler
)
from core.logger import get_logger
from core.security import rate_limit_middleware
from fastapi.exceptions import RequestValidationError
from api.routes.search import router as search_router
from api.routes.chat import router as chat_router

from api.routes.health import router as health_router
from api.routes.repository import router as repository_router

logger = get_logger("api.startup")

startup_validation = settings.validate_startup()

app = FastAPI(
    title=settings.app_name,
    version="1.0.0"
)

for warning in startup_validation["warnings"]:
    logger.warning(warning)

app.add_exception_handler(
    AppError,
    app_error_handler
)
app.add_exception_handler(
    Exception,
    unhandled_error_handler
)
app.add_exception_handler(
    RequestValidationError,
    validation_error_handler
)

allowed_origins = settings.allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(
    rate_limit_middleware
)

# Routes
app.include_router(
    health_router,
    prefix="/api"
)

app.include_router(
    repository_router,
    prefix="/api"
)
app.include_router(
    search_router,
    prefix="/api"
)
app.include_router(
    chat_router,
    prefix="/api"
)

@app.get("/")
async def root():
    return {
        "message": "DevInsight AI Pro Backend Running"
    }
