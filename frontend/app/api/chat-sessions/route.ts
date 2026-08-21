import { NextResponse } from "next/server";
import { apiError, persistenceError } from "@/lib/api-error";
import { getPrisma } from "@/lib/prisma";

interface CreateChatSessionRequest {
  repositoryId: string;
  title: string;
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const payload =
      (await request.json()) as CreateChatSessionRequest;

    if (!payload.repositoryId || !payload.title) {
      return apiError(
        "Repository and title are required.",
        "",
        400
      );
    }

    const session = await prisma.chatSession.create({
      data: {
        repositoryId: payload.repositoryId,
        title: payload.title.slice(0, 120),
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    return persistenceError(error);
  }
}
