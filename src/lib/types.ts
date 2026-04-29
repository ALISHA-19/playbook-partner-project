export type LeadProfile = {
  name: string;
  role?: string;
  company?: string;
  yoe?: string;
  intent?: string;
  background?: string;
  current_package_lpa?: string;
  notes?: string;
};

export type ExtractedQuestion = {
  question: string;
  category: "roi" | "curriculum" | "outcomes" | "logistics" | "trust" | "other";
};

export type NudgeOutput = {
  one_liner: string;
  who_they_are: string;
  persona_label: string;
  angles: { angle: string; why: string }[];
  objections: { objection: string; handle: string }[];
  opening_hook: string;
  flags: string[]; // inferred / missing / risk notes
};

export type PdfContent = {
  cover_title: string;
  cover_subtitle: string;
  opening_note: string; // 2-3 sentences, personalised
  questions_addressed: {
    question: string;
    answer: string;
    evidence: string;
  }[];
  why_scaler_for_you: string[]; // 3 bullets framed for THIS lead
  honest_caveat: string; // build trust
  next_step: string;
  whatsapp_cover_message: string;
};
