"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F172A] px-5 text-white">
      <section className="max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
        <AlertCircle className="mx-auto h-10 w-10 text-red-300" />
        <h1 className="mt-5 text-2xl font-semibold">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-red-100/80">
          The interface hit an unexpected error. You can retry without losing the project state.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-medium"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
