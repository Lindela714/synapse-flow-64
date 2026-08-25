import { useNavigate } from "@tanstack/react-router";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai-service";
import { isOverdue, useStore, useTaskStats } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const STARTERS = [
  "What should I focus on today?",
  "Summarize my workload",
  "Turn my high-priority tasks into a progress update email",
  "Which task is most important?",
];

export function AssistantPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { tasks, meetings, emails, logActivity } = useStore();
  const stats = useTaskStats();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(STARTERS);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const latestMeeting = meetings[0];
      const res = await askAssistant(trimmed, {
        tasks: tasks
          .filter((t) => t.status !== "completed")
          .slice(0, 25)
          .map((t) => ({
            id: t.id,
            name: t.name,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            owner: t.owner,
          })),
        overdue: tasks.filter(isOverdue).length,
        dueToday: stats.dueToday.length,
        latestMeeting: latestMeeting
          ? { title: latestMeeting.title, summary: latestMeeting.summary }
          : null,
        recentEmails: emails.slice(0, 3).map((e) => e.subject),
      });
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: res.reply },
      ]);
      setSuggestions(res.suggestions?.length ? res.suggestions.slice(0, 3) : STARTERS.slice(0, 3));
      logActivity("assistant", `Asked the assistant: ${trimmed.slice(0, 60)}`);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: 999999, behavior: "smooth" }));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display">
            <Sparkles className="size-4 text-accent" />
            Meridian Assistant
          </SheetTitle>
          <SheetDescription>
            Connected to your tasks, meetings and drafts — no copy-pasting needed.
          </SheetDescription>
        </SheetHeader>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="rounded-lg border border-border bg-secondary/60 p-4 text-sm text-muted-foreground">
              Ask me to plan your day, triage your board, or turn a meeting into a follow-up email.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={2}
              placeholder="Ask anything about your work…"
              aria-label="Message the assistant"
              className="resize-none"
            />
            <Button
              size="icon"
              aria-label="Send message"
              disabled={loading || !input.trim()}
              onClick={() => void send(input)}
            >
              <Send className="size-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/meetings" });
              }}
            >
              Capture a meeting
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/tasks" });
              }}
            >
              Plan a goal
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
