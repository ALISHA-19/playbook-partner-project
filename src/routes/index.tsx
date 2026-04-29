import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { generateNudge, extractQuestions, generatePdfContent } from "@/server/agent.functions";
import type { LeadProfile, NudgeOutput, PdfContent } from "@/lib/types";
import { LeadInputForm } from "@/components/LeadInputForm";
import { NudgePreview } from "@/components/NudgePreview";
import { PdfApprovalCard } from "@/components/PdfApprovalCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Phone, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Scaler Sales Agent — AI briefings & trust PDFs" },
      { name: "description", content: "Pre-call BDA briefings + post-call personalised PDFs, delivered on WhatsApp. Supercharging Scaler sales conversations." },
    ],
  }),
});

type Result = {
  profile: LeadProfile;
  nudge: NudgeOutput;
  pdf: PdfContent;
};

function HomePage() {
  const nudgeFn = useServerFn(generateNudge);
  const extractFn = useServerFn(extractQuestions);
  const pdfFn = useServerFn(generatePdfContent);

  const [bdaPhone, setBdaPhone] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    setBdaPhone(localStorage.getItem("bdaPhone") || "");
    setLeadPhone(localStorage.getItem("leadPhone") || "");
  }, []);
  useEffect(() => { if (bdaPhone) localStorage.setItem("bdaPhone", bdaPhone); }, [bdaPhone]);
  useEffect(() => { if (leadPhone) localStorage.setItem("leadPhone", leadPhone); }, [leadPhone]);

  const handleGenerate = async ({ profile, transcript }: { profile: LeadProfile; transcript: string }) => {
    setBusy(true);
    try {
      const [nudge, qs] = await Promise.all([
        nudgeFn({ data: { profile } }),
        extractFn({ data: { transcript } }),
      ]);
      const pdf = await pdfFn({ data: { profile, questions: qs, transcript } });
      setResults((r) => [{ profile, nudge, pdf }, ...r]);
      toast.success(`Generated for ${profile.name}`);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grain">
      <Toaster richColors position="top-right" />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 grain opacity-40" />
        <div className="relative max-w-6xl mx-auto px-6 pt-12 pb-20 sm:pt-20 sm:pb-32 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80 mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Ayuda · AI agent for Scaler sales
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-5xl sm:text-7xl font-medium leading-[0.95] max-w-3xl"
          >
            Brief the BDA <span className="text-accent">before</span> the call.<br />
            Build trust with the lead <span className="text-accent">after</span>.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg max-w-2xl"
          >
            One agent, two moments. Pre-call WhatsApp nudges so the first 15 seconds don't sound generic.
            Post-call personalised PDFs so leads actually take the test.
          </motion.p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
            <div>
              <Label className="text-primary-foreground/70 text-xs uppercase tracking-widest">BDA WhatsApp number</Label>
              <Input
                placeholder="+91 98765 43210"
                value={bdaPhone}
                onChange={(e) => setBdaPhone(e.target.value)}
                className="mt-1.5 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
              />
            </div>
            <div>
              <Label className="text-primary-foreground/70 text-xs uppercase tracking-widest">Lead WhatsApp number (demo)</Label>
              <Input
                placeholder="+91 98765 12345"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="mt-1.5 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Pillar icon={<Sparkles className="h-4 w-4" />} kicker="Step 1" title="Drop the lead in" body="Profile + transcript, or upload a call recording — we'll transcribe it." />
          <Pillar icon={<Phone className="h-4 w-4" />} kicker="Step 2" title="Brief sent to BDA" body="Short, scannable, persona-aware. Hits WhatsApp ~2 min before dialling." />
          <Pillar icon={<FileText className="h-4 w-4" />} kicker="Step 3" title="Trust PDF for the lead" body="Personalised. Approved. Sent. Designed to earn the entrance test." />
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-2">Run the agent</p>
          <h2 className="font-display text-4xl">One lead in. Two outputs out.</h2>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elevated">
          <LeadInputForm onReady={handleGenerate} busy={busy} />
        </div>
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section id="results" className="max-w-6xl mx-auto px-6 pb-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{results.length} generated · most recent first</p>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-12">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <NudgePreview nudge={r.nudge} bdaPhone={bdaPhone} />
                <PdfApprovalCard content={r.pdf} profile={r.profile} leadPhone={leadPhone} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 text-xs text-muted-foreground flex items-center justify-between flex-wrap gap-2">
          <p>Ayuda · Built for the Scaler AI Builder take-home</p>
          <p className="flex items-center gap-1.5">Pre-sales nudge · Post-call trust PDF · Audio path · BDA approval gate <ArrowRight className="h-3 w-3" /></p>
        </div>
      </footer>
    </div>
  );
}

function Pillar({ icon, kicker, title, body }: { icon: React.ReactNode; kicker: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
      <div className="flex items-center gap-2 text-accent text-xs font-semibold uppercase tracking-widest mb-3">
        {icon} {kicker}
      </div>
      <h3 className="font-display text-xl mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
