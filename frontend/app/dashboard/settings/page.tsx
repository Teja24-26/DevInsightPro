"use client";

import { useState } from "react";
import { Database, Layers3, Moon, Radio, Settings2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageHeading } from "@/components/dashboard/page-heading";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const [streaming, setStreaming] = useState(true);
  const { theme, setTheme } = useTheme();
  const darkTheme = theme === "dark";
  const setDarkTheme = (val: boolean) => setTheme(val ? "dark" : "light");
  const [repositoryMemory, setRepositoryMemory] = useState(true);
  const [reranking, setReranking] = useState(true);

  return (
    <DashboardShell>
      <PageHeading eyebrow="Workspace Configuration" title="Settings" description="Review the active local AI configuration and tune frontend preferences. These controls remain local to the current UI until user accounts are connected." />


      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3"><Settings2 className="h-5 w-5 text-violet-500 dark:text-violet-300" /><h2 className="text-lg font-semibold">Platform preferences</h2></div>
        <div className="mt-6 divide-y divide-border">
          <SettingRow icon={Radio} title="Streaming responses" description="Render Ollama tokens as the local model generates them." checked={streaming} setChecked={setStreaming} />
          <SettingRow icon={Moon} title="Dark interface" description="Keep the low-glare developer workspace theme active." checked={darkTheme} setChecked={setDarkTheme} />
          <SettingRow icon={Database} title="Persistent repository memory" description="Store repository records, chats, and embedding metadata in PostgreSQL." checked={repositoryMemory} setChecked={setRepositoryMemory} />
          <SettingRow icon={Layers3} title="Hybrid keyword reranking" description="Blend semantic similarity with code-aware keyword matches." checked={reranking} setChecked={setReranking} />
        </div>
      </section>

    </DashboardShell>
  );
}

function SettingRow({ icon: Icon, title, description, checked, setChecked }: { icon: typeof Radio; title: string; description: string; checked: boolean; setChecked: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
      <div className="flex gap-4">
        <Icon className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
        <div><h3 className="font-medium text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
      </div>
      <button type="button" onClick={() => setChecked(!checked)} aria-pressed={checked} className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-input"}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}
