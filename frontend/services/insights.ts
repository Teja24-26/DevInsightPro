export interface InsightSummary {
  totalRepositories: number;
  totalEmbeddings: number;
  totalFiles: number;
  averageChunkLength: number;
}

export interface InsightRepository {
  id: string;
  name: string;
  url: string;
  vectorRepositoryId: string;
  filesProcessed: number;
  totalChunks: number;
  ingestedAt: string;
  embeddingCount: number;
}

export interface InsightChunk {
  id: string;
  repositoryId: string;
  repositoryName: string;
  vectorRepositoryId: string;
  sourceFile: string;
  chunkIndex: number;
  contentLength: number;
  contentPreview: string | null;
  createdAt: string;
}

export interface InsightsResponse {
  summary: InsightSummary;
  repositories: InsightRepository[];
  chunks: InsightChunk[];
}

export async function getInsights(): Promise<InsightsResponse> {
  const response = await fetch("/api/insights", { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.error
      || payload.details
      || payload.detail
      || "Unable to load vector metadata."
    );
  }

  return payload as InsightsResponse;
}
