import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export function LoadingState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-8 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-cyan-200">
      <Loader2 className="h-5 w-5 animate-spin" />
      {message}
    </div>
  );
}

export function ErrorState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-8">
      <Inbox className="h-8 w-8 text-cyan-300" />
      <h2 className="mt-5 text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
