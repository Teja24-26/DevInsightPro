import os
from pathlib import Path

from dotenv import load_dotenv

from core.errors import AppError

load_dotenv()


def get_int_env(name: str, default: int):
    value = os.getenv(name, str(default))

    try:
        return int(value)
    except ValueError:
        return default


class Settings:
    app_name = "DevInsight AI Pro API"
    environment = os.getenv("ENVIRONMENT", "development")
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "")
    cors_origins = os.getenv("CORS_ORIGINS", "")
    ollama_model = os.getenv("OLLAMA_MODEL", "llama3.2:1b")
    ollama_host = os.getenv("OLLAMA_HOST", "")
    openai_api_key = os.getenv("OPENAI_API_KEY", "")
    openai_base_url = os.getenv("OPENAI_BASE_URL", "")
    openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    database_url = os.getenv("DATABASE_URL", "")
    vector_store_path = Path(
        os.getenv("VECTOR_STORE_PATH", "vector_store")
    )
    temp_repositories_dir = Path(
        os.getenv("TEMP_REPOSITORIES_DIR", "temp_repositories")
    )
    request_timeout_seconds = get_int_env(
        "REQUEST_TIMEOUT_SECONDS",
        120
    )
    rate_limit_requests = get_int_env(
        "RATE_LIMIT_REQUESTS",
        120
    )
    rate_limit_window_seconds = get_int_env(
        "RATE_LIMIT_WINDOW_SECONDS",
        60
    )
    invalid_integer_env = [
        name
        for name in (
            "REQUEST_TIMEOUT_SECONDS",
            "RATE_LIMIT_REQUESTS",
            "RATE_LIMIT_WINDOW_SECONDS",
        )
        if (
            os.getenv(name)
            and not os.getenv(name, "").isdigit()
        )
    ]

    @classmethod
    def allowed_origins(cls):
        configured_origins = [
            origin.strip().rstrip("/")
            for origin in cls.cors_origins.split(",")
            if origin.strip()
        ]

        if cls.frontend_origin:
            configured_origins.append(
                cls.frontend_origin.strip().rstrip("/")
            )

        return sorted(set(configured_origins))

    @classmethod
    def validate(cls, require_deploy_ready: bool = False):
        warnings = []
        errors = []

        if not cls.openai_api_key:
            if not cls.ollama_model:
                warnings.append("OLLAMA_MODEL is not configured.")
            if not cls.ollama_host:
                warnings.append("OLLAMA_HOST is not configured.")

        if not cls.database_url:
            warnings.append(
                "DATABASE_URL is not configured for persistence-aware deployments."
            )

        for name in cls.invalid_integer_env:
            errors.append(f"{name} must be an integer.")

        if (
            cls.environment == "production"
            and not cls.allowed_origins()
        ):
            errors.append(
                "CORS_ORIGINS or FRONTEND_ORIGIN must be configured in production."
            )

        if cls.request_timeout_seconds <= 0:
            errors.append("REQUEST_TIMEOUT_SECONDS must be greater than zero.")

        if cls.rate_limit_requests <= 0:
            errors.append("RATE_LIMIT_REQUESTS must be greater than zero.")

        if cls.rate_limit_window_seconds <= 0:
            errors.append("RATE_LIMIT_WINDOW_SECONDS must be greater than zero.")

        if require_deploy_ready and not cls.database_url:
            errors.append("DATABASE_URL is required for deployment readiness.")

        cls.vector_store_path.mkdir(
            parents=True,
            exist_ok=True
        )
        cls.temp_repositories_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        return {
            "errors": errors,
            "warnings": warnings,
        }

    @classmethod
    def validate_startup(cls):
        validation = cls.validate()

        if validation["errors"]:
            raise AppError(
                "Backend configuration is invalid.",
                " ".join(validation["errors"]),
                500
            )

        return validation


settings = Settings()
