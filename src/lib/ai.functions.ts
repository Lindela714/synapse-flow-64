import { createServerFn } from "@tanstack/react-start";
import { aiOpSchema } from "./ai-schema";
import { runAiOperation } from "./ai.server";

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => aiOpSchema.parse(data))
  .handler(async ({ data }) => {
    return runAiOperation(data);
  });
