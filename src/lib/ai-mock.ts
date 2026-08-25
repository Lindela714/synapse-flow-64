/**
 * Deterministic demo AI engine. Used when no gateway key is configured or the
 * gateway is unreachable, so every flow in the app stays fully usable.
 */
import type { AiOp } from "./ai-schema";
import type { Priority } from "./types";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function sentences(text: string): string[] {
  return text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

function pickPriority(line: string): Priority {
  const l = line.toLowerCase();
  if (/(asap|urgent|immediately|today|blocker)/.test(l)) return "urgent";
  if (/(important|critical|priority|friday|deadline)/.test(l)) return "high";
  if (/(later|eventually|nice to have|backlog)/.test(l)) return "low";
  return "medium";
}

function extractOwner(line: string): string {
  const m = line.match(/\b([A-Z][a-z]{2,})\b\s+(?:will|to|should|is going to|owns|takes)/);
  return m ? m[1] : "Unassigned";
}

function extractDue(line: string): string | null {
  const l = line.toLowerCase();
  if (l.includes("today")) return daysFromNow(0);
  if (l.includes("tomorrow")) return daysFromNow(1);
  if (l.includes("friday")) return daysFromNow(((5 - new Date().getDay() + 7) % 7) || 7);
  if (l.includes("monday")) return daysFromNow(((1 - new Date().getDay() + 7) % 7) || 7);
  if (l.includes("next week")) return daysFromNow(7);
  if (l.includes("this week")) return daysFromNow(3);
  return null;
}

function greeting(recipient: string) {
  const name = recipient.split(/[,<@]/)[0].trim();
  return name ? `Hi ${name},` : "Hi there,";
}

function mockEmail(p: Record<string, unknown>) {
  const purpose = String(p["purpose"] ?? "a quick update");
  const recipient = String(p["recipient"] ?? "");
  const keyPoints = String(p["keyPoints"] ?? "");
  const tone = String(p["tone"] ?? "professional");
  const length = String(p["length"] ?? "medium");
  const context = String(p["context"] ?? "");
  const signOff = String(p["signOff"] ?? "Best regards,\nAlex");

  const bullets = keyPoints
    .split("\n")
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  const opener: Record<string, string> = {
    professional: `I wanted to follow up regarding ${purpose}.`,
    friendly: `Hope you're having a good week! Just reaching out about ${purpose}.`,
    formal: `I am writing to you in connection with ${purpose}.`,
    concise: `Quick note on ${purpose}.`,
    persuasive: `I think there's a real opportunity here, and it starts with ${purpose}.`,
    "follow-up": `Following up on our recent conversation about ${purpose}.`,
  };

  const body = [
    greeting(recipient),
    "",
    opener[tone] ?? opener["professional"],
    context ? `\n${context}` : "",
    bullets.length ? `\nHere's where things stand:\n${bullets.map((b) => `• ${b}`).join("\n")}` : "",
    length === "long"
      ? "\nHappy to walk through any of this in more detail — I can put together a short summary document or set up 20 minutes if that's easier."
      : "",
    length === "short" ? "" : "\nLet me know if anything needs adjusting on your side.",
    "",
    signOff,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    subject: purpose.charAt(0).toUpperCase() + purpose.slice(1).replace(/\.$/, ""),
    body,
  };
}

function mockRefine(p: Record<string, unknown>) {
  const subject = String(p["subject"] ?? "");
  const body = String(p["body"] ?? "");
  const action = String(p["action"] ?? "improve clarity");
  const lines = body.split("\n");

  switch (action) {
    case "shorter":
      return {
        subject,
        body: lines.filter((l, i) => i < 3 || l.startsWith("•") || i > lines.length - 3).join("\n"),
      };
    case "longer":
      return {
        subject,
        body: body.replace(
          /\n(?=[^\n]*$)/,
          "\n\nFor additional context, this builds on what we discussed previously and keeps us on track with the timeline we agreed.\n\n",
        ),
      };
    case "professional":
      return { subject, body: body.replace(/Hi /, "Dear ").replace(/Thanks!/g, "Thank you.") };
    case "friendlier":
      return { subject, body: body.replace(/Dear /, "Hi ").replace(/^Hi /, "Hey ") };
    case "grammar":
      return { subject, body: body.replace(/\s+([,.])/g, "$1").replace(/\s{2,}/g, " ") };
    default:
      return {
        subject,
        body: lines.map((l) => l.replace(/\b(just|really|very|actually)\s/gi, "")).join("\n"),
      };
  }
}

function mockSummary(p: Record<string, unknown>) {
  const notes = String(p["notes"] ?? "");
  const lines = sentences(notes);
  const actionLines = lines.filter((l) =>
    /(will|need to|should|todo|to-do|action|follow up|prepare|send|review|deliver|by )/i.test(l),
  );
  const decisionLines = lines.filter((l) => /(decided|agreed|approved|confirmed|locked)/i.test(l));
  const questionLines = lines.filter((l) => l.includes("?") || /(unclear|tbd|open question)/i.test(l));
  const names = Array.from(
    new Set((notes.match(/\b[A-Z][a-z]{2,}\b/g) ?? []).filter((n) => n.length < 14)),
  ).slice(0, 6);

  return {
    title: (lines[0] ?? "Meeting notes").slice(0, 60),
    summary:
      lines.slice(0, 3).join(" ") ||
      "The notes were captured but contain little detail. Add more content for a richer summary.",
    keyPoints: lines.slice(0, 5),
    decisions: decisionLines.slice(0, 4),
    actionItems: actionLines.slice(0, 6).map((l) => ({
      task: l.replace(/^[-•*]\s*/, "").slice(0, 90),
      owner: extractOwner(l),
      priority: pickPriority(l),
      dueDate: extractDue(l),
    })),
    openQuestions: questionLines.slice(0, 4),
    participants: names,
  };
}

function mockPlan(p: Record<string, unknown>) {
  const goal = String(p["goal"] ?? p["task"] ?? "New goal");
  const steps = [
    ["Define scope and success criteria", "high"],
    ["Draft the core content and requirements", "high"],
    ["Design and review the first version", "medium"],
    ["Build and implement", "high"],
    ["Test, QA and gather feedback", "medium"],
    ["Prepare launch communications", "medium"],
    ["Ship and monitor results", "urgent"],
  ] as const;

  return {
    planTitle: goal,
    tasks: steps.map(([name, priority], i) => ({
      name: `${name}`,
      description: `${name} for: ${goal}`,
      priority,
      dueDate: daysFromNow(3 + i * 3),
      category: goal.slice(0, 24),
    })),
  };
}

function mockPrioritize(p: Record<string, unknown>) {
  const tasks = (p["tasks"] as Array<Record<string, unknown>>) ?? [];
  const weight: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  const ordered = [...tasks].sort(
    (a, b) => (weight[String(a["priority"])] ?? 9) - (weight[String(b["priority"])] ?? 9),
  );
  return {
    headline: `Ordered ${ordered.length} open task${ordered.length === 1 ? "" : "s"} by urgency and due date.`,
    order: ordered.map((t) => ({
      id: String(t["id"]),
      reason: `${String(t["priority"])} priority${t["dueDate"] ? `, due ${String(t["dueDate"])}` : ""}`,
    })),
    advice: [
      "Clear overdue work before starting anything new.",
      "Batch the low-priority items into one focused block.",
    ],
  };
}

function mockInsight(p: Record<string, unknown>) {
  const overdue = Number(p["overdue"] ?? 0);
  const high = Number(p["highPriority"] ?? 0);
  const today = Number(p["dueToday"] ?? 0);
  const next = String(p["nextTask"] ?? "");
  if (!overdue && !high && !today) {
    return {
      insight: "Your board is clear — nothing overdue and nothing due today.",
      recommendation: "Capture a meeting or plan a goal to line up the next block of work.",
    };
  }
  return {
    insight: `You have ${high} high-priority task${high === 1 ? "" : "s"} this week and ${overdue} overdue.`,
    recommendation: next
      ? `Start with "${next}" — it's the highest-leverage item on your list right now.`
      : "Re-prioritize your list to surface the highest-leverage item.",
  };
}

function mockAssistant(p: Record<string, unknown>) {
  const message = String(p["message"] ?? "").toLowerCase();
  const ctx = (p["context"] as Record<string, unknown>) ?? {};
  const tasks = (ctx["tasks"] as Array<Record<string, unknown>>) ?? [];
  const open = tasks.filter((t) => t["status"] !== "completed");
  const overdue = Number(ctx["overdue"] ?? 0);

  if (/focus|today|priorit/.test(message)) {
    const top = open[0];
    return {
      reply: top
        ? `Focus on "${String(top["name"])}" first — it's ${String(top["priority"])} priority${top["dueDate"] ? ` and due ${String(top["dueDate"])}` : ""}. You have ${open.length} open tasks and ${overdue} overdue.`
        : "Nothing is open right now. Summarize a meeting or plan a goal to fill the board.",
      suggestions: ["Prioritize my tasks", "Summarize my workload", "Find overdue tasks"],
    };
  }
  if (/email|follow.?up|update/.test(message)) {
    return {
      reply:
        "I can draft that. Open the Email Generator — it will pull in your latest meeting summary and open action items automatically.",
      suggestions: ["Write a follow-up email", "Turn high-priority tasks into a progress email"],
    };
  }
  if (/meeting|notes|summar/.test(message)) {
    return {
      reply:
        "Paste your notes into Meeting Notes and I'll pull out the summary, decisions, action items and open questions — then convert them into tasks in one click.",
      suggestions: ["Summarize my workload", "What should I focus on today?"],
    };
  }
  return {
    reply: `You have ${open.length} open task${open.length === 1 ? "" : "s"}, ${overdue} overdue. Ask me to prioritize your work, plan a goal, or draft an email from a meeting.`,
    suggestions: ["What should I focus on today?", "Prioritize my tasks", "Summarize my workload"],
  };
}

export function mockAi(input: AiOp): unknown {
  const p = input.payload;
  switch (input.op) {
    case "generateEmail":
      return mockEmail(p);
    case "refineEmail":
      return mockRefine(p);
    case "summarizeMeeting":
      return mockSummary(p);
    case "generateTaskPlan":
    case "breakDownTask":
      return mockPlan(p);
    case "prioritizeTasks":
      return mockPrioritize(p);
    case "workloadInsight":
      return mockInsight(p);
    case "assistant":
      return mockAssistant(p);
    default:
      return {};
  }
}
