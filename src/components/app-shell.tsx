import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
  ListChecks,
  Mail,
  Menu,
  Search,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AssistantPanel } from "@/components/assistant-panel";
import { useStore, useTaskStats } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Notes", icon: CalendarCheck },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { tasks, meetings, emails } = useStore();
  const stats = useTaskStats();

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAssistantOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary font-display text-base font-semibold text-primary-foreground">
              M
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold tracking-tight">
                Meridian
              </span>
              <span className="label-mono block">Chief of staff</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="space-y-0.5 px-3 py-4">
          <p className="label-mono px-3 pb-1.5">Workspace</p>
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              activeProps={{
                className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
              }}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}

          <p className="label-mono px-3 pt-5 pb-1.5">Views</p>
          <Link
            to="/tasks"
            search={{ view: "today" }}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <span>Today</span>
            <span className="font-mono text-xs text-muted-foreground">{stats.dueToday.length}</span>
          </Link>
          <Link
            to="/tasks"
            search={{ view: "overdue" }}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <span>Overdue</span>
            <span className="font-mono text-xs text-destructive">{stats.overdue.length}</span>
          </Link>
          <Link
            to="/settings"
            className="mt-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            activeProps={{
              className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            }}
          >
            <Settings className="size-4 shrink-0" />
            Settings
          </Link>
        </nav>

        <div className="mt-auto p-3">
          <Button className="w-full justify-between" onClick={() => setAssistantOpen(true)}>
            <span className="flex items-center gap-2">
              <Sparkles className="size-4" />
              Ask Meridian
            </span>
            <span className="font-mono text-[11px] opacity-70">⌘J</span>
          </Button>
        </div>
      </aside>

      {navOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 max-w-md flex-1 items-center gap-2.5 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Search className="size-4" />
            <span className="truncate">Search tasks, meetings, emails…</span>
            <span className="ml-auto hidden font-mono text-[11px] sm:inline">⌘K</span>
          </button>
          <Button
            variant="outline"
            className="ml-auto gap-2"
            onClick={() => setAssistantOpen(true)}
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </Button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search your workspace…" />
        <CommandList>
          <CommandEmpty>No matches yet — capture a meeting or create a task.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => { setSearchOpen(false); navigate({ to: "/email" }); }}>
              Generate an email
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); navigate({ to: "/meetings" }); }}>
              Summarize a meeting
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); navigate({ to: "/tasks" }); }}>
              Open the task planner
            </CommandItem>
            <CommandItem onSelect={() => { setSearchOpen(false); setAssistantOpen(true); }}>
              Ask the AI assistant
            </CommandItem>
          </CommandGroup>
          {tasks.length > 0 && (
            <CommandGroup heading="Tasks">
              {tasks.slice(0, 8).map((t) => (
                <CommandItem
                  key={t.id}
                  value={`task ${t.name}`}
                  onSelect={() => { setSearchOpen(false); navigate({ to: "/tasks" }); }}
                >
                  {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {meetings.length > 0 && (
            <CommandGroup heading="Meetings">
              {meetings.slice(0, 6).map((m) => (
                <CommandItem
                  key={m.id}
                  value={`meeting ${m.title}`}
                  onSelect={() => { setSearchOpen(false); navigate({ to: "/meetings" }); }}
                >
                  {m.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {emails.length > 0 && (
            <CommandGroup heading="Emails">
              {emails.slice(0, 6).map((e) => (
                <CommandItem
                  key={e.id}
                  value={`email ${e.subject}`}
                  onSelect={() => { setSearchOpen(false); navigate({ to: "/email" }); }}
                >
                  {e.subject}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <AssistantPanel open={assistantOpen} onOpenChange={setAssistantOpen} />
    </div>
  );
}
