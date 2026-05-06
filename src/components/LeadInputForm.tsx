import { useState } from "react";
import type { LeadProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_PERSONAS } from "@/lib/sample-personas";
import { Upload, Loader2, FileAudio } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onReady: (args: { profile: LeadProfile; transcript: string }) => void;
  busy?: boolean;
  onLeadPhone?: (phone: string) => void;
};

export function LeadInputForm({ onReady, busy, onLeadPhone }: Props) {
  const [mode, setMode] = useState<"structured" | "audio">("structured");
  const [profile, setProfile] = useState<LeadProfile>({ name: "" });
  const [transcript, setTranscript] = useState("");
  const [transcribing, setTranscribing] = useState(false);

  const loadPersona = (id: string) => {
    const p = SAMPLE_PERSONAS.find((x) => x.id === id)! as typeof SAMPLE_PERSONAS[number] & { phone?: string };
    setProfile({
      name: p.name,
      role: p.role,
      company: p.company,
      yoe: p.yoe,
      intent: p.intent,
      background: p.background,
      current_package_lpa: p.current_package_lpa,
      notes: p.notes,
    });
    setTranscript(p.transcript);
    if (p.phone && onLeadPhone) {
      onLeadPhone(p.phone);
      toast.success(`Lead WhatsApp set to +${p.phone}`);
    }
  };

  const handleAudio = async (file: File) => {
    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("audio", file);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      setTranscript(data.transcript);
      toast.success("Audio transcribed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  };

  const submit = () => {
    if (!profile.name.trim()) return toast.error("Lead name is required");
    if (!transcript.trim() || transcript.length < 30) return toast.error("Transcript looks too short");
    onReady({ profile, transcript });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Quick-load standard persona</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPersona(p.id)}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name *" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
        <Field label="Role" value={profile.role ?? ""} onChange={(v) => setProfile({ ...profile, role: v })} />
        <Field label="Company" value={profile.company ?? ""} onChange={(v) => setProfile({ ...profile, company: v })} />
        <Field label="Years of experience" value={profile.yoe ?? ""} onChange={(v) => setProfile({ ...profile, yoe: v })} />
        <Field label="Current package (LPA)" value={profile.current_package_lpa ?? ""} onChange={(v) => setProfile({ ...profile, current_package_lpa: v })} />
        <Field label="Intent / why they're here" value={profile.intent ?? ""} onChange={(v) => setProfile({ ...profile, intent: v })} />
      </div>
      <div>
        <Label>Background (LinkedIn / education / past roles)</Label>
        <Textarea
          rows={2}
          value={profile.background ?? ""}
          onChange={(e) => setProfile({ ...profile, background: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Internal notes</Label>
        <Textarea rows={2} value={profile.notes ?? ""} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} className="mt-1.5" />
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setMode("structured")}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              mode === "structured" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Paste transcript
          </button>
          <button
            type="button"
            onClick={() => setMode("audio")}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              mode === "audio" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload call recording
          </button>
        </div>

        {mode === "audio" && (
          <div className="mb-4">
            <label className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-card p-5 cursor-pointer hover:border-accent transition-colors">
              {transcribing ? <Loader2 className="h-5 w-5 animate-spin text-accent" /> : <FileAudio className="h-5 w-5 text-accent" />}
              <div className="flex-1">
                <p className="text-sm font-medium">{transcribing ? "Transcribing..." : "Drop a call recording (.mp3 / .wav, ≤20MB)"}</p>
                <p className="text-xs text-muted-foreground">Routed through Lovable AI for diarised transcript</p>
              </div>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                disabled={transcribing}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAudio(f);
                }}
              />
            </label>
          </div>
        )}

        <Label>Call transcript</Label>
        <Textarea
          rows={8}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="mt-1.5 font-mono text-xs"
          placeholder="BDA: ...&#10;Lead: ..."
        />
      </div>

      <Button onClick={submit} disabled={busy} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Generate briefing + lead PDF
      </Button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}
