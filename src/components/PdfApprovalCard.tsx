import { useState, useEffect } from "react";
import type { PdfContent, LeadProfile } from "@/lib/types";
import { renderPdf } from "@/lib/pdf-renderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Edit2, X, Send, Download } from "lucide-react";
import { toast } from "sonner";

export function PdfApprovalCard({
  content: initial,
  profile,
  leadPhone,
}: {
  content: PdfContent;
  profile: LeadProfile;
  leadPhone: string;
}) {
  const [content, setContent] = useState<PdfContent>(initial);
  const [editing, setEditing] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [approved, setApproved] = useState(false);

  useEffect(() => setContent(initial), [initial]);

  const downloadPdf = () => {
    const blob = renderPdf(content, profile);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Scaler-${profile.name.replace(/\s+/g, "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendOnWhatsApp = () => {
    if (!leadPhone) return toast.error("Set the lead's WhatsApp number first");
    downloadPdf();
    const msg = `${content.whatsapp_cover_message}\n\n(PDF attached separately)`;
    const phone = leadPhone.replace(/\D/g, "");
    // Use web.whatsapp.com directly — wa.me redirects via api.whatsapp.com which is blocked in iframes.
    const wa = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
    toast.success("PDF downloaded — WhatsApp Web opened. Attach the PDF in chat.");
  };

  if (skipped) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted p-6 text-center text-muted-foreground">
        <X className="h-5 w-5 mx-auto mb-2" />
        Send skipped for {profile.name}.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
      <div className="bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">
              Lead-facing PDF · approval required
            </p>
            <h3 className="font-display text-2xl mt-1">{content.cover_title}</h3>
            <p className="text-sm opacity-80 mt-1">{content.cover_subtitle}</p>
          </div>
          {approved && (
            <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
              <Check className="h-3 w-3" /> Approved
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <PdfDocumentPreview content={content} profile={profile} />

        {editing ? (
          <div className="space-y-3 border-t border-border pt-4">
            <div>
              <Label>WhatsApp cover message</Label>
              <Textarea
                rows={3}
                value={content.whatsapp_cover_message}
                onChange={(e) => setContent({ ...content, whatsapp_cover_message: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Opening note (PDF)</Label>
              <Textarea
                rows={3}
                value={content.opening_note}
                onChange={(e) => setContent({ ...content, opening_note: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Honest caveat</Label>
              <Textarea
                rows={2}
                value={content.honest_caveat}
                onChange={(e) => setContent({ ...content, honest_caveat: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Next step</Label>
              <Textarea
                rows={2}
                value={content.next_step}
                onChange={(e) => setContent({ ...content, next_step: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>
              Done editing
            </Button>
          </div>
        ) : (
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              WhatsApp cover message
            </p>
            <p className="text-sm rounded-lg bg-muted p-3 italic">
              "{content.whatsapp_cover_message}"
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {!approved && (
            <Button
              onClick={() => setApproved(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Check className="h-4 w-4 mr-1.5" /> Approve
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditing((v) => !v)}>
            <Edit2 className="h-4 w-4 mr-1.5" /> {editing ? "Cancel edit" : "Edit"}
          </Button>
          <Button variant="ghost" onClick={() => setSkipped(true)}>
            <X className="h-4 w-4 mr-1.5" /> Skip
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={downloadPdf}>
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
            <Button
              disabled={!approved}
              onClick={sendOnWhatsApp}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-1.5" /> Send via WhatsApp
            </Button>
          </div>
        </div>
        {!approved && (
          <p className="text-xs text-muted-foreground">
            Approve before sending — nothing lead-facing fires automatically.
          </p>
        )}
      </div>
    </div>
  );
}

function PdfDocumentPreview({ content, profile }: { content: PdfContent; profile: LeadProfile }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3">
      <div className="mx-auto max-h-[520px] max-w-[560px] overflow-y-auto rounded-md bg-background shadow-elevated">
        <div className="bg-primary px-8 py-8 text-primary-foreground">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">SCALER</p>
          <p className="mt-1 text-xs opacity-80">Prepared specifically for you</p>
          <h4 className="mt-6 font-display text-2xl leading-tight">{content.cover_title}</h4>
          <p className="mt-3 text-sm leading-relaxed opacity-85">{content.cover_subtitle}</p>
        </div>

        <div className="space-y-6 px-8 py-7 text-sm leading-relaxed text-foreground">
          <p className="text-xs text-muted-foreground">
            For: {profile.name}
            {profile.role ? ` — ${profile.role}` : ""}
            {profile.company ? ` @ ${profile.company}` : ""}
          </p>

          <p>{content.opening_note}</p>

          <section className="space-y-4">
            <div className="h-0.5 w-10 bg-accent" />
            <h5 className="font-display text-xl text-primary">Your questions, answered</h5>
            {content.questions_addressed.map((item, index) => (
              <article key={`${item.question}-${index}`} className="space-y-1.5">
                <p className="font-semibold">
                  {index + 1}. {item.question}
                </p>
                <p>{item.answer}</p>
                <p className="text-xs text-muted-foreground">
                  Why we're confident: {item.evidence}
                </p>
              </article>
            ))}
          </section>

          <section className="space-y-3">
            <div className="h-0.5 w-10 bg-accent" />
            <h5 className="font-display text-xl text-primary">Why Scaler — for you specifically</h5>
            <ul className="space-y-2">
              {content.why_scaler_for_you.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-l-4 border-accent bg-muted p-4">
            <p className="font-semibold text-primary">Being honest with you</p>
            <p className="mt-2">{content.honest_caveat}</p>
          </section>

          <section className="bg-primary p-4 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Your next step
            </p>
            <p className="mt-2">{content.next_step}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
