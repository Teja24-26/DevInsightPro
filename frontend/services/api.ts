function getBackendApiBaseUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not configured."
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface RepositorySummary {
  repo_id: string;
  files_processed: number;
  total_chunks: number;
  files?: {
    name?: string;
    path?: string;
    relative_path?: string;
    extension?: string;
    size?: number;
  }[];
  sample_chunks?: {
    content?: string;
    source_file?: string;
  }[];
  chunk_metadata?: {
    chunk_index: number;
    source_file: string;
    length: number;
  }[];
}

export interface IngestRepositoryResponse {
  success: boolean;
  repository: RepositorySummary;
}

interface ChatResponse {
  success: boolean;
  answer: string;
}

export interface CodeSearchResult {
  repository: string;
  file: string;
  score: number;
  chunkPreview: string;
  relativePath: string;
  chunkIndex: number;
}

interface CodeSearchResponse {
  results: CodeSearchResult[];
}

interface StreamEvent {
  type: "token" | "done" | "error";
  content?: string;
  message?: string;
}

export interface PersistentRepository {
  id: string;
  vectorRepositoryId: string;
  name: string;
  url: string;
  status: "PROCESSING" | "READY" | "FAILED";
  filesProcessed: number;
  totalChunks: number;
  ingestedAt: string;
  updatedAt: string;
  _count: {
    chatSessions: number;
    embeddingMetadata: number;
  };
  chatSessions: {
    id: string;
    title: string;
    updatedAt: string;
  }[];
}

export interface PersistentChatSession {
  id: string;
  repositoryId: string;
  title: string;
  messages: {
    id: string;
    role: "USER" | "ASSISTANT" | "SYSTEM";
    content: string;
    createdAt: string;
  }[];
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const contentType =
    response.headers.get("content-type") || "";
  const payload = contentType.includes(
    "application/json"
  )
    ? await response.json()
    : {
        error: await response.text(),
      };

  if (!response.ok) {
    throw new Error(
      payload.error
      || payload.message
      || payload.detail
      || payload.details
      || "Backend request failed."
    );
  }

  return payload as T;
}

export async function ingestRepository(
  repoUrl: string
): Promise<IngestRepositoryResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    180000
  );

  try {
    const apiBaseUrl = getBackendApiBaseUrl();
    const response = await fetch(
      `${apiBaseUrl}/ingest-repository`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_url: repoUrl,
        }),
        signal: controller.signal,
      }
    );

    return await parseResponse<IngestRepositoryResponse>(
      response
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function chatWithRepository(
  query: string,
  repositoryId: string | null = null,
  history: ChatMessage[] = []
): Promise<ChatResponse> {
  const apiBaseUrl = getBackendApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        repository_id: repositoryId,
        history,
      }),
    }
  );

  return parseResponse<ChatResponse>(
    response
  );
}

export async function searchCode(
  query: string,
  repositoryId: string | null = null
): Promise<CodeSearchResult[]> {
  const apiBaseUrl = getBackendApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl}/search`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        repositoryId,
      }),
    }
  );

  const payload =
    await parseResponse<CodeSearchResponse>(
      response
    );

  return payload.results;
}

export async function streamChatWithRepository(
  query: string,
  repositoryId: string | null = null,
  history: ChatMessage[] = [],
  onToken: (token: string) => void
): Promise<void> {
  const apiBaseUrl = getBackendApiBaseUrl();
  const response = await fetch(
    `${apiBaseUrl}/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        repository_id: repositoryId,
        history,
      }),
    }
  );

  if (!response.ok || !response.body) {
    throw new Error(
      "Unable to connect to the AI streaming endpoint."
    );
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .getReader();

  let bufferedText = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    bufferedText += value;
    const lines = bufferedText.split("\n");
    bufferedText = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      const event = JSON.parse(line) as StreamEvent;

      if (event.type === "token" && event.content) {
        onToken(event.content);
      }

      if (event.type === "error") {
        throw new Error(
          event.message || "Ollama streaming failed."
        );
      }
    }
  }
}

export async function persistRepository(
  repoUrl: string,
  response: IngestRepositoryResponse
): Promise<PersistentRepository> {
  const persistResponse = await fetch(
    "/api/repositories",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoUrl,
        vectorRepositoryId:
          response.repository.repo_id,
        filesProcessed:
          response.repository.files_processed,
        totalChunks:
          response.repository.total_chunks,
        chunkMetadata:
          response.repository.chunk_metadata || [],
      }),
    }
  );

  const payload = await parseResponse<{
    repository: PersistentRepository;
  }>(persistResponse);

  return payload.repository;
}

export async function getRepositories():
Promise<PersistentRepository[]> {
  const response = await fetch(
    "/api/repositories",
    {
      cache: "no-store",
    }
  );
  const payload = await parseResponse<{
    repositories: PersistentRepository[];
  }>(response);

  return payload.repositories;
}

export async function createChatSession(
  repositoryId: string,
  title: string
): Promise<string> {
  const response = await fetch(
    "/api/chat-sessions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repositoryId,
        title,
      }),
    }
  );
  const payload = await parseResponse<{
    session: { id: string };
  }>(response);

  return payload.session.id;
}

export async function saveChatMessage(
  sessionId: string,
  role: "USER" | "ASSISTANT",
  content: string
): Promise<void> {
  const response = await fetch(
    `/api/chat-sessions/${sessionId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
        content,
      }),
    }
  );

  await parseResponse(response);
}

export async function getChatSession(
  sessionId: string
): Promise<PersistentChatSession> {
  const response = await fetch(
    `/api/chat-sessions/${sessionId}`,
    {
      cache: "no-store",
    }
  );
  const payload = await parseResponse<{
    session: PersistentChatSession;
  }>(response);

  return payload.session;
}
