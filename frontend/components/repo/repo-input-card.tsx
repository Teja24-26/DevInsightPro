"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import { GradientButton } from "../ui/gradient-button";
import { useToast } from "../ui/toast-provider";
import {
  ingestRepository,
  IngestRepositoryResponse,
  persistRepository,
} from "../../services/api";

interface RepoInputCardProps {

  setRepositoryData: React.Dispatch<
    React.SetStateAction<
      IngestRepositoryResponse | null
    >
  >;

  setRepoLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  setRepoStatus: React.Dispatch<
    React.SetStateAction<string>
  >;
}

export function RepoInputCard({
  setRepositoryData,
  setRepoLoading,
  setRepoStatus,
}: RepoInputCardProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isValidGithubUrl = (value: string) =>
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/.test(
      value.trim()
    );

  const handleAnalyze = async () => {
    if (!isValidGithubUrl(repoUrl)) {
      setRepoStatus(
        "Enter a valid public GitHub repository URL."
      );
      showToast(
        "Enter a valid public GitHub repository URL.",
        "error"
      );
      return;
    }

    setLoading(true);
    setRepoLoading(true);
    setRepoStatus("Cloning repository and generating embeddings...");

    let normalizedUrl = repoUrl.trim().replace(/\/$/, "");
    if (normalizedUrl.toLowerCase().endsWith(".git")) {
      normalizedUrl = normalizedUrl.slice(0, -4);
    }

    try {
      const response = await ingestRepository(
        normalizedUrl
      );
      const persistentRepository =
        await persistRepository(
          normalizedUrl,
          response
        );

      setRepositoryData(response);
      localStorage.setItem(
        "devinsight-active-repository",
        response.repository.repo_id
      );
      localStorage.setItem(
        "devinsight-active-persistent-repository",
        persistentRepository.id
      );
      localStorage.removeItem(
        "devinsight-active-chat-session"
      );
      setRepoStatus("Repository ingested successfully.");
      showToast(
        "Repository ingested successfully.",
        "success"
      );

    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Repository ingestion failed.";
      setRepoStatus(
        message
      );
      showToast(
        message,
        "error"
      );
    } finally {
      setLoading(false);
      setRepoLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-8 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/20 p-3 text-violet-400">
          <GitBranch className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold">
            Repository Ingestion
          </h2>

          <p className="mt-1 text-muted-foreground">
            Analyze GitHub repositories using AI-powered ingestion.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <input
          type="text"
          placeholder="Paste GitHub repository URL..."
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          aria-label="GitHub repository URL"
          className="h-14 w-full rounded-2xl border border-input bg-background px-5 text-foreground outline-none transition-all focus:border-violet-500 placeholder:text-muted-foreground"
        />
      </div>

      <div className="mt-6">
        <GradientButton
          className="w-full"
          onClick={handleAnalyze}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Repository...
            </div>
          ) : (
            "Analyze Repository"
          )}
        </GradientButton>
      </div>
    </div>
  );
}
