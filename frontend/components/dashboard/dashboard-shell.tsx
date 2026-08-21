"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <Sidebar />
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="min-w-0 flex-1 px-5 pb-10 pt-20 sm:px-7 lg:p-10"
      >
        {children}
      </motion.section>
    </main>
  );
}
