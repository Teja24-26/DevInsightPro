import { NextResponse } from "next/server";
import { apiError, persistenceError } from "@/lib/api-error";
import { getPrisma } from "@/lib/prisma";
import { getRepositoryName } from "@/lib/repository-name";

interface EmbeddingMetadataInput {
  chunk_index: number;
  source_file: string;
  length: number;
  content_preview?: string;
}

interface PersistRepositoryRequest {
  repoUrl: string;
  vectorRepositoryId: string;
  filesProcessed: number;
  totalChunks: number;
  chunkMetadata?: EmbeddingMetadataInput[];
}

export async function GET() {
  try {
    const prisma = getPrisma();
    const repositories =
      await prisma.repository.findMany({
        orderBy: {
          ingestedAt: "desc",
        },
        include: {
          _count: {
            select: {
              chatSessions: true,
              embeddingMetadata: true,
            },
          },
          chatSessions: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              title: true,
              updatedAt: true,
            },
          },
        },
      });

    return NextResponse.json({ repositories });
  } catch (error) {
    return persistenceError(error);
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const payload =
      (await request.json()) as PersistRepositoryRequest;

    if (
      !payload.repoUrl
      || !payload.vectorRepositoryId
    ) {
      return apiError(
        "Repository metadata is incomplete.",
        "",
        400
      );
    }

    const chunkMetadata = payload.chunkMetadata ?? [];

    const repository = await prisma.$transaction(
      async (transaction) => {
        const existing = await transaction.repository.findUnique({
          where: { vectorRepositoryId: payload.vectorRepositoryId },
        });

        if (existing) {
          // Delete old metadata first to avoid unique constraint violations
          await transaction.embeddingMetadata.deleteMany({
            where: { repositoryId: existing.id },
          });

          const updatedRepository = await transaction.repository.update({
            where: { id: existing.id },
            data: {
              name: getRepositoryName(payload.repoUrl),
              url: payload.repoUrl,
              filesProcessed: payload.filesProcessed,
              totalChunks: payload.totalChunks,
              status: "READY",
              updatedAt: new Date(),
            },
          });

          if (chunkMetadata.length > 0) {
            await transaction.embeddingMetadata.createMany({
              data: chunkMetadata.map(
                (chunk) => ({
                  repositoryId: updatedRepository.id,
                  vectorRepositoryId: payload.vectorRepositoryId,
                  sourceFile: chunk.source_file,
                  chunkIndex: chunk.chunk_index,
                  contentLength: chunk.length,
                  contentPreview: chunk.content_preview?.slice(0, 320),
                })
              ),
            });
          }

          return updatedRepository;
        }

        const createdRepository =
          await transaction.repository.create({
            data: {
              name: getRepositoryName(payload.repoUrl),
              url: payload.repoUrl,
              vectorRepositoryId:
                payload.vectorRepositoryId,
              filesProcessed:
                payload.filesProcessed,
              totalChunks: payload.totalChunks,
              status: "READY",
            },
          });

        if (chunkMetadata.length > 0) {
          await transaction.embeddingMetadata.createMany({
            data: chunkMetadata.map(
              (chunk) => ({
                repositoryId: createdRepository.id,
                vectorRepositoryId:
                  payload.vectorRepositoryId,
                sourceFile: chunk.source_file,
                chunkIndex: chunk.chunk_index,
                contentLength: chunk.length,
                contentPreview:
                  chunk.content_preview?.slice(0, 320),
              })
            ),
          });
        }

        return createdRepository;
      }
    );

    return NextResponse.json({ repository });
  } catch (error) {
    return persistenceError(error);
  }
}
