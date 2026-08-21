"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (
    message: string,
    variant?: ToastVariant
  ) => void;
}

const ToastContext =
  createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info"
    ) => {
      const id = crypto.randomUUID();

      setToasts((currentToasts) => [
        ...currentToasts,
        {
          id,
          message,
          variant,
        },
      ]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  const contextValue = useMemo(
    () => ({ showToast }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm shadow-2xl backdrop-blur-xl ${
              toast.variant === "error"
                ? "border-red-500/30 bg-red-500/15 text-red-100"
                : toast.variant === "success"
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-100"
                : "border-cyan-500/30 bg-cyan-500/15 text-cyan-100"
            }`}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used within ToastProvider."
    );
  }

  return context;
}
