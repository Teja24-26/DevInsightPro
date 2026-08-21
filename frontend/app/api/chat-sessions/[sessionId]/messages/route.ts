import { NextResponse } from "next/server";
import { apiError, persistenceError } from "@/lib/api-error";
import { getPrisma } from "@/lib/prisma";

interface ChatMessageRouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

interface CreateChatMessageRequest {
  role: "USER" | "ASSISTANT";
  content: string;
}

export async function POST(
  request: Request,
  context: ChatMessageRouteContext
) {
  try {
    const prisma = getPrisma();
    const { sessionId } = await context.params;
    const payload =
      (await request.json()) as CreateChatMessageRequest;

    if (!payload.role || !payload.content) {
      return apiError(
        "Message role and content are required.",
        "",
        400
      );
    }

    if (!["USER", "ASSISTANT"].includes(payload.role)) {
      return apiError(
        "Unsupported chat message role.",
        "Use USER or ASSISTANT.",
        400
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: payload.role,
        content: payload.content,
      },
    });

    await prisma.chatSession.update({
      where: {
        id: sessionId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    return persistenceError(error);
  }
}
