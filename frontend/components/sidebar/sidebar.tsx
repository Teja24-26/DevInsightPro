"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Database,
  GitBranch,
  Layers3,
  LayoutDashboard,
  Menu,
  SearchCode,
  Settings,
  Sparkles,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Repositories", icon: GitBranch, href: "/dashboard/repositories" },
  { title: "Code Search", icon: SearchCode, href: "/dashboard/code-search" },
  { title: "Embeddings", icon: Database, href: "/dashboard/embeddings" },
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (res.status === 401 || res.status === 404) {
          await handleSignOut();
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  }

  const sidebarContent = (
    <>
      <div>
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
            DevInsight AI
          </h1>
        </Link>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">
          Repository Intelligence
        </p>
      </div>

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                isActive
                  ? "border-violet-400/20 bg-violet-500/10 text-violet-600 dark:text-violet-200 shadow-lg shadow-violet-500/5"
                  : "border-transparent text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {user.name || "Developer"}
              </p>
              <p className="truncate text-[10px] text-sidebar-foreground/60">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar/35 text-sidebar-foreground/70 transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar/90 text-sidebar-foreground shadow-xl backdrop-blur-xl lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 p-6 backdrop-blur-xl lg:flex">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar p-6 shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
