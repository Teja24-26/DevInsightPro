"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Clock3,
  FileCode2,
  GitBranch,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/status";
import {
  CodeSearchResult,
  getRepositories,
  PersistentRepository,
  searchCode,
} from "@/services/api";

const HISTORY_KEY = "devinsight-code-search-history";

export default function CodeSearchPage() {
  const [query, setQuery] = useState("");
  const [selectedRepositoryId, setSelectedRepositoryId] =
    useState(() => {
      if (typeof window === "undefined") return "";

      return (
        localStorage.getItem(
          "devinsight-active-repository"
        ) || ""
      );
    });
  const [repositories, setRepositories] = useState<
    PersistentRepository[]
  >([]);
  const [results, setResults] = useState<
    CodeSearchResult[]
  >([]);
  const [history, setHistory] = useState<string[]>(
    () => {
      if (typeof window === "undefined") return [];

      const savedHistory =
        localStorage.getItem(HISTORY_KEY);

      if (!savedHistory) return [];

      try {
        return JSON.parse(savedHistory) as string[];
      } catch {
        return [];
      }
    }
  );
  const [loading, setLoading] = useState(false);
  const [repositoryLoading, setRepositoryLoading] =
    useState(true);
  const [error, setError] = useState("");

  const saveSearchHistory = useCallback(
    (searchTerm: string) => {
      setHistory((currentHistory) => {
        const nextHistory = [
          searchTerm,
          ...currentHistory.filter(
            (item) => item !== searchTerm
          ),
        ].slice(0, 6);

        localStorage.setItem(
          HISTORY_KEY,
          JSON.stringify(nextHistory)
        );

        return nextHistory;
      });
    },
    []
  );

  useEffect(() => {
    getRepositories()
      .then(setRepositories)
      .catch((requestError: Error) => {
        setError(requestError.message);
      })
      .finally(() => {
        setRepositoryLoading(false);
      });
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();
    let isActive = true;

    if (trimmedQuery.length < 2) {
      return () => {
        isActive = false;
      };
    }

    const timeoutId = window.setTimeout(() => {
      if (!isActive) return;

      setLoading(true);
      setError("");

      searchCode(
        trimmedQuery,
        selectedRepositoryId || null
      )
        .then((searchResults) => {
          if (!isActive) return;

          setResults(searchResults);
          saveSearchHistory(trimmedQuery);
        })
        .catch((requestError: Error) => {
          if (!isActive) return;

          setResults([]);
          setError(requestError.message);
        })
        .finally(() => {
          if (!isActive) return;

          setLoading(false);
        });
    }, 450);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, saveSearchHistory, selectedRepositoryId]);

  const repositoryNameByVectorId = useMemo(() => {
    return new Map(
      repositories.map((repository) => [
        repository.vectorRepositoryId,
        repository.name,
      ])
    );
  }, [repositories]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
  };

  const trimmedQuery = query.trim();
  const hasSearch = trimmedQuery.length >= 2;
  const emptySearch =
    hasSearch && !loading && !error && results.length === 0;

  return (
    <main className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />

      <section className="min-w-0 flex-1 px-5 pb-10 pt-20 sm:px-7 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-400">
              Semantic Retrieval
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Repository Code Search
            </h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Find relevant implementation details across indexed repositories with FAISS-backed embeddings.
            </p>
          </div>
        </div>

        <div className="mt-8 border border-border bg-card p-5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-300" />
              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search auth flows, route handlers, vector indexing, component state..."
                className="h-14 w-full rounded-2xl border border-input bg-background px-12 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-violet-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>

            <label className="relative block">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-300" />
              <select
                value={selectedRepositoryId}
                onChange={(event) =>
                  setSelectedRepositoryId(
                    event.target.value
                  )
                }
                disabled={repositoryLoading}
                className="h-14 w-full appearance-none rounded-2xl border border-input bg-background px-12 text-sm text-foreground outline-none transition-all focus:border-violet-500 disabled:opacity-60"
              >
                <option value="">All repositories</option>
                {repositories.map((repository) => (
                  <option
                    key={repository.id}
                    value={repository.vectorRepositoryId}
                  >
                    {repository.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {history.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                Recent
              </div>
              {history.map((historyItem) => (
                <button
                  key={historyItem}
                  type="button"
                  onClick={() => setQuery(historyItem)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-200"
                >
                  {historyItem}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <LoadingState message="Searching semantic code index..." />
        )}

        {error && <ErrorState message={error} />}

        {!hasSearch && !error && (
          <div className="mt-10 border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-8 shadow-2xl shadow-violet-500/10">
            <FileCode2 className="h-10 w-10 text-cyan-300" />
            <h2 className="mt-5 text-2xl font-semibold">
              Search by behavior, intent, or implementation detail
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Query the vector store for code chunks even when the exact symbol, file name, or phrasing is unknown.
            </p>
          </div>
        )}

        {emptySearch && (
          <EmptyState
            title="No semantic matches found"
            description="Try a broader phrase or switch the repository filter."
          />
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            {results.map((result) => {
              const repositoryName =
                repositoryNameByVectorId.get(
                  result.repository
                ) || result.repository;

              return (
                <article
                  key={`${result.repository}-${result.relativePath}-${result.chunkIndex}`}
                  className="border border-border bg-card p-5 shadow-xl shadow-slate-950/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <FileCode2 className="h-5 w-5 shrink-0 text-cyan-300" />
                        <h2 className="truncate text-lg font-semibold">
                          {result.file}
                        </h2>
                      </div>
                      <p className="mt-2 break-all text-sm text-muted-foreground">
                        {result.relativePath}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300">
                        {(result.score * 100).toFixed(1)}%
                      </span>
                      <span className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                        Chunk {result.chunkIndex}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <GitBranch className="h-4 w-4 text-violet-300" />
                    {repositoryName}
                  </div>

                  <pre className="mt-5 max-h-72 overflow-auto rounded-2xl border border-border bg-background p-4 text-sm leading-6 text-foreground">
                    <code>{result.chunkPreview}</code>
                  </pre>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
