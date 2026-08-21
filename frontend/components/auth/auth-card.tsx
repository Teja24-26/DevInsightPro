"use client";

import { motion } from "framer-motion";
import { ArrowRight, GitBranch, LockKeyhole, Mail, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function AuthCard({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const searchParams = useSearchParams();

  // Input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const apiPath = isSignUp ? "/api/auth/sign-up" : "/api/auth/sign-in";
    const body = isSignUp 
      ? { email, password, name } 
      : { email, password };

    try {
      const response = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred. Please try again.");
      }

      if (isSignUp) {
        setSuccess("Account created successfully! Please sign in with your credentials.");
        setEmail("");
        setPassword("");
        setName("");
        // Redirect to sign-in after a short delay
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 3000);
      } else {
        setSuccess("Signed in successfully. Redirecting...");
        // Redirect to dashboard (or where the user was heading)
        const from = searchParams.get("from") || "/dashboard";
        router.push(from);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground transition-colors duration-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(6,182,212,0.16),transparent_30%)]" />
      <Link href="/" className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Sparkles className="h-5 w-5 text-violet-300" /> DevInsight AI PRO
      </Link>
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">{isSignUp ? "Create Workspace" : "Welcome Back"}</p>
        <h1 className="mt-4 text-3xl font-bold">{isSignUp ? "Start analyzing code" : "Sign in to DevInsight"}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isSignUp 
            ? "Create an account to persist your repositories and chat histories." 
            : "Sign in with your email to access your workspace."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {isSignUp && (
            <label className="block">
              <span className="text-sm text-muted-foreground">Your Name</span>
              <span className="mt-2 flex items-center gap-3 rounded-xl border border-input bg-background px-4 focus-within:border-violet-400">
                <User className="h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" 
                />
              </span>
            </label>
          )}

          <label className="block">
            <span className="text-sm text-muted-foreground">Email address</span>
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-input bg-background px-4 focus-within:border-violet-400">
              <Mail className="h-4 w-4 text-slate-500" />
              <input 
                required 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" 
              />
            </span>
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Password</span>
            <span className="mt-2 flex items-center gap-3 rounded-xl border border-input bg-background px-4 focus-within:border-violet-400">
              <LockKeyhole className="h-4 w-4 text-slate-500" />
              <input 
                required 
                minLength={8} 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters" 
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60" 
              />
            </span>
          </label>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              {success}
            </p>
          )}

          <button 
            disabled={loading}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold transition hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Create account" : "Sign in"} 
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground/60"><span className="h-px flex-1 bg-border" /> OR CONTINUE WITH <span className="h-px flex-1 bg-border" /></div>
        <button type="button" className="flex h-12 w-full items-center justify-center rounded-xl border border-input bg-card text-foreground transition hover:bg-muted"><GitBranch className="mr-2 h-4 w-4" /> GitHub OAuth</button>
        <p className="mt-7 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to DevInsight?"}{" "}
          <Link className="font-medium text-cyan-500 dark:text-cyan-300" href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}>
            {isSignUp ? "Sign in" : "Create account"}
          </Link>
        </p>
      </motion.section>
    </main>
  );
}
