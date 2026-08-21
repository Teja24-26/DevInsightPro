import { NextResponse } from "next/server";
import { apiError, persistenceError } from "@/lib/api-error";
import { getPrisma } from "@/lib/prisma";

interface ChatSessionRouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: ChatSessionRouteContext
) {
  try {
    const prisma = getPrisma();
    const { sessionId } = await context.params;
    const session = await prisma.chatSession.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        repository: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!session) {
      return apiError(
        "Chat session was not found.",
        "",
        404
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    return persistenceError(error);
  }
}
