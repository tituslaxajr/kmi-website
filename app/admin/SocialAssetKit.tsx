"use client";

import { useState } from "react";
import type { ContentDocument } from "../lib/content";

type SocialFormat = { id: string; label: string; note: string; width: number; height: number };

const formats: SocialFormat[] = [
  { id: "square", label: "Square post", note: "Instagram · Facebook", width: 1080, height: 1080 },
  { id: "story", label: "Story", note: "Instagram · Facebook", width: 1080, height: 1920 },
  { id: "landscape", label: "Link card", note: "Facebook · LinkedIn · X", width: 1200, height: 630 },
];

const kindNames = {
  "field-update": "FIELD UPDATE",
  "prayer-request": "PRAYER REQUEST",
  story: "STORY FROM THE FIELD",
  "partner-church": "PARTNER CHURCH",
  "active-need": "ACTIVE NEED",
} as const;

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function fitLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number, startSize: number) {
  let size = startSize;
  let lines: string[] = [];
  do {
    context.font = `600 ${size}px Georgia, serif`;
    lines = wrapText(context, text, maxWidth);
    size -= 2;
  } while (lines.length > maxLines && size > 42);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:!?]?$/, "")}…`;
  }
  return { lines, size: size + 2 };
}

function createAsset(document: ContentDocument, format: SocialFormat) {
  const canvas = window.document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const context = canvas.getContext("2d");
  if (!context) return;

  const portrait = format.height > format.width * 1.2;
  const compact = format.height < 800;
  const margin = compact ? 70 : 86;
  const accent = document.kind === "prayer-request" ? "#e6a14e" : document.kind === "active-need" ? "#c94d45" : "#80b4cf";
  context.fillStyle = "#06283f";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = accent;
  context.fillRect(0, 0, compact ? 22 : 30, canvas.height);

  context.globalAlpha = 0.09;
  context.fillStyle = "#fffdfa";
  context.beginPath();
  context.arc(canvas.width * 0.88, canvas.height * (portrait ? 0.8 : 0.72), portrait ? 480 : 310, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.fillStyle = accent;
  context.font = `700 ${compact ? 24 : 28}px Arial, sans-serif`;
  context.letterSpacing = "3px";
  context.fillText(kindNames[document.kind], margin, margin + 10);
  context.letterSpacing = "0px";

  if (document.publishedOn) {
    context.fillStyle = "rgba(255,255,255,.72)";
    context.font = `500 ${compact ? 22 : 25}px Arial, sans-serif`;
    const date = new Intl.DateTimeFormat("en-PH", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${document.publishedOn}T00:00:00`));
    context.fillText(date, margin, margin + (compact ? 50 : 58));
  }

  const titleTop = compact ? 185 : portrait ? 330 : 245;
  const titleSize = compact ? 62 : portrait ? 90 : 78;
  const { lines, size } = fitLines(context, document.title || "Kapatid Ministry update", canvas.width - margin * 2, compact ? 3 : portrait ? 5 : 3, titleSize);
  context.fillStyle = "#fffdfa";
  context.font = `600 ${size}px Georgia, serif`;
  const lineHeight = size * 1.04;
  lines.forEach((line, index) => context.fillText(line, margin, titleTop + index * lineHeight));

  const summaryTop = titleTop + lines.length * lineHeight + (compact ? 34 : 54);
  context.fillStyle = "rgba(255,255,255,.82)";
  context.font = `400 ${compact ? 26 : 31}px Arial, sans-serif`;
  const summaryLines = wrapText(context, document.summary || document.subtitle || "Pray, follow, and partner with the local church.", canvas.width - margin * 2).slice(0, compact ? 3 : 5);
  summaryLines.forEach((line, index) => context.fillText(line, margin, summaryTop + index * (compact ? 36 : 44)));

  const footerY = canvas.height - (compact ? 64 : 92);
  context.fillStyle = accent;
  context.beginPath();
  context.arc(margin + 20, footerY - 10, 20, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#06283f";
  context.font = "700 20px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("K", margin + 20, footerY - 3);
  context.textAlign = "left";
  context.fillStyle = "#fffdfa";
  context.font = `700 ${compact ? 24 : 28}px Arial, sans-serif`;
  context.fillText("KAPATID MINISTRY", margin + 56, footerY);
  context.fillStyle = "rgba(255,255,255,.65)";
  context.font = `500 ${compact ? 20 : 23}px Arial, sans-serif`;
  const domain = "kapatidministry.org";
  context.fillText(domain, canvas.width - margin - context.measureText(domain).width, footerY);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${document.slug || "kmi-post"}-${format.id}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

export default function SocialAssetKit({ document }: { document: ContentDocument }) {
  const [message, setMessage] = useState("");
  const caption = `${document.title}\n\n${document.summary}\n\nRead more: https://kapatidministry.org/${document.kind === "prayer-request" ? "prayer" : document.kind === "field-update" ? "field-updates" : document.kind === "active-need" ? "active-needs" : document.kind === "partner-church" ? "partner-churches" : "stories"}/${document.slug}`;

  async function copyCaption() {
    await navigator.clipboard.writeText(caption);
    setMessage("Caption copied");
  }

  return (
    <section className="social-kit" aria-labelledby="social-kit-title">
      <div className="social-kit-heading">
        <div><p className="desk-eyebrow">Ready to share</p><h2 id="social-kit-title">Social media assets</h2></div>
        <button className="desk-secondary" onClick={() => void copyCaption()}>Copy caption</button>
      </div>
      <p>Download branded artwork in the right size for each channel. The title and summary stay in sync with this published post.</p>
      {message && <p className="social-kit-message" role="status">{message}</p>}
      <div className="social-kit-preview" aria-hidden="true"><span>{kindNames[document.kind]}</span><strong>{document.title}</strong><small>KAPATID MINISTRY · kapatidministry.org</small></div>
      <div className="social-format-grid">
        {formats.map((format) => <button key={format.id} onClick={() => createAsset(document, format)}><strong>Download {format.label}</strong><span>{format.note}</span><small>{format.width} × {format.height} PNG</small></button>)}
      </div>
    </section>
  );
}
