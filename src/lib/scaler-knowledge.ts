// Curated, conservative grounding facts about Scaler programs.
// Used to prevent fabrication. Keep claims general; never invent module names.
export const SCALER_KNOWLEDGE = {
  programs: [
    {
      id: "academy",
      name: "Scaler Academy",
      duration: "12 months",
      audience: "Software engineers with 0–7 YoE wanting to switch to better product companies",
      fee_inr: "~₹3.5L (financing available)",
      focus:
        "Data structures, system design, advanced backend, DSA mastery, problem-solving, mock interviews, mentorship from senior engineers at top product companies.",
    },
    {
      id: "ai-engineering",
      name: "Scaler AI Engineering / DSML track",
      duration: "12+ months",
      audience: "Engineers wanting to move into ML/AI engineering roles",
      fee_inr: "~₹3.5L",
      focus:
        "Applied ML, deep learning fundamentals, modern LLM application building (RAG, agents, evals), production-grade ML engineering. Mentorship from practitioners.",
    },
    {
      id: "devops",
      name: "Scaler DevOps & Cloud",
      duration: "9 months",
      audience: "Engineers focused on infra, SRE, cloud, DevOps roles",
      fee_inr: "~₹3L",
      focus: "Cloud (AWS/GCP), CI/CD, observability, Kubernetes, infrastructure as code.",
    },
  ],
  general_strengths: [
    "1:1 mentorship from senior engineers currently working at product companies (not academic instructors).",
    "Live structured classes (not pre-recorded), with cohort-based learning.",
    "Strong interview prep loop and dedicated career services / placement team.",
    "Access to alumni network across companies like Google, Amazon, Microsoft, Flipkart, etc.",
    "Hands-on projects evaluated by mentors.",
  ],
  honest_caveats: [
    "We do not guarantee jobs — placement support is real but outcomes depend on the learner's effort and starting point.",
    "Outcomes vary across cohorts; talk to recent alumni from a similar background to get a realistic picture.",
    "Specific module syllabi update each cohort — for current curriculum depth, confirm on scaler.com or with a counsellor.",
  ],
  financing: [
    "EMI options through partner NBFCs.",
    "ISA-style and deferred-payment options have existed in the past but vary by program — confirm current offers.",
  ],
};

export function knowledgeAsPromptContext(): string {
  return `SCALER GROUNDING FACTS (use ONLY these; do not invent specifics like module names or percentage outcomes):
${JSON.stringify(SCALER_KNOWLEDGE, null, 2)}

Anti-hallucination rule: If the lead asks about a specific curriculum module, named alumni outcome, or a number you do not have above, say "I'd want to confirm the specifics with the team and get back to you" — never fabricate.`;
}
