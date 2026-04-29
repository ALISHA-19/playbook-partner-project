import { jsPDF } from "jspdf";
import type { PdfContent, LeadProfile } from "./types";

export function renderPdf(content: PdfContent, profile: LeadProfile): Blob {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = W - M * 2;

  // Brand colors
  const navy: [number, number, number] = [12, 28, 58];
  const accent: [number, number, number] = [255, 110, 64];
  const muted: [number, number, number] = [110, 116, 130];
  const ink: [number, number, number] = [25, 28, 38];

  let y = M;

  const setFont = (size: number, weight: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
  };
  const text = (str: string, x: number, yy: number, opts?: { maxWidth?: number; color?: [number, number, number] }) => {
    if (opts?.color) doc.setTextColor(...opts.color);
    const lines = doc.splitTextToSize(str, opts?.maxWidth ?? contentW);
    doc.text(lines, x, yy);
    return lines.length * (doc.getFontSize() * 1.25);
  };
  const ensure = (need: number) => {
    if (y + need > H - M) {
      doc.addPage();
      y = M;
    }
  };

  // === COVER BLOCK ===
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 180, "F");
  doc.setFillColor(...accent);
  doc.rect(0, 175, W, 5, "F");

  doc.setTextColor(255, 255, 255);
  setFont(10, "bold");
  doc.text("SCALER", M, 50);
  setFont(9, "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("Prepared specifically for you", M, 64);

  setFont(22, "bold");
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(content.cover_title, contentW);
  doc.text(titleLines, M, 105);

  setFont(11, "normal");
  doc.setTextColor(220, 225, 235);
  doc.text(doc.splitTextToSize(content.cover_subtitle, contentW), M, 105 + titleLines.length * 26);

  y = 210;

  // Lead name strip
  doc.setTextColor(...muted);
  setFont(9, "normal");
  doc.text(`For: ${profile.name}${profile.role ? " — " + profile.role : ""}${profile.company ? " @ " + profile.company : ""}`, M, y);
  y += 22;

  // Opening note
  doc.setTextColor(...ink);
  setFont(11, "normal");
  y += text(content.opening_note, M, y, { maxWidth: contentW });
  y += 14;

  // Section: Your questions, answered
  ensure(40);
  doc.setDrawColor(...accent);
  doc.setLineWidth(2);
  doc.line(M, y, M + 32, y);
  y += 14;
  setFont(14, "bold");
  doc.setTextColor(...navy);
  doc.text("Your questions, answered", M, y);
  y += 18;

  content.questions_addressed.forEach((q, i) => {
    ensure(80);
    setFont(11, "bold");
    doc.setTextColor(...ink);
    y += text(`${i + 1}. ${q.question}`, M, y, { maxWidth: contentW });
    y += 4;
    setFont(10.5, "normal");
    doc.setTextColor(...ink);
    y += text(q.answer, M, y, { maxWidth: contentW });
    y += 4;
    setFont(9.5, "normal");
    doc.setTextColor(...muted);
    y += text("Why we're confident: " + q.evidence, M, y, { maxWidth: contentW });
    y += 14;
  });

  // Section: Why Scaler — for you
  ensure(60);
  doc.setDrawColor(...accent);
  doc.line(M, y, M + 32, y);
  y += 14;
  setFont(14, "bold");
  doc.setTextColor(...navy);
  doc.text("Why Scaler — for you specifically", M, y);
  y += 18;
  setFont(10.5, "normal");
  doc.setTextColor(...ink);
  content.why_scaler_for_you.forEach((b) => {
    ensure(30);
    doc.setFillColor(...accent);
    doc.circle(M + 4, y - 3, 2.5, "F");
    y += text(b, M + 14, y, { maxWidth: contentW - 14 });
    y += 6;
  });

  // Honest caveat
  ensure(80);
  y += 6;
  doc.setFillColor(248, 246, 240);
  const caveatLines = doc.splitTextToSize(content.honest_caveat, contentW - 24);
  const boxH = 28 + caveatLines.length * 13;
  doc.rect(M, y, contentW, boxH, "F");
  doc.setDrawColor(...accent);
  doc.setLineWidth(2);
  doc.line(M, y, M, y + boxH);
  setFont(10, "bold");
  doc.setTextColor(...navy);
  doc.text("Being honest with you", M + 14, y + 18);
  setFont(10, "normal");
  doc.setTextColor(...ink);
  doc.text(caveatLines, M + 14, y + 34);
  y += boxH + 18;

  // Next step
  ensure(50);
  doc.setFillColor(...navy);
  doc.rect(M, y, contentW, 56, "F");
  setFont(10, "bold");
  doc.setTextColor(255, 200, 170);
  doc.text("YOUR NEXT STEP", M + 16, y + 22);
  setFont(11, "normal");
  doc.setTextColor(255, 255, 255);
  const nextLines = doc.splitTextToSize(content.next_step, contentW - 32);
  doc.text(nextLines, M + 16, y + 40);

  // Footer
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    setFont(8, "normal");
    doc.setTextColor(...muted);
    doc.text(`Scaler · Prepared for ${profile.name} · Page ${p} of ${pages}`, M, H - 24);
  }

  return doc.output("blob");
}
