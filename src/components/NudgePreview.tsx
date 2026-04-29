import type { NudgeOutput } from "@/lib/types";
import { Send, AlertCircle } from "lucide-react";

export function NudgePreview({ nudge, bdaPhone }: { nudge: NudgeOutput; bdaPhone: string }) {
  const text = formatNudgeForWhatsApp(nudge);
  const wa = `https://wa.me/${bdaPhone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">Pre-call BDA briefing</p>
          <h3 className="font-display text-2xl mt-1">{nudge.persona_label}</h3>
        </div>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-3.5 w-3.5" /> Send to BDA
        </a>
      </div>

      <p className="text-sm font-medium leading-relaxed mb-4">{nudge.one_liner}</p>

      <div className="space-y-4 text-sm">
        <Section title="Who they are">{nudge.who_they_are}</Section>

        <Section title="Angles that'll resonate">
          <ul className="space-y-1.5">
            {nudge.angles.map((a, i) => (
              <li key={i}>
                <span className="font-medium">→ {a.angle}</span>
                <span className="text-muted-foreground"> — {a.why}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Objections to expect">
          <ul className="space-y-1.5">
            {nudge.objections.map((o, i) => (
              <li key={i}>
                <span className="font-medium">"{o.objection}"</span>
                <span className="text-muted-foreground"> → {o.handle}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Opening hook (first 15s)">
          <p className="italic border-l-2 border-accent pl-3 text-foreground">"{nudge.opening_hook}"</p>
        </Section>

        {nudge.flags?.length > 0 && (
          <div className="flex gap-2 rounded-md bg-muted p-3">
            <AlertCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              {nudge.flags.map((f, i) => <p key={i}>{f}</p>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">{title}</p>
      <div className="text-foreground">{children}</div>
    </div>
  );
}

function formatNudgeForWhatsApp(n: NudgeOutput): string {
  return `*Pre-call brief — ${n.persona_label}*

${n.one_liner}

*Who:* ${n.who_they_are}

*Angles:*
${n.angles.map((a) => `• ${a.angle} — ${a.why}`).join("\n")}

*Likely objections:*
${n.objections.map((o) => `• "${o.objection}" → ${o.handle}`).join("\n")}

*Opening hook:*
"${n.opening_hook}"

${n.flags?.length ? `_Flags: ${n.flags.join(" · ")}_` : ""}`;
}
