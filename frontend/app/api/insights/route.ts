import { NextResponse } from "next/server";
import { persistenceError } from "@/lib/api-error";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const repositories = await prisma.repository.findMany({
      orderBy: { ingestedAt: "desc" },
      select: {
        id: true,
        name: true,
        url: true,
        vectorRepositoryId: true,
        filesProcessed: true,
        totalChunks: true,
        ingestedAt: true,
        embeddingMetadata: {
          orderBy: [{ sourceFile: "asc" }, { chunkIndex: "asc" }],
          select: {
            id: true,
            sourceFile: true,
            chunkIndex: true,
            contentLength: true,
            contentPreview: true,
            createdAt: true,
          },
        },
      },
    });

    const chunks = repositories.flatMap((repository) =>
      repository.embeddingMetadata.map((chunk) => ({
        ...chunk,
        repositoryId: repository.id,
        repositoryName: repository.name,
        vectorRepositoryId: repository.vectorRepositoryId,
      }))
    );

    return NextResponse.json({
      summary: {
        totalRepositories: repositories.length,
        totalEmbeddings: chunks.length,
        totalFiles: repositories.reduce(
          (total, repository) => total + repository.filesProcessed,
          0
        ),
        averageChunkLength: chunks.length
          ? Math.round(
              chunks.reduce(
                (total, chunk) => total + chunk.contentLength,
                0
              ) / chunks.length
            )
          : 0,
      },
      repositories: repositories.map(
        ({ embeddingMetadata, ...repository }) => ({
          ...repository,
          embeddingCount: embeddingMetadata.length,
        })
      ),
      chunks,
    });
  } catch (error) {
    return persistenceError(error);
  }
}
