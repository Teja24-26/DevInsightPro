import ollama
import openai

from core.config import settings
from core.errors import AppError
from core.logger import get_logger
from embeddings.embedding_generator import (
    EmbeddingGenerator
)

from embeddings.vector_store import (
    VectorStore
)

logger = get_logger("services.ai")

def get_effective_ai_config():
    api_key = settings.openai_api_key.strip() if settings.openai_api_key else ""
    base_url = settings.openai_base_url.strip() if getattr(settings, "openai_base_url", None) else ""
    model = settings.openai_model.strip() if getattr(settings, "openai_model", None) else ""

    # Automatically configure Groq API keys (gsk_...)
    if api_key.startswith("gsk_"):
        if not base_url:
            base_url = "https://api.groq.com/openai/v1"
        if not model or model == "gpt-4o-mini":
            model = "llama-3.3-70b-versatile"

    if not model:
        model = "gpt-4o-mini"

    return api_key, base_url, model

ollama_client = None
if settings.ollama_host:
    ollama_client = ollama.Client(
        host=settings.ollama_host
    )

openai_client = None
if settings.openai_api_key:
    _api_key, _base_url, _model = get_effective_ai_config()
    client_kwargs = {"api_key": _api_key}
    if _base_url:
        client_kwargs["base_url"] = _base_url
    openai_client = openai.OpenAI(**client_kwargs)





class AIService:

    @staticmethod
    def retrieve_context(
        query: str,
        repository_id: str | None = None
    ):
        logger.info(
            "Retrieving context. repository=%s",
            repository_id or "all"
        )

        query_embedding = (
            EmbeddingGenerator
            .generate_query_embedding(
                query
            )
        )

        results = VectorStore.search(
            query_embedding,
            repository_id=repository_id,
            query=query
        )

        return results

    @staticmethod
    def build_prompt(
        query: str,
        context_chunks,
        history=None
    ):

        context_text = ""

        for chunk in context_chunks:

            context_text += (
                f"\nFile: "
                f"{chunk['source_file']}\n"
            )

            context_text += (
                f"{chunk['content']}\n"
            )

        conversation_text = ""

        for message in history or []:
            conversation_text += (
                f"{message['role'].title()}: "
                f"{message['content']}\n"
            )

        prompt = f"""
You are an AI repository assistant.

Answer the user's question using ONLY the repository context below.
Be precise, cite source file names when relevant, and say when the
available context is insufficient. Do not invent files or behavior.

Repository Context:
{context_text or "No matching repository context was found."}

Recent Conversation:
{conversation_text or "No previous conversation."}

User Question:
{query}
"""

        return prompt
    
    @staticmethod
    def generate_response(
        prompt: str
    ):
        if openai_client:
            _key, _base, effective_model = get_effective_ai_config()
            try:
                response = openai_client.chat.completions.create(
                    model=effective_model,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ]
                )
                return response.choices[0].message.content
            except Exception as error:
                logger.error(
                    "AI response failed: %s",
                    error,
                    exc_info=True
                )
                raise AppError(
                    "AI response generation failed.",
                    str(error),
                    503
                ) from error

        if not ollama_client:
            raise AppError(
                "No AI service configured.",
                "Please configure OPENAI_API_KEY (or Groq key) or OLLAMA_HOST.",
                503
            )

        try:
            response = ollama_client.chat(
                model=settings.ollama_model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ]
            )
        except Exception as error:
            logger.error(
                "Ollama response failed: %s",
                error,
                exc_info=True
            )
            raise AppError(
                "AI response generation failed.",
                "Confirm Ollama is running and the configured model is installed.",
                503
            ) from error

        return response["message"]["content"]

    @staticmethod
    def stream_response(
        prompt: str
    ):
        if openai_client:
            _key, _base, effective_model = get_effective_ai_config()
            try:
                response = openai_client.chat.completions.create(
                    model=effective_model,
                    messages=[
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    stream=True
                )
            except Exception as error:
                logger.error(
                    "AI streaming failed: %s",
                    error,
                    exc_info=True
                )
                raise AppError(
                    "AI streaming failed.",
                    str(error),
                    503
                ) from error

            try:
                for chunk in response:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        yield content
                return
            except Exception as error:
                logger.error(
                    "AI stream iteration failed: %s",
                    error,
                    exc_info=True
                )
                raise AppError(
                    "AI streaming failed.",
                    str(error),
                    503
                ) from error

        if not ollama_client:
            raise AppError(
                "No AI service configured.",
                "Please configure OPENAI_API_KEY (or Groq key) or OLLAMA_HOST.",
                503
            )

        try:
            response = ollama_client.chat(
                model=settings.ollama_model,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                stream=True
            )
        except Exception as error:
            logger.error(
                "Ollama streaming failed: %s",
                error,
                exc_info=True
            )
            raise AppError(
                "AI streaming failed.",
                "Confirm Ollama is running and the configured model is installed.",
                503
            ) from error

        try:
            for chunk in response:

                content = chunk.get(
                    "message",
                    {}
                ).get(
                    "content",
                    ""
                )

                if content:
                    yield content
        except Exception as error:
            logger.error(
                "Ollama stream iteration failed: %s",
                error,
                exc_info=True
            )
            raise AppError(
                "AI streaming failed.",
                "Confirm Ollama is running and the configured model is installed.",
                503
            ) from error
