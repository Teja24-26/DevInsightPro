export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
