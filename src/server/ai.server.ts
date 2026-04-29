import { knowledgeAsPromptContext } from "@/lib/scaler-knowledge";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function callAIJson<T>(args: {
  system: string;
  user: string;
  toolName: string;
  schema: object;
  model?: string;
}): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");

  const body = {
    model: args.model ?? "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: args.system },
      { role: "user", content: args.user },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: args.toolName,
          description: "Return the structured result.",
          parameters: args.schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: args.toolName } },
  };

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("Rate limit exceeded — try again in a minute.");
    if (res.status === 402) throw new Error("Lovable AI credits exhausted. Add credits in workspace settings.");
    throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  const tc = data?.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc?.function?.arguments) throw new Error("AI returned no structured output");
  return JSON.parse(tc.function.arguments) as T;
}

export const SCALER_GROUNDING = knowledgeAsPromptContext();
