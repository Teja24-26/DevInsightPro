import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from core.logger import get_logger

from services.ai_service import (
    AIService
)

router = APIRouter()
logger = get_logger("api.chat")


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    query: str = Field(
        min_length=2,
        max_length=2000
    )
    repository_id: str | None = None
    history: list[ChatMessage] = Field(
        default_factory=list
    )


def build_chat_prompt(payload: ChatRequest):

    context = (
        AIService.retrieve_context(
            payload.query,
            payload.repository_id
        )
    )

    prompt = (
        AIService.build_prompt(
            payload.query,
            context["chunks"],
            [
                message.model_dump()
                for message in payload.history[-6:]
            ]
        )
    )

    return context, prompt


@router.post("/chat")
async def repository_chat(
    payload: ChatRequest
):
    logger.info(
        "Chat request received. repository=%s",
        payload.repository_id or "all"
    )

    context, prompt = build_chat_prompt(payload)

    answer = (
        AIService.generate_response(
            prompt
        )
    )

    return {
        "success": True,
        "query": payload.query,
        "answer": answer,
        "context": context
    }


@router.post("/chat/stream")
async def repository_chat_stream(
    payload: ChatRequest
):
    logger.info(
        "Streaming chat request received. repository=%s",
        payload.repository_id or "all"
    )

    _, prompt = build_chat_prompt(payload)

    def generate_stream():

        try:
            for token in AIService.stream_response(
                prompt
            ):
                yield json.dumps({
                    "type": "token",
                    "content": token
                }) + "\n"

            yield json.dumps({
                "type": "done"
            }) + "\n"

        except Exception as error:
            error_message = getattr(error, "detail", None) or getattr(error, "message", None) or str(error)
            yield json.dumps({
                "type": "error",
                "message": f"AI Streaming error: {error_message}",
                "detail": str(error)
            }) + "\n"

    return StreamingResponse(
        generate_stream(),
        media_type="application/x-ndjson"
    )
