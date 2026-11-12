# Scaler Sales Agent: AI briefings and trust PDFs

An AI sales assistant by Alisha Chaudhari, built for the **Scaler AI Builder** take-home. **One lead in, two outputs out.**

**▶ Live demo: [playbook-partner-project.lovable.app](https://playbook-partner-project.lovable.app)**. Load a sample persona and click *Generate briefing + lead PDF*.

## What's inside
- **Pre-sales nudge:** from a lead's background (LinkedIn, education, past roles) and internal notes, it writes a pre-call briefing for the sales rep (BDA) and a WhatsApp cover message.
- **Post-call trust PDF:** from the call transcript, it pulls out the lead's real questions and builds a personalised PDF: *Your questions, answered*, *Why Scaler, for you specifically*, and a *Being honest with you* caveat.
- **Audio path:** upload a call recording and get a transcript that shows who said what.
- **BDA approval gate:** nothing reaches the lead until the sales rep approves it.
- **Grounded, not invented:** program facts come from a small, careful knowledge file, so the AI can't make up course names or claims. Sample personas let you load a demo lead in one click.

A take-home prototype. Program details are general, public-level facts, and it is not affiliated with or endorsed by Scaler.

**Stack:** TanStack Start (React + TypeScript), Tailwind + shadcn/ui, Supabase, Gemini 2.5 Flash via the Lovable AI gateway. Built with Lovable.

```bash
npm install
npm run dev
```
