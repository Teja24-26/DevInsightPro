"use client";


import Link from "next/link";
import { Sidebar } from "../../components/sidebar/sidebar";
import { DashboardHeader } from "../../components/dashboard/dashboard-header";
import { RepoInputCard } from "../../components/repo/repo-input-card";
import { useState, useEffect } from "react";
import { IngestRepositoryResponse, getRepositories, PersistentRepository } from "../../services/api";

export default function DashboardPage() {
  const [repositoryData, setRepositoryData] =
    useState<IngestRepositoryResponse | null>(
      null
    );
  const [repositories, setRepositories] = useState<PersistentRepository[]>([]);

  useEffect(() => {
    getRepositories()
      .then(setRepositories)
      .catch(console.error);
  }, [repositoryData]);

  const [repoLoading, setRepoLoading] =
  useState(false);

  const [repoStatus, setRepoStatus] =
  useState("");

  return (
    <main className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />

      <section className="min-w-0 flex-1 px-5 pb-10 pt-20 sm:px-7 lg:p-10">
        <DashboardHeader />

        {repoStatus && (
          <div
            className={`mt-6 rounded-2xl border px-5 py-4 text-sm font-medium shadow-lg ${
              repoLoading
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                : repoStatus.includes("successfully")
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {repoStatus}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          {/* Repository Input */}
          <div className="xl:col-span-1">
            <RepoInputCard
              setRepositoryData={setRepositoryData}
              setRepoLoading={setRepoLoading}
              setRepoStatus={setRepoStatus}
            />
          </div>

          {/* Repository Details */}
          {repositoryData && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Repository Details
              </h2>

              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>
                  <span className="text-muted-foreground/80">Repository:</span>{" "}
                  {
                    (
                      repositoryData as {
                        repository?: { repo_id?: string };
                      }
                    )?.repository?.repo_id || "Unknown Repository"
                  }
                </p>

                <p>
                  <span className="text-muted-foreground/80">Status:</span>{" "}
                  Successfully Ingested
                </p>
              </div>

              <Link href="/dashboard/assistant">

                <button
                  className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02]"
                >
                  Open AI Assistant
                </button>

              </Link>
            </div>
          )}

          {/* Total Repositories */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              Total Repositories
            </h2>

            <p className="mt-4 text-4xl font-bold text-violet-400">
              {repositories.length}
            </p>
          </div>

          {/* Embeddings Generated */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              Embeddings Generated
            </h2>

            <p className="mt-4 text-4xl font-bold text-cyan-400">
              {repositories.reduce((sum, r) => sum + r.totalChunks, 0)}
            </p>
          </div>

          {/* Vector Chunks */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">
              Vector Chunks
            </h2>

            <p className="mt-4 text-4xl font-bold text-amber-400">
              {repositories.reduce((sum, r) => sum + r.totalChunks, 0)}
            </p>
          </div>
        </div>
        
        {/* Sample Repository Chunks */}
        {repositoryData?.repository?.sample_chunks && (

          <div className="mt-10 rounded-2xl border border-border bg-card p-6">

            <h2 className="text-2xl font-semibold text-foreground">
              Sample Repository Chunks
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Preview of semantic chunks generated during repository ingestion.
            </p>

            <div className="mt-6 space-y-4">

              {repositoryData.repository.sample_chunks.map(
                (
                  chunk: {
                    content?: string;
                    source_file?: string;
                  },
                  index: number
                ) => (

                  <div
                    key={index}
                    className="rounded-xl border border-border bg-background p-4"
                  >

                    <p className="text-xs uppercase tracking-wide text-cyan-400">
                      {chunk.source_file || "Unknown File"}
                    </p>

                    <p className="mt-3 line-clamp-5 text-sm leading-relaxed text-slate-300">
                      {chunk.content || "No content"}
                    </p>

                  </div>
                )
              )}

            </div>
          </div>
        )}

        {repositoryData?.repository?.files && (

          <div className="mt-10 rounded-2xl border border-border bg-card p-6">

            <h2 className="text-2xl font-semibold text-foreground">
              Processed Repository Files
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Files extracted and processed during ingestion.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">

              {repositoryData.repository.files.map(
                (file: { name?: string; path?: string; relative_path?: string; extension?: string; size?: number }, index: number) => (

                  <div
                    key={index}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
                  >
                    <p className="font-medium">{file.name || "Unknown File"}</p>
                    <p className="truncate text-xs text-slate-500">
                      {file.relative_path || file.path}
                    </p>
                    <p className="text-xs text-slate-500">
                      {file.extension || "Unknown extension"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : "Unknown Size"}
                    </p>
                  </div>
                )
              )}

            </div>
          </div>
        )}


        

          
      </section>
    </main>
  );
}
