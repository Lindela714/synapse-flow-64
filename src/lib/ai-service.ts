/**
 * Client-facing AI service. UI code only ever talks to these functions —
 * the provider (gateway or demo engine) lives behind the server boundary.
 */
import { runAi } from "./ai.functions";
import type { ActionItem, EmailDraft, MeetingSummary, Priority, Task } from "./types";

async function call<T>(op: string, payload: Record<string, unknown>): Promise<T> {
  const result = await runAi({ data: { op, payload } as never });
  return result as T;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export function generateEmail(input: {
  purpose: string;
  recipient: string;
  keyPoints: string;
  tone: string;
  length: string;
  context?: string;
  signOff?: string;
}) {
  return call<GeneratedEmail>("generateEmail", { ...input });
}

export function refineEmail(input: { subject: string; body: string; action: string }) {
  return call<GeneratedEmail>("refineEmail", { ...input });
}

export function summarizeMeeting(notes: string) {
  return call<MeetingSummary & { title: string }>("summarizeMeeting", { notes });
}

export function extractActionItems(notes: string) {
  return summarizeMeeting(notes).then((s) => s.actionItems as ActionItem[]);
}

export interface GeneratedPlan {
  planTitle: string;
  tasks: Array<{
    name: string;
    description: string;
    priority: Priority;
    dueDate: string | null;
    category: string;
  }>;
}

export function generateTasksFromGoal(goal: string) {
  return call<GeneratedPlan>("generateTaskPlan", { goal });
}

export function generateTaskPlan(goal: string) {
  return generateTasksFromGoal(goal);
}

export function breakDownTask(task: Task) {
  return call<GeneratedPlan>("breakDownTask", { task: task.name, description: task.description });
}

export function prioritizeTasks(tasks: Task[]) {
  return call<{ headline: string; order: Array<{ id: string; reason: string }>; advice: string[] }>(
    "prioritizeTasks",
    {
      tasks: tasks.map((t) => ({
        id: t.id,
        name: t.name,
        priority: t.priority,
        dueDate: t.dueDate,
        status: t.status,
      })),
    },
  );
}

export function workloadInsight(input: {
  dueToday: number;
  overdue: number;
  highPriority: number;
  completed: number;
  nextTask: string;
}) {
  return call<{ insight: string; recommendation: string }>("workloadInsight", { ...input });
}

export function generateFollowUpEmail(input: {
  meetingTitle: string;
  summary: MeetingSummary;
  tone?: string;
  signOff?: string;
}) {
  const { meetingTitle, summary } = input;
  return generateEmail({
    purpose: `a follow-up to the "${meetingTitle}" meeting`,
    recipient: summary.participants.join(", "),
    keyPoints: [
      ...summary.decisions.map((d) => `Decision: ${d}`),
      ...summary.actionItems.map(
        (a) => `${a.task} — ${a.owner}${a.dueDate ? ` (due ${a.dueDate})` : ""}`,
      ),
    ].join("\n"),
    tone: input.tone ?? "follow-up",
    length: "medium",
    context: summary.summary,
    signOff: input.signOff,
  });
}

export function generateProgressEmail(input: { tasks: Task[]; recipient: string; signOff?: string }) {
  return generateEmail({
    purpose: "a progress update on our current workstreams",
    recipient: input.recipient,
    keyPoints: input.tasks
      .map((t) => `${t.name} — ${t.status}${t.dueDate ? ` (due ${t.dueDate})` : ""}`)
      .join("\n"),
    tone: "professional",
    length: "medium",
    signOff: input.signOff,
  });
}

export function askAssistant(message: string, context: Record<string, unknown>) {
  return call<{ reply: string; suggestions: string[] }>("assistant", { message, context });
}

export type { EmailDraft };
