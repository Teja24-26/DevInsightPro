"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  accent?: "violet" | "cyan" | "emerald" | "amber";
}) {
  const accentClasses = {
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300",
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${accentClasses[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground/80">{detail}</p>
    </motion.article>
  );
}
