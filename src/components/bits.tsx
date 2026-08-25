import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const PRIORITY_CLASS: Record<Priority, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-warning/15 text-warning",
  high: "bg-accent/15 text-accent",
  urgent: "bg-destructive/15 text-destructive",
};

export function PriorityTag({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap",
        PRIORITY_CLASS[priority],
      )}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

const STATUS_CLASS: Record<Status, string> = {
  todo: "bg-secondary text-muted-foreground",
  "in-progress": "bg-primary/12 text-primary",
  completed: "bg-success/15 text-success",
};

export function StatusTag({ status }: { status: Status }) {
  return (
    <span className={cn("rounded px-2 py-0.5 font-mono text-[11px]", STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 max-w-[62ch] text-sm text-muted-foreground text-pretty">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1.5 max-w-[44ch] text-sm text-muted-foreground text-pretty">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function Panel({
  title,
  meta,
  children,
  className,
}: {
  title?: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      {title && (
        <header className="flex h-11 items-center justify-between gap-3 border-b border-border px-4">
          <h2 className="font-display text-sm font-semibold">{title}</h2>
          {meta}
        </header>
      )}
      {children}
    </section>
  );
}

export function formatDate(iso: string | null) {
  if (!iso) return "No date";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}
