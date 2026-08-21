"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  CalendarDays,
  Database,
  Files,
  GitBranch,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  getRepositories,
  PersistentRepository,
} from "@/services/api";

export default function RepositoriesPage() {
  const router = useRouter();
  const [repositories, setRepositories] =
    useState<PersistentRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRepositories()
      .then(setRepositories)
      .catch((requestError: Error) => {
        setError(requestError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openAssistant = (
    repository: PersistentRepository
  ) => {
    const latestSession =
      repository.chatSessions[0];

    localStorage.setItem(
      "devinsight-active-repository",
      repository.vectorRepositoryId
    );
    localStorage.setItem(
      "devinsight-active-persistent-repository",
      repository.id
    );

    if (latestSession) {
      localStorage.setItem(
        "devinsight-active-chat-session",
        latestSession.id
      );
    } else {
      localStorage.removeItem(
        "devinsight-active-chat-session"
      );
      localStorage.removeItem("devinsight-chat");
    }

    router.push("/dashboard/assistant");
  };

  return (
    <main className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />

      <section className="min-w-0 flex-1 px-5 pb-10 pt-20 sm:px-7 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              Repository Memory
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Analyzed Repositories
            </h1>
            <p className="mt-2 text-muted-foreground">
              Reopen previous codebases and continue their AI conversations.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
          >
            Analyze Repository
          </button>
        </div>

        {loading && (
          <div className="mt-16 flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading repository history...
          </div>
        )}

        {error && (
          <div className="mt-10 border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading
          && !error
          && repositories.length === 0
          && (
            <div className="mt-10 border border-border bg-card p-8 text-muted-foreground">
              <GitBranch className="h-8 w-8 text-cyan-400" />
              <h2 className="mt-5 text-xl font-semibold text-foreground">
                No analyzed repositories yet
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingest a GitHub repository from the dashboard to create its persistent record.
              </p>
            </div>
          )}

        <div className="mt-10 grid gap-5 xl:grid-cols-2">
          {repositories.map((repository) => (
            <article
              key={repository.id}
              className="border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-xl font-semibold">
                      {repository.name}
                    </h2>
                  </div>
                  <p className="mt-3 break-all text-sm text-muted-foreground">
                    {repository.url}
                  </p>
                </div>

                <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {repository.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="bg-background/60 p-3">
                  <Files className="h-4 w-4 text-violet-400" />
                  <p className="mt-3 text-lg font-semibold">
                    {repository.filesProcessed}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Files
                  </p>
                </div>
                <div className="bg-background/60 p-3">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <p className="mt-3 text-lg font-semibold">
                    {repository._count.embeddingMetadata}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chunks
                  </p>
                </div>
                <div className="bg-background/60 p-3">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  <p className="mt-3 text-lg font-semibold">
                    {repository._count.chatSessions}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chats
                  </p>
                </div>
                <div className="bg-background/60 p-3">
                  <CalendarDays className="h-4 w-4 text-emerald-400" />
                  <p className="mt-3 text-sm font-semibold">
                    {new Date(
                      repository.ingestedAt
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ingested
                  </p>
                </div>
              </div>

              <button
                onClick={() => openAssistant(repository)}
                className="mt-6 flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-600 dark:text-cyan-200 transition-all hover:bg-cyan-500/20"
              >
                <Bot className="h-4 w-4" />
                {repository.chatSessions[0]
                  ? "Reopen Assistant Chat"
                  : "Open AI Assistant"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
