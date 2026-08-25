/**
 * AI provider layer. Talks to the Lovable AI Gateway when a key is available,
 * and falls back to a deterministic mock so the app is fully demoable offline.
 */
import { mockAi } from "./ai-mock";
import type { AiOp } from "./ai-schema";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

const SYSTEM: Record<AiOp["op"], string> = {
  generateEmail:
    "You are an expert business email writer. Return JSON: {\"subject\":string,\"body\":string}. The body must include a greeting and a sign-off, with real line breaks. Never use placeholders like [Name] unless no name is known.",
  refineEmail:
    "You revise emails. Apply the requested transformation. Return JSON: {\"subject\":string,\"body\":string}.",
  summarizeMeeting:
    'You analyse meeting notes. Return JSON: {"title":string,"summary":string,"keyPoints":string[],"decisions":string[],"actionItems":[{"task":string,"owner":string,"priority":"low"|"medium"|"high"|"urgent","dueDate":string|null}],"openQuestions":string[],"participants":string[]}. dueDate must be an ISO yyyy-mm-dd date resolved against today\'s date, or null.',
  generateTaskPlan:
    'You are a project planner. Break a goal into 5-9 concrete, ordered tasks. Return JSON: {"planTitle":string,"tasks":[{"name":string,"description":string,"priority":"low"|"medium"|"high"|"urgent","dueDate":string|null,"category":string}]}. Dates are ISO yyyy-mm-dd in the near future.',
  breakDownTask:
    'You split a task into 3-6 subtasks. Return JSON: {"planTitle":string,"tasks":[{"name":string,"description":string,"priority":"low"|"medium"|"high"|"urgent","dueDate":string|null,"category":string}]}.',
  prioritizeTasks:
    'You triage workloads. Return JSON: {"headline":string,"order":[{"id":string,"reason":string}],"advice":string[]}. Use only ids present in the input.',
  workloadInsight:
    'You are a chief of staff. Return JSON: {"insight":string,"recommendation":string}. Two sentences maximum each, specific to the data.',
  assistant:
    'You are Meridian, a productivity assistant with access to the user\'s tasks, meetings and emails (given as JSON context). Answer concretely using that data. Return JSON: {"reply":string,"suggestions":string[]} where suggestions are up to 3 short follow-up prompts.',
};

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model response");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function runAiOperation(input: AiOp): Promise<unknown> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return mockAi(input);

  const today = new Date().toISOString().slice(0, 10);
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: `${SYSTEM[input.op]}\nToday is ${today}. Reply with JSON only.` },
        { role: "user", content: JSON.stringify(input.payload) },
      ],
    }),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("The AI assistant is busy right now. Try again shortly.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted. Add credits in Lovable to keep using AI features.");
    if (res.status === 403) throw new Error("AI access is currently blocked for this workspace.");
    // Any other failure: degrade to the demo engine rather than breaking the flow.
    return mockAi(input);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content ?? "";
  try {
    return extractJson(text);
  } catch {
    return mockAi(input);
  }
}
