import { z } from "zod";

export const aiOpSchema = z.object({
  op: z.enum([
    "generateEmail",
    "refineEmail",
    "summarizeMeeting",
    "generateTaskPlan",
    "breakDownTask",
    "prioritizeTasks",
    "workloadInsight",
    "assistant",
  ]),
  payload: z.record(z.string(), z.unknown()),
});

export type AiOp = z.infer<typeof aiOpSchema>;
