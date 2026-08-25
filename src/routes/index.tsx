import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, ListChecks, Mail, RefreshCw, Sparkles, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState, LoadingBlock, Panel, PageHeader, PriorityTag, formatDate, relativeTime } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { workloadInsight } from "@/lib/ai-service";
import { useStore, useTaskStats } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Meridian AI Productivity" },
      {
        name: "description",
        content:
          "Today's overview, recent activity and AI insights across your meetings, tasks and emails.",
      },
      { property: "og:title", content: "Dashboard — Meridian AI Productivity" },
      {
        property: "og:description",
        content: "See what's due, what's overdue and what to do next — in one AI workspace.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { meetings, emails, tasks, activity, hydrated, preferences } = useStore();
  const stats = useTaskStats();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<{ insight: string; recommendation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadInsight() {
    setLoading(true);
    try {
      const next = stats.highPriority[0] ?? stats.open[0];
      const res = await workloadInsight({
        dueToday: stats.dueToday.length,
        overdue: stats.overdue.length,
        highPriority: stats.highPriority.length,
        completed: stats.completed.length,
        nextTask: next?.name ?? "",
      });
      setInsight(res);
    } catch {
      setInsight({
        insight: "Couldn't reach the AI service just now.",
        recommendation: "Try refreshing the insight in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hydrated && !insight) void loadInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const firstName = preferences.userName.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Good day, ${firstName}.`}
        description="Everything you've captured is triaged and ready to act on. Capture a meeting, plan a goal, or send the update that's waiting."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/meetings" })}>
              Summarize meeting
            </Button>
            <Button onClick={() => navigate({ to: "/email" })}>Generate email</Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Due today" value={stats.dueToday.length} hint="tasks scheduled" />
        <StatCard
          label="Overdue"
          value={stats.overdue.length}
          hint="need attention"
          tone="text-destructive"
        />
        <StatCard label="High priority" value={stats.highPriority.length} hint="open items" />
        <StatCard
          label="Completed"
          value={stats.completed.length}
          hint="all time"
          tone="text-success"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-lg border border-primary/30 bg-primary p-5 text-primary-foreground shadow-card">
            <div className="flex items-center justify-between">
              <p className="label-mono flex items-center gap-2 text-primary-foreground/70">
                <Sparkles className="size-3.5" /> AI insight
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void loadInsight()}
                disabled={loading}
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} />
                Refresh
              </Button>
            </div>
            {loading && !insight ? (
              <div className="mt-3 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-primary-foreground/20" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-primary-foreground/20" />
              </div>
            ) : (
              <>
                <p className="mt-3 max-w-[46ch] font-display text-lg leading-snug font-medium text-pretty">
                  {insight?.insight ?? "Your workspace is ready."}
                </p>
                <p className="mt-2 max-w-[52ch] text-sm text-primary-foreground/80 text-pretty">
                  {insight?.recommendation ?? "Capture a meeting to get started."}
                </p>
              </>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => navigate({ to: "/tasks" })}>
                Open planner
              </Button>
              <Button
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                onClick={() => navigate({ to: "/meetings" })}
              >
                Capture notes
              </Button>
            </div>
          </section>

          <Panel
            title="Today & overdue"
            meta={
              <Link to="/tasks" className="text-xs font-medium text-primary hover:underline">
                View planner →
              </Link>
            }
          >
            {!hydrated ? (
              <div className="p-4">
                <LoadingBlock />
              </div>
            ) : stats.dueToday.length + stats.overdue.length === 0 ? (
              <EmptyState
                title="Nothing due right now"
                description="When tasks have due dates, the ones needing attention today show up here."
                action={<Button onClick={() => navigate({ to: "/tasks" })}>Create a task</Button>}
              />
            ) : (
              <ul className="divide-y divide-border">
                {[...stats.overdue, ...stats.dueToday].slice(0, 6).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {t.category} · {formatDate(t.dueDate)}
                        {t.owner ? ` · ${t.owner}` : ""}
                      </span>
                    </span>
                    <PriorityTag priority={t.priority} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent meetings">
            {meetings.length === 0 ? (
              <EmptyState
                title="No meetings captured yet"
                description="Paste notes or a transcript and Meridian extracts the summary, decisions and action items."
                action={
                  <Button onClick={() => navigate({ to: "/meetings" })}>Summarize a meeting</Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {meetings.slice(0, 3).map((m) => (
                  <li key={m.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {relativeTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {m.summary?.summary ?? "Not summarized yet"}
                    </p>
                    <Link
                      to="/meetings"
                      className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                    >
                      Open summary →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-2 p-4">
              <QuickAction icon={Mail} label="Generate email" to="/email" />
              <QuickAction icon={CalendarCheck} label="Summarize meeting" to="/meetings" />
              <QuickAction icon={ListChecks} label="Create task" to="/tasks" />
              <QuickAction icon={Target} label="Plan a goal" to="/tasks" search={{ view: "plan" }} />
            </div>
          </Panel>

          <Panel title="Recent emails">
            {emails.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                Drafts you generate will be listed here.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {emails.slice(0, 4).map((e) => (
                  <li key={e.id} className="px-4 py-3">
                    <p className="truncate text-sm font-medium">{e.subject}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.tone} · {relativeTime(e.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent activity">
            {activity.length === 0 ? (
              <p className="px-4 py-5 text-sm text-muted-foreground">
                Nothing has happened yet — your actions across all three tools show up here.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {activity.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex gap-3 px-4 py-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                    <span className="leading-tight">
                      <span className="block text-xs">{a.text}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {relativeTime(a.createdAt)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Workspace">
            <dl className="grid grid-cols-3 gap-2 p-4 text-center">
              <Metric label="Tasks" value={tasks.length} />
              <Metric label="Meetings" value={meetings.length} />
              <Metric label="Emails" value={emails.length} />
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: string;
}) {
  return (
    <div className="panel p-4">
      <p className="label-mono">{label}</p>
      <p className={`mt-1 font-display text-3xl leading-none font-semibold ${tone ?? ""}`}>{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="label-mono">{label}</dt>
      <dd className="font-display text-xl font-semibold">{value}</dd>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  to,
  search,
}: {
  icon: typeof Mail;
  label: string;
  to: string;
  search?: Record<string, string>;
}) {
  return (
    <Link
      to={to}
      search={search as never}
      className="flex flex-col gap-2 rounded-md border border-border bg-secondary/60 p-3 text-xs font-medium transition-colors hover:bg-secondary"
    >
      <Icon className="size-4 text-primary" />
      {label}
    </Link>
  );
}
