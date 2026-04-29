import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAIJson, SCALER_GROUNDING } from "./ai.server";
import type { NudgeOutput, PdfContent, ExtractedQuestion, LeadProfile } from "@/lib/types";

const ProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional(),
  company: z.string().optional(),
  yoe: z.string().optional(),
  intent: z.string().optional(),
  background: z.string().optional(),
  current_package_lpa: z.string().optional(),
  notes: z.string().optional(),
});

// ===== Pre-sales nudge for the BDA =====
export const generateNudge = createServerFn({ method: "POST" })
  .inputValidator((input: { profile: LeadProfile }) => ({
    profile: ProfileSchema.parse(input.profile),
  }))
  .handler(async ({ data }): Promise<NudgeOutput> => {
    const system = `You are a senior sales coach at Scaler writing a quick BDA briefing — like a sharp teammate's WhatsApp message, not a corporate memo. Be specific, short, scannable. Be honest about what is INFERRED vs what is fact vs missing. Differentiate per lead. Avoid generic openings like "this is X from Scaler".

${SCALER_GROUNDING}`;

    const user = `Lead profile:
${JSON.stringify(data.profile, null, 2)}

Write a pre-call briefing for the BDA. Output ONLY through the tool.`;

    return callAIJson<NudgeOutput>({
      system,
      user,
      toolName: "emit_nudge",
      schema: {
        type: "object",
        properties: {
          one_liner: { type: "string", description: "One sentence: who is this lead and what they care about." },
          who_they_are: { type: "string" },
          persona_label: { type: "string", description: "e.g. 'Senior IC exploring AI', 'First-job seeker, family pressure'" },
          angles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                angle: { type: "string" },
                why: { type: "string", description: "tied to something concrete about this lead" },
              },
              required: ["angle", "why"],
              additionalProperties: false,
            },
          },
          objections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                objection: { type: "string" },
                handle: { type: "string", description: "one-line handle the BDA can say" },
              },
              required: ["objection", "handle"],
              additionalProperties: false,
            },
          },
          opening_hook: { type: "string", description: "Exact words BDA can say in first 15s" },
          flags: { type: "array", items: { type: "string" }, description: "Inferences, missing data, risks" },
        },
        required: ["one_liner", "who_they_are", "persona_label", "angles", "objections", "opening_hook", "flags"],
        additionalProperties: false,
      },
    });
  });

// ===== Extract open questions from transcript =====
export const extractQuestions = createServerFn({ method: "POST" })
  .inputValidator((input: { transcript: string }) => z.object({ transcript: z.string().min(20) }).parse(input))
  .handler(async ({ data }): Promise<ExtractedQuestion[]> => {
    const result = await callAIJson<{ questions: ExtractedQuestion[] }>({
      system:
        "You extract OPEN questions a lead asked during a sales call that the BDA did NOT fully answer. Be precise. Skip rhetorical or already-answered questions.",
      user: `Call transcript:\n${data.transcript}`,
      toolName: "emit_questions",
      schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                category: { type: "string", enum: ["roi", "curriculum", "outcomes", "logistics", "trust", "other"] },
              },
              required: ["question", "category"],
              additionalProperties: false,
            },
          },
        },
        required: ["questions"],
        additionalProperties: false,
      },
    });
    return result.questions;
  });

// ===== Generate PDF content =====
export const generatePdfContent = createServerFn({ method: "POST" })
  .inputValidator((input: { profile: LeadProfile; questions: ExtractedQuestion[]; transcript?: string }) =>
    z
      .object({
        profile: ProfileSchema,
        questions: z.array(z.object({ question: z.string(), category: z.string() })),
        transcript: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data }): Promise<PdfContent> => {
    const system = `You write a personalised post-call PDF for a Scaler lead. The REAL JOB is building trust, not selling. The lead should feel "this person actually understood my situation." Use THEIR words, THEIR concerns, THEIR career math.

Rules:
- Be visibly different per lead. Tone, structure, what evidence you cite — all should reflect THIS lead.
- Ground every Scaler claim in the facts below. If you don't have a specific number/module, speak in general terms or say "I'd want to confirm the specifics" — NEVER fabricate.
- Address their open questions with concrete reasoning, not marketing fluff.
- Honest caveat section is non-negotiable — admit one limitation. That's how trust gets built.
- whatsapp_cover_message is short, warm, written like a human (not corporate).

${SCALER_GROUNDING}`;

    const user = `Lead profile:
${JSON.stringify(data.profile, null, 2)}

Open questions to address:
${data.questions.map((q, i) => `${i + 1}. [${q.category}] ${q.question}`).join("\n")}

${data.transcript ? `Call transcript context (use lead's exact phrasing where possible):\n${data.transcript.slice(0, 4000)}` : ""}`;

    return callAIJson<PdfContent>({
      model: "google/gemini-2.5-pro",
      system,
      user,
      toolName: "emit_pdf_content",
      schema: {
        type: "object",
        properties: {
          cover_title: { type: "string", description: "Personalised, e.g. 'For Rohan — the TCS-to-product-AI move'" },
          cover_subtitle: { type: "string" },
          opening_note: { type: "string" },
          questions_addressed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                answer: { type: "string", description: "2-4 sentences, specific to this lead" },
                evidence: { type: "string", description: "concrete reasoning or grounded fact" },
              },
              required: ["question", "answer", "evidence"],
              additionalProperties: false,
            },
          },
          why_scaler_for_you: { type: "array", items: { type: "string" }, description: "3 bullets framed through this lead's goals" },
          honest_caveat: { type: "string" },
          next_step: { type: "string" },
          whatsapp_cover_message: { type: "string" },
        },
        required: [
          "cover_title",
          "cover_subtitle",
          "opening_note",
          "questions_addressed",
          "why_scaler_for_you",
          "honest_caveat",
          "next_step",
          "whatsapp_cover_message",
        ],
        additionalProperties: false,
      },
    });
  });
