"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContentDocument, ContentKind, ContentStatus } from "../lib/content";
import SocialAssetKit from "./SocialAssetKit";

const kindLabels: Record<ContentKind, string> = {
  "field-update": "Field updates", "prayer-request": "Prayer requests", story: "Stories", "partner-church": "Partner churches", "active-need": "Active needs",
};
const kindSingular: Record<ContentKind, string> = {
  "field-update": "Field update", "prayer-request": "Prayer request", story: "Story", "partner-church": "Partner church", "active-need": "Active need",
};
const emptyDocument = (kind: ContentKind): ContentDocument => ({
  id: "", kind, slug: "", title: "", subtitle: "", summary: "", body: "", status: "draft", image: "", imageAlt: "",
  churchSlug: "", programSlug: "", publishedOn: new Date().toISOString().slice(0, 10), metadata: {}, authorEmail: "", createdAt: "", updatedAt: "", publishedAt: null, revision: 0,
});

function formatTimestamp(value: string) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function ArticlePreview({ document }: { document: ContentDocument }) {
  const blocks = document.body.split(/\n\s*\n/).filter(Boolean);
  return <article className="desk-preview-article">
    <p className="desk-preview-kicker">{kindSingular[document.kind]} · {document.publishedOn || "Publication date"}</p>
    <h1>{document.title || "Your title will appear here"}</h1>
    {(document.subtitle || document.summary) && <p className="desk-preview-deck">{document.subtitle || document.summary}</p>}
    {document.image && <Image unoptimized src={document.image} alt={document.imageAlt || "Preview image"} width={1024} height={660} />}
    <div className="desk-preview-body">{blocks.length ? blocks.map((block, index) => {
      if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
      if (block.startsWith("> ")) return <blockquote key={index}>{block.slice(2)}</blockquote>;
      if (/^[-*] /.test(block)) return <ul key={index}>{block.split("\n").map((line) => <li key={line}>{line.replace(/^[-*] /, "")}</li>)}</ul>;
      return <p key={index}>{block.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
    }) : <p className="desk-preview-placeholder">Start writing to see the article preview.</p>}</div>
  </article>;
}

export default function AdminDesk() {
  const [documents, setDocuments] = useState<ContentDocument[]>([]);
  const [filter, setFilter] = useState<ContentKind | "all">("all");
  const [active, setActive] = useState<ContentDocument | null>(null);
  const [view, setView] = useState<"dashboard" | "editor">("dashboard");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Loading the content desk…");
  const [identity, setIdentity] = useState<{ email: string; local: boolean } | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<ContentDocument | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not open the content desk.");
      setDocuments(data.documents); setIdentity(data.identity); setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not open the content desk."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => { latest.current = active; }, [active]);
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const visibleDocuments = useMemo(() => filter === "all" ? documents : documents.filter((item) => item.kind === filter), [documents, filter]);
  const counts = useMemo(() => ({
    draft: documents.filter((item) => item.status === "draft").length,
    review: documents.filter((item) => item.status === "review").length,
    published: documents.filter((item) => item.status === "published").length,
  }), [documents]);

  async function save(document = latest.current, silent = false) {
    if (!document || !document.title.trim()) return;
    if (!silent) setMessage("Saving…");
    try {
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(document) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this document.");
      const saved = { ...document, id: data.id, slug: data.slug, status: data.status, updatedAt: data.updatedAt, revision: data.revision };
      setActive(saved); latest.current = saved;
      setDocuments((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
      setMessage(silent ? "All changes saved" : "Saved");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save this document."); }
  }

  function update<K extends keyof ContentDocument>(key: K, value: ContentDocument[K]) {
    setActive((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value }; latest.current = next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (next.title.trim()) { setMessage("Unsaved changes"); saveTimer.current = setTimeout(() => void save(latest.current, true), 1200); }
      return next;
    });
  }
  function updateMetadata(key: string, value: string | number) {
    if (!active) return;
    update("metadata", { ...active.metadata, [key]: value });
  }

  function start(kind: ContentKind) { const document = emptyDocument(kind); setActive(document); latest.current = document; setPreview(false); setView("editor"); setMessage("New draft"); }
  function edit(document: ContentDocument) { setActive(document); latest.current = document; setPreview(false); setView("editor"); setMessage("All changes saved"); }
  async function changeStatus(status: ContentStatus) {
    if (!active) return;
    if (!active.title.trim() || !active.summary.trim()) { setMessage("Add a title and short summary before changing status."); return; }
    const next = { ...active, status }; setActive(next); latest.current = next; await save(next);
  }
  async function remove(document: ContentDocument) {
    if (!window.confirm(`Delete “${document.title}”? This cannot be undone.`)) return;
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", id: document.id }) });
    if (response.ok) { setDocuments((items) => items.filter((item) => item.id !== document.id)); setView("dashboard"); setActive(null); setMessage("Document deleted"); }
  }
  function insert(prefix: string, suffix = "") {
    const textarea = bodyRef.current; if (!textarea || !active) return;
    const start = textarea.selectionStart, end = textarea.selectionEnd, selected = active.body.slice(start, end);
    const nextBody = `${active.body.slice(0, start)}${prefix}${selected}${suffix}${active.body.slice(end)}`;
    update("body", nextBody);
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + prefix.length, end + prefix.length); });
  }

  async function uploadImage(file: File | undefined) {
    if (!file || !active) return;
    setUploading(true); setMessage("Uploading image…");
    const form = new FormData(); form.set("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not upload this image.");
      update("image", data.url); setMessage("Image uploaded");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not upload this image."); }
    finally { setUploading(false); }
  }

  return <div className="admin-desk">
    <aside className="desk-sidebar">
      <Link href="/" className="desk-brand"><Image unoptimized src="/brand-mark.png" alt="" width={42} height={42} /><span><strong>KMI</strong><small>Content Desk</small></span></Link>
      <button className={view === "dashboard" && filter === "all" ? "is-active" : ""} onClick={() => { setView("dashboard"); setFilter("all"); }}>Overview</button>
      <p>Content</p>
      {(Object.keys(kindLabels) as ContentKind[]).map((kind) => <button className={view === "dashboard" && filter === kind ? "is-active" : ""} onClick={() => { setView("dashboard"); setFilter(kind); }} key={kind}>{kindLabels[kind]}</button>)}
      <div className="desk-sidebar-bottom"><span>{identity?.local ? "Local editor mode" : "Signed in"}</span><small>{identity?.email || "Connecting…"}</small><Link href="/">View website ↗</Link>{identity && !identity.local && <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form>}</div>
    </aside>
    <main className="desk-main">
      {loading ? <div className="desk-empty"><span className="desk-spinner" /><h1>Opening your content desk</h1><p>{message}</p></div> : view === "dashboard" ? <>
        <header className="desk-topbar"><div><p className="desk-eyebrow">KMI Team workspace</p><h1>{filter === "all" ? "Good to see you." : kindLabels[filter]}</h1></div><button className="desk-primary" onClick={() => start(filter === "all" ? "field-update" : filter)}>Write something new</button></header>
        {message && <p className="desk-message" role="status">{message}</p>}
        {filter === "all" && <section className="desk-stats" aria-label="Content status"><article><strong>{counts.draft}</strong><span>Drafts</span></article><article><strong>{counts.review}</strong><span>Ready for review</span></article><article><strong>{counts.published}</strong><span>Published</span></article></section>}
        <section className="desk-quick"><p className="desk-eyebrow">Quick start</p><div>{(Object.keys(kindLabels) as ContentKind[]).map((kind) => <button onClick={() => start(kind)} key={kind}><span>+</span><strong>{kindSingular[kind]}</strong><small>{kind === "story" || kind === "field-update" ? "Open the writing editor" : "Open a guided form"}</small></button>)}</div></section>
        <section className="desk-library"><div className="desk-section-heading"><div><p className="desk-eyebrow">Content library</p><h2>{filter === "all" ? "Recently updated" : `All ${kindLabels[filter].toLowerCase()}`}</h2></div></div>
          {visibleDocuments.length ? <div className="desk-table">{visibleDocuments.map((document) => <article key={document.id}><div className={`desk-kind-icon kind-${document.kind}`}>{document.kind === "story" ? "S" : document.kind === "field-update" ? "U" : document.kind === "partner-church" ? "C" : "N"}</div><div><strong>{document.title}</strong><small>{kindSingular[document.kind]} · Updated {formatTimestamp(document.updatedAt)}</small></div><span className={`desk-status status-${document.status}`}>{document.status === "review" ? "For review" : document.status}</span><button onClick={() => edit(document)}>Edit</button></article>)}</div> : <div className="desk-zero"><h3>No content here yet.</h3><p>Create the first {filter === "all" ? "field update, story, church, or need" : kindLabels[filter].toLowerCase()}.</p></div>}
        </section>
      </> : active && <>
        <header className="desk-editor-bar"><button className="desk-back" onClick={() => { setView("dashboard"); void load(); }}>← Content</button><span className="desk-save-state" role="status">{message}</span><div><button className="desk-secondary" onClick={() => setPreview(!preview)}>{preview ? "Keep editing" : "Preview"}</button><button className="desk-secondary" onClick={() => void changeStatus("review")}>Request review</button><button className="desk-primary" onClick={() => void changeStatus("published")}>Publish</button></div></header>
        {preview ? <div className="desk-preview"><ArticlePreview document={active} /></div> : <div className="desk-editor-layout"><article className="desk-editor-paper">
          <p className="desk-editor-type">{kindSingular[active.kind]}</p>
          <textarea className="desk-title-input" aria-label="Title" placeholder={active.kind === "story" ? "Story title" : active.kind === "field-update" ? "What happened?" : `Name this ${kindLabels[active.kind].toLowerCase().replace(/s$/, "")}`} value={active.title} onChange={(event) => update("title", event.target.value)} rows={2} />
          <textarea className="desk-deck-input" aria-label="Subtitle" placeholder="A short subtitle or introduction" value={active.subtitle} onChange={(event) => update("subtitle", event.target.value)} rows={2} />
          <textarea className="desk-summary-input" aria-label="Summary" placeholder="Write a short summary for cards and search results…" value={active.summary} onChange={(event) => update("summary", event.target.value)} rows={3} />
          {(active.kind === "story" || active.kind === "field-update" || active.kind === "prayer-request") && <><div className="desk-writing-toolbar" aria-label="Writing tools"><button title="Heading" onClick={() => insert("\n\n## ")}>H2</button><button title="Bold" onClick={() => insert("**", "**")}><strong>B</strong></button><button title="Quote" onClick={() => insert("\n\n> ")}>“</button><button title="Bulleted list" onClick={() => insert("\n\n- ")}>• List</button><span>Separate paragraphs with a blank line</span></div><textarea ref={bodyRef} className="desk-body-input" aria-label="Article body" placeholder={active.kind === "prayer-request" ? "Share thanksgiving and prayer points…\n\nUse a simple list so people can pray along." : "Tell the story in your own words…\n\nKeep paragraphs short and clear. You can add headings, quotes, and lists using the toolbar."} value={active.body} onChange={(event) => update("body", event.target.value)} /></>}
          {active.kind === "prayer-request" && <div className="desk-guided-fields"><h2>Prayer focus</h2><label>One-line focus<textarea value={String(active.metadata.focus || "")} onChange={(event) => updateMetadata("focus", event.target.value)} rows={3} placeholder="The main themes people will pray for" /></label></div>}
          {active.kind === "partner-church" && <div className="desk-guided-fields"><h2>Church profile</h2><label>Location<input value={String(active.metadata.location || "")} onChange={(event) => updateMetadata("location", event.target.value)} placeholder="City, province" /></label><label>Prayer request<textarea value={String(active.metadata.prayer || "")} onChange={(event) => updateMetadata("prayer", event.target.value)} rows={4} /></label><label>Ministry description<textarea value={active.body} onChange={(event) => update("body", event.target.value)} rows={8} placeholder="Describe the church and its ministry in the community." /></label></div>}
          {active.kind === "active-need" && <div className="desk-guided-fields"><h2>Need details</h2><div><label>Target amount (PHP)<input type="number" min="0" value={String(active.metadata.target || "")} onChange={(event) => updateMetadata("target", Number(event.target.value))} /></label><label>Amount received (PHP)<input type="number" min="0" value={String(active.metadata.received || "")} onChange={(event) => updateMetadata("received", Number(event.target.value))} /></label></div><div><label>Need status<select value={String(active.metadata.needStatus || "active")} onChange={(event) => updateMetadata("needStatus", event.target.value)}><option value="active">Open</option><option value="closing">Closing soon</option><option value="fully-funded">Fully funded</option><option value="completed">Completed</option></select></label><label>Deadline<input type="date" value={String(active.metadata.deadline || "")} onChange={(event) => updateMetadata("deadline", event.target.value)} /></label></div><label>Phase<input value={String(active.metadata.phase || "")} onChange={(event) => updateMetadata("phase", event.target.value)} placeholder="Planning, active, closing…" /></label><label>Prayer request<textarea value={String(active.metadata.prayer || "")} onChange={(event) => updateMetadata("prayer", event.target.value)} rows={4} /></label><label>Completion or transition goal<textarea value={String(active.metadata.transitionGoal || "")} onChange={(event) => updateMetadata("transitionGoal", event.target.value)} rows={4} /></label></div>}
        </article><aside className="desk-settings"><h2>Details</h2><label>Publication date<input type="date" value={active.publishedOn} onChange={(event) => update("publishedOn", event.target.value)} /></label><label>Web address<input value={active.slug} placeholder="Created from the title" onChange={(event) => update("slug", event.target.value)} /><small>/ {active.kind === "story" ? "stories" : active.kind === "field-update" ? "field-updates" : active.kind === "prayer-request" ? "prayer" : active.kind === "partner-church" ? "partner-churches" : "active-needs"} / {active.slug || "your-title"}</small></label><label>Program<select value={active.programSlug} onChange={(event) => update("programSlug", event.target.value)}><option value="">Select a program</option><option value="feeding-program">Feeding Program</option><option value="child-sponsorship">Child Sponsorship</option><option value="bless-a-senior">Bless a Senior Citizen</option><option value="ofw-families">OFW Families</option></select></label><label>Partner church<select value={active.churchSlug} onChange={(event) => update("churchSlug", event.target.value)}><option value="">Select a church</option><option value="christ-in-you-forever">Christ in You Forever</option><option value="san-rafael-fundamental-baptist">San Rafael Fundamental Baptist</option><option value="kingdom-righteousness">Kingdom Righteousness Ministry</option></select></label><label className="desk-upload">Feature image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} /><span>{uploading ? "Uploading…" : "Choose JPG, PNG, or WebP"}</span></label><label>Or paste an image URL<input value={active.image} placeholder="https://…" onChange={(event) => update("image", event.target.value)} /></label>{active.image && <Image className="desk-image-thumb" unoptimized src={active.image} alt="Selected feature image preview" width={320} height={200} />}<label>Image description<input value={active.imageAlt} placeholder="Describe the image for people who cannot see it" onChange={(event) => update("imageAlt", event.target.value)} /></label><div className="desk-status-panel"><span>Current status</span><strong>{active.status === "review" ? "For review" : active.status}</strong><small>Revision {active.revision || 1}</small></div>{active.id && <button className="desk-delete" onClick={() => void remove(active)}>Delete this document</button>}</aside></div>}
        {active.status === "published" && <SocialAssetKit document={active} />}
      </>}
    </main>
  </div>;
}
