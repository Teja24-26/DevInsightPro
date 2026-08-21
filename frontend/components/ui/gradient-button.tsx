"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function GradientButton({
  children,
  className,
  onClick,
  disabled,
}: GradientButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <Button
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-6 text-white shadow-lg shadow-violet-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        {children}
      </Button>
    </motion.div>
  );
}