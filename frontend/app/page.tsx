"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Boxes,
  Braces,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  Layers3,
  MessageSquareText,
  Search,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  { icon: GitBranch, title: "Repository Intelligence", text: "Turn complete GitHub repositories into a navigable AI knowledge layer." },
  { icon: Search, title: "Semantic Search", text: "Surface relevant implementation details with cosine similarity and keyword reranking." },
  { icon: BrainCircuit, title: "Vector Embeddings", text: "Generate compact semantic representations with a local embedding pipeline." },
  { icon: Zap, title: "AI Streaming", text: "Stream grounded Ollama answers token by token for a responsive developer workflow." },
  { icon: Braces, title: "Smart Code Chunking", text: "Preserve source context while processing files into retrieval-ready semantic chunks." },
  { icon: Database, title: "Persistent Memory", text: "Reopen indexed codebases and continue repository-aware conversations over time." },
];

const workflow = [
  ["01", "GitHub Repo", GitBranch],
  ["02", "Chunking", Braces],
  ["03", "Embeddings", BrainCircuit],
  ["04", "FAISS", Layers3],
  ["05", "AI Analysis", Bot],
] as const;

const queries = [
  "Explain the backend request lifecycle",
  "Where is repository ingestion handled?",
  "Summarize the persistence architecture",
  "Find the semantic retrieval implementation",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#070B16] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,58,237,0.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(6,182,212,0.14),transparent_28%)]" />

      <header className="relative z-10 border-b border-white/5 bg-slate-950/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
              <Sparkles className="h-5 w-5" />
            </span>
            DevInsight AI <span className="text-cyan-300">PRO</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#architecture" className="transition hover:text-white">Architecture</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in" className="hidden text-sm text-slate-300 transition hover:text-white sm:block">
              Sign in
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/20">
              Open Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 pb-28 pt-24 sm:pt-32">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.7 }} className="mx-auto max-w-5xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-200 backdrop-blur-xl">
            <Sparkles className="h-4 w-4" /> Local AI. Repository aware.
          </div>
          <h1 className="mt-8 text-5xl font-bold leading-[1.08] tracking-tight sm:text-7xl lg:text-8xl">
            Your codebase,
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              finally explainable.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-400 sm:text-xl">
            DevInsight transforms GitHub repositories into persistent AI knowledge. Search semantics, inspect vectors, and stream grounded answers from your code.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-4 font-semibold shadow-2xl shadow-violet-600/20 transition hover:scale-[1.03]">
              Start Analyzing <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-7 py-4 font-semibold text-slate-200 backdrop-blur-xl transition hover:border-cyan-400/50 hover:bg-slate-800/70">
              <Workflow className="mr-2 h-5 w-5" /> Open Dashboard
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }} className="mx-auto mt-20 max-w-5xl rounded-3xl border border-white/10 bg-slate-900/50 p-3 shadow-2xl shadow-violet-950/40 backdrop-blur-2xl">
          <div className="rounded-2xl border border-white/5 bg-slate-950/80 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 text-sm text-slate-400"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Intelligence workspace connected</div>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">llama3.2:1b + FAISS</span>
            </div>
            <div className="grid gap-4 pt-6 sm:grid-cols-3">
              {[
                ["Repository memory", "Persistent", GitBranch],
                ["Semantic vectors", "Indexed", Layers3],
                ["AI responses", "Streaming", MessageSquareText],
              ].map(([label, value, Icon]) => (
                <div key={label as string} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <p className="mt-5 text-sm text-slate-500">{label as string}</p>
                  <p className="mt-1 font-semibold text-slate-100">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="relative border-y border-white/5 bg-slate-950/35 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Core Intelligence" title="A repository-native AI toolkit" text="Every layer is designed for fast, grounded codebase exploration without sending your reasoning workflow through a generic chat interface." />
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ staggerChildren: 0.08 }} className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <motion.article key={feature.title} variants={fadeUp} whileHover={{ y: -6 }} className="rounded-2xl border border-white/8 bg-slate-900/45 p-6 backdrop-blur-xl">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300"><feature.icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="workflow" className="relative px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Repository Intelligence Workflow" title="From source tree to grounded answers" text="A focused local pipeline turns repository files into useful context for every question." />
          <div className="mt-12 grid gap-3 lg:grid-cols-5">
            {workflow.map(([number, label, Icon], index) => (
              <motion.div key={label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <p className="text-xs font-bold tracking-[0.22em] text-slate-600">{number}</p>
                <Icon className="mt-7 h-6 w-6 text-cyan-300" />
                <p className="mt-4 font-semibold">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <SectionTitle eyebrow="Ask Precisely" title="Questions that start with your code" text="Move from architectural overview to implementation detail without losing repository context." />
          <div className="space-y-3">
            {queries.map((query, index) => (
              <motion.div key={query} initial={{ opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/55 p-4 text-sm text-slate-300">
                <MessageSquareText className="h-5 w-5 shrink-0 text-violet-300" /> {query}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="relative border-y border-white/5 bg-slate-950/35 px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <SectionTitle eyebrow="Platform Architecture" title="Built as a real developer platform" text="The product foundation is modular: FastAPI ingestion and streaming, a Next.js application layer, PostgreSQL persistence through Prisma, and local retrieval with FAISS." />
          <div className="grid gap-3 sm:grid-cols-2">
            {["Next.js SaaS interface", "FastAPI service layer", "PostgreSQL + Prisma", "Ollama streaming", "FAISS vector search", "Sentence embeddings"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/55 p-4 text-sm text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-28 text-center">
        <Boxes className="mx-auto h-10 w-10 text-cyan-300" />
        <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">Make your next codebase legible.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">Index a repository, explore its semantic structure, and ask questions with local AI context.</p>
        <Link href="/dashboard" className="mt-8 inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-4 font-semibold shadow-2xl shadow-violet-600/20 transition hover:scale-[1.03]">Start Analyzing <ArrowRight className="ml-2 h-5 w-5" /></Link>
      </section>

      <footer className="relative border-t border-white/5 px-6 py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p>DevInsight AI PRO. Local-first repository intelligence.</p>
          <div className="flex gap-5"><Link href="/auth/sign-in">Sign in</Link><Link href="/auth/sign-up">Create account</Link><Link href="/dashboard">Dashboard</Link></div>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      <p className="mt-5 max-w-2xl leading-7 text-slate-400">{text}</p>
    </div>
  );
}
