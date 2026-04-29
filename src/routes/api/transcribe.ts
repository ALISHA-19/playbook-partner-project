import { createFileRoute } from "@tanstack/react-router";

// Transcribe audio via Lovable AI Gateway (Gemini supports audio input as base64).
export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const key = process.env.LOVABLE_API_KEY;
          if (!key) return Response.json({ error: "LOVABLE_API_KEY not configured" }, { status: 500 });

          const form = await request.formData();
          const file = form.get("audio") as File | null;
          if (!file) return Response.json({ error: "No audio file" }, { status: 400 });
          if (file.size > 20 * 1024 * 1024) return Response.json({ error: "Audio too large (>20MB)" }, { status: 400 });

          const buf = await file.arrayBuffer();
          const b64 = Buffer.from(buf).toString("base64");
          const mime = file.type || "audio/mpeg";

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a transcription engine for sales calls between a Scaler BDA and a lead. Output a clean transcript with speaker labels: 'BDA:' and 'Lead:'. Use diarization based on context. Do not summarise — transcribe verbatim.",
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Transcribe this sales call. Use BDA: / Lead: speaker labels." },
                    { type: "input_audio", input_audio: { data: b64, format: mime.includes("wav") ? "wav" : "mp3" } },
                  ],
                },
              ],
            }),
          });

          if (!res.ok) {
            const txt = await res.text();
            return Response.json({ error: `Transcription failed: ${res.status} ${txt.slice(0, 200)}` }, { status: 500 });
          }
          const data = await res.json();
          const transcript = data?.choices?.[0]?.message?.content ?? "";
          if (!transcript) return Response.json({ error: "Empty transcript" }, { status: 500 });
          return Response.json({ transcript });
        } catch (e) {
          return Response.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
        }
      },
    },
  },
});
