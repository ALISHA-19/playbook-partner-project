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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => setContent(initial), [initial]);

  useEffect(() => {
    const blob = renderPdf(content, profile);
    // Force application/pdf MIME (some browsers reject jsPDF's blob type in iframes)
    const typed = new Blob([blob], { type: "application/pdf" });
    const url = URL.createObjectURL(typed);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [content, profile]);

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
    const wa = `https://wa.me/${leadPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");
    toast.success("PDF downloaded — WhatsApp opened. Attach the PDF in chat.");
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
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">Lead-facing PDF · approval required</p>
            <h3 className="font-display text-2xl mt-1">{content.cover_title}</h3>
            <p className="text-sm opacity-80 mt-1">{content.cover_subtitle}</p>
          </div>
          {approved && <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full"><Check className="h-3 w-3" /> Approved</span>}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {pdfUrl && (
          <div className="rounded-lg overflow-hidden border border-border bg-muted" style={{ height: 480 }}>
            <object data={pdfUrl} type="application/pdf" className="w-full h-full">
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-sm text-muted-foreground gap-3">
                <p>Inline PDF preview isn't available in this browser.</p>
                <Button variant="outline" size="sm" onClick={downloadPdf}>
                  <Download className="h-4 w-4 mr-1.5" /> Download PDF to preview
                </Button>
              </div>
            </object>
          </div>
        )}

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
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Done editing</Button>
          </div>
        ) : (
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">WhatsApp cover message</p>
            <p className="text-sm rounded-lg bg-muted p-3 italic">"{content.whatsapp_cover_message}"</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {!approved && (
            <Button onClick={() => setApproved(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
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
            <Button disabled={!approved} onClick={sendOnWhatsApp} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="h-4 w-4 mr-1.5" /> Send via WhatsApp
            </Button>
          </div>
        </div>
        {!approved && <p className="text-xs text-muted-foreground">Approve before sending — nothing lead-facing fires automatically.</p>}
      </div>
    </div>
  );
}
