"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContentDocument, ContentKind, ContentStatus } from "../lib/content";
import SocialAssetKit from "./SocialAssetKit";

const kindLabels: Record<ContentKind, string> = {
  "field-update": "Field reports",
  "prayer-request": "Prayer focus",
  story: "Stories",
  "partner-church": "Ministry partner churches",
  "active-need": "Active needs",
};

const kindSingular: Record<ContentKind, string> = {
  "field-update": "Field report",
  "prayer-request": "Prayer focus",
  story: "Story",
  "partner-church": "Ministry partner church",
  "active-need": "Active need",
};

const editorialKinds = new Set<ContentKind>(["story", "prayer-request", "field-update"]);

const programs = [
  { slug: "feeding-program", name: "Feeding Program" },
  { slug: "child-sponsorship", name: "Child Sponsorship" },
  { slug: "bless-a-senior", name: "Bless a Senior Citizen" },
  { slug: "ofw-families", name: "OFW Families" },
];

const seedChurches = [
  { slug: "christ-in-you-forever", name: "Christ in You Forever Christian Baptist Church" },
  { slug: "san-rafael-fundamental-baptist", name: "San Rafael Fundamental Baptist Church" },
  { slug: "kingdom-righteousness", name: "Kingdom Righteousness Ministry" },
];

const emptyDocument = (kind: ContentKind): ContentDocument => ({
  id: "",
  kind,
  slug: "",
  title: "",
  subtitle: "",
  summary: "",
  body: "",
  status: "draft",
  image: "",
  imageAlt: "",
  churchSlug: "",
  programSlug: "",
  publishedOn: new Date().toISOString().slice(0, 10),
  metadata: {},
  authorEmail: "",
  createdAt: "",
  updatedAt: "",
  publishedAt: null,
  revision: 0,
});

function metadataText(document: ContentDocument, key: string) {
  const value = document.metadata[key];
  return Array.isArray(value) ? "" : String(value ?? "");
}

function metadataNumber(document: ContentDocument, key: string) {
  const value = document.metadata[key];
  return typeof value === "number" ? value : Number(value || 0);
}

function metadataList(document: ContentDocument, key: string) {
  const value = document.metadata[key];
  if (Array.isArray(value)) return value.map(String);
  if (key === "programSlugs" && document.programSlug) return [document.programSlug];
  return [];
}

function formatTimestamp(value: string) {
  if (!value) return "Not saved yet";
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}

function ArticlePreview({ document }: { document: ContentDocument }) {
  const blocks = document.body.split(/\n\s*\n/).filter(Boolean);
  return (
    <article className="desk-preview-article">
      <p className="desk-preview-kicker">{kindSingular[document.kind]} · {document.publishedOn || "Publication date"}</p>
      <h1>{document.title || "Your title will appear here"}</h1>
      {(document.subtitle || document.summary) && <p className="desk-preview-deck">{document.subtitle || document.summary}</p>}
      {document.image && <Image unoptimized src={document.image} alt={document.imageAlt || "Preview image"} width={1024} height={660} />}
      <div className="desk-preview-body">
        {blocks.length ? blocks.map((block, index) => {
          if (block.startsWith("## ")) return <h2 key={index}>{block.slice(3)}</h2>;
          if (block.startsWith("> ")) return <blockquote key={index}>{block.slice(2)}</blockquote>;
          if (/^[-*] /.test(block)) return <ul key={index}>{block.split("\n").map((line) => <li key={line}>{line.replace(/^[-*] /, "")}</li>)}</ul>;
          return <p key={index}>{block.replace(/\*\*(.*?)\*\*/g, "$1")}</p>;
        }) : <p className="desk-preview-placeholder">Start writing to see the article preview.</p>}
      </div>
    </article>
  );
}

function RecordPreview({ document, churchName }: { document: ContentDocument; churchName?: string }) {
  if (document.kind === "partner-church") {
    const selectedPrograms = metadataList(document, "programSlugs");
    return (
      <article className="desk-record-preview">
        <p className="desk-preview-kicker">Ministry partner church · {metadataText(document, "location") || "Location"}</p>
        <h1>{document.title || "Church name"}</h1>
        {document.image && <Image unoptimized src={document.image} alt={document.imageAlt || "Church profile image"} width={1024} height={660} />}
        <p className="desk-record-summary">{document.summary || "The short church profile will appear here."}</p>
        <div className="desk-record-tags">{selectedPrograms.map((slug) => <span key={slug}>{programs.find((program) => program.slug === slug)?.name || slug}</span>)}</div>
        <section><small>Pray with this church</small><strong>{metadataText(document, "prayer") || "Add the church’s prayer focus."}</strong></section>
      </article>
    );
  }

  const target = metadataNumber(document, "target");
  const received = metadataNumber(document, "received");
  const percentage = target > 0 ? Math.min(100, Math.round((received / target) * 100)) : 0;
  return (
    <article className="desk-record-preview">
      <div className="desk-record-preview-top"><span>{metadataText(document, "needStatus") || "Open"}</span><small>{programs.find((program) => program.slug === document.programSlug)?.name || "Ministry program"}</small></div>
      <h1>{document.title || "Active need title"}</h1>
      <p className="desk-record-summary">{document.summary || "The short need description will appear here."}</p>
      <p className="desk-record-church">Led on the ground by {churchName || "a ministry partner church"}</p>
      <div className="desk-funding-preview"><strong>{formatPeso(received)}</strong><span>received of {formatPeso(target)}</span><div><i style={{ width: `${percentage}%` }} /></div><small>{percentage}% funded</small></div>
      <div className="desk-record-facts"><span><small>Current phase</small><strong>{metadataText(document, "phase") || "Not set"}</strong></span><span><small>Target date</small><strong>{metadataText(document, "deadline") || "Not set"}</strong></span><span><small>Update cadence</small><strong>{metadataText(document, "cadence") || "Not set"}</strong></span></div>
      <div className="desk-record-outcomes"><section><small>Pray</small><strong>{metadataText(document, "prayer") || "Add a prayer focus."}</strong></section><section><small>Next milestone</small><strong>{metadataText(document, "nextMilestone") || "Add the next milestone."}</strong></section><section><small>Long-term hope</small><strong>{metadataText(document, "transitionGoal") || "Add the completion or transition goal."}</strong></section></div>
    </article>
  );
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
      setDocuments(data.documents);
      setIdentity(data.identity);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open the content desk.");
    } finally {
      setLoading(false);
    }
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
  const churchOptions = useMemo(() => {
    const choices = new Map(seedChurches.map((church) => [church.slug, church.name]));
    documents.filter((document) => document.kind === "partner-church").forEach((document) => choices.set(document.slug, document.title));
    return Array.from(choices, ([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [documents]);

  async function save(document = latest.current, silent = false) {
    if (!document || !document.title.trim()) return;
    if (!silent) setMessage("Saving…");
    try {
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(document) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this item.");
      const saved = { ...document, id: data.id, slug: data.slug, status: data.status, updatedAt: data.updatedAt, revision: data.revision };
      setActive(saved);
      latest.current = saved;
      setDocuments((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
      setMessage(silent ? "All changes saved" : "Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this item.");
    }
  }

  function update<K extends keyof ContentDocument>(key: K, value: ContentDocument[K]) {
    setActive((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      latest.current = next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (next.title.trim()) {
        setMessage("Unsaved changes");
        saveTimer.current = setTimeout(() => void save(latest.current, true), 1200);
      }
      return next;
    });
  }

  function updateMetadata(key: string, value: string | number | boolean | string[]) {
    if (!active) return;
    update("metadata", { ...active.metadata, [key]: value });
  }

  function toggleChurchProgram(slug: string) {
    if (!active) return;
    const selected = metadataList(active, "programSlugs");
    const next = selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug];
    update("metadata", { ...active.metadata, programSlugs: next });
    update("programSlug", next[0] || "");
  }

  function start(kind: ContentKind) {
    const document = emptyDocument(kind);
    setActive(document);
    latest.current = document;
    setPreview(false);
    setView("editor");
    setMessage(editorialKinds.has(kind) ? "New draft" : "New information record");
  }

  function edit(document: ContentDocument) {
    setActive(document);
    latest.current = document;
    setPreview(false);
    setView("editor");
    setMessage("All changes saved");
  }

  function validationMessage(document: ContentDocument) {
    if (!document.title.trim() || !document.summary.trim()) return "Add a name or title and short summary before changing status.";
    if (document.image && !document.imageAlt.trim()) return "Add an image description before changing status.";
    if (editorialKinds.has(document.kind) && !document.body.trim()) return "Add the article body before changing status.";
    if (document.kind === "story" && !document.programSlug) return "Choose the ministry program before changing status.";
    if (document.kind === "field-update" && (!document.churchSlug || !document.programSlug)) return "Choose the partner church and ministry program before changing status.";
    if (document.kind === "prayer-request" && !metadataText(document, "focus").trim()) return "Add the one-line prayer focus before changing status.";
    if (document.kind === "partner-church" && (!metadataText(document, "location").trim() || !metadataList(document, "programSlugs").length)) return "Add the church location and at least one ministry program before changing status.";
    if (document.kind === "active-need") {
      if (!document.churchSlug || !document.programSlug) return "Choose the partner church and ministry program before changing status.";
      if (metadataNumber(document, "target") <= 0 || !metadataText(document, "deadline")) return "Add a target amount and target date before changing status.";
      for (const key of ["designation", "prayer", "nextMilestone", "transitionGoal"]) if (!metadataText(document, key).trim()) return `Add the ${key} before changing status.`;
    }
    return "";
  }

  async function changeStatus(status: ContentStatus) {
    if (!active) return;
    const validation = validationMessage(active);
    if (validation) { setMessage(validation); return; }
    const next = { ...active, status };
    setActive(next);
    latest.current = next;
    await save(next);
  }

  async function remove(document: ContentDocument) {
    if (!window.confirm(`Delete “${document.title}”? This cannot be undone.`)) return;
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "delete", id: document.id }) });
    if (response.ok) {
      setDocuments((items) => items.filter((item) => item.id !== document.id));
      setView("dashboard");
      setActive(null);
      setMessage("Item deleted");
    }
  }

  function insert(prefix: string, suffix = "") {
    const textarea = bodyRef.current;
    if (!textarea || !active) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = active.body.slice(start, end);
    const nextBody = `${active.body.slice(0, start)}${prefix}${selected}${suffix}${active.body.slice(end)}`;
    update("body", nextBody);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  }

  async function uploadImage(file: File | undefined) {
    if (!file || !active) return;
    setUploading(true);
    setMessage("Uploading image…");
    const form = new FormData();
    form.set("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not upload this image.");
      update("image", data.url);
      setMessage("Image uploaded");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload this image.");
    } finally {
      setUploading(false);
    }
  }

  const activeIsEditorial = active ? editorialKinds.has(active.kind) : false;
  const activeChurchName = active ? churchOptions.find((church) => church.slug === active.churchSlug)?.name : undefined;

  return (
    <div className="admin-desk">
      <aside className="desk-sidebar">
        <Link href="/" className="desk-brand"><Image unoptimized src="/brand-mark.png" alt="" width={42} height={42} /><span><strong>KMI</strong><small>Content Desk</small></span></Link>
        <button className={view === "dashboard" && filter === "all" ? "is-active" : ""} onClick={() => { setView("dashboard"); setFilter("all"); }}>Overview</button>
        <p>Content and records</p>
        {(Object.keys(kindLabels) as ContentKind[]).map((kind) => <button className={view === "dashboard" && filter === kind ? "is-active" : ""} onClick={() => { setView("dashboard"); setFilter(kind); }} key={kind}>{kindLabels[kind]}</button>)}
        <div className="desk-sidebar-bottom"><Link href="/admin/responses">Supporter responses</Link><span>{identity?.local ? "Local editor mode" : "Signed in"}</span><small>{identity?.email || "Connecting…"}</small><Link href="/">View website ↗</Link>{identity && !identity.local && <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form>}</div>
      </aside>
      <main className="desk-main">
        {loading ? <div className="desk-empty"><span className="desk-spinner" /><h1>Opening your content desk</h1><p>{message}</p></div> : view === "dashboard" ? <>
          <header className="desk-topbar"><div><p className="desk-eyebrow">KMI Team workspace</p><h1>{filter === "all" ? "Good to see you." : kindLabels[filter]}</h1></div><button className="desk-primary" onClick={() => start(filter === "all" ? "field-update" : filter)}>{filter === "partner-church" || filter === "active-need" ? `Add ${kindSingular[filter].toLowerCase()}` : "Write something new"}</button></header>
          {message && <p className="desk-message" role="status">{message}</p>}
          {filter === "all" && <section className="desk-stats" aria-label="Content status"><article><strong>{counts.draft}</strong><span>Drafts</span></article><article><strong>{counts.review}</strong><span>Ready for review</span></article><article><strong>{counts.published}</strong><span>Published</span></article></section>}
          <section className="desk-quick"><p className="desk-eyebrow">Quick start</p><div>{(Object.keys(kindLabels) as ContentKind[]).map((kind) => <button onClick={() => start(kind)} key={kind}><span>+</span><strong>{kindSingular[kind]}</strong><small>{editorialKinds.has(kind) ? "Open the writing editor" : "Open the information form"}</small></button>)}</div></section>
          <section className="desk-library"><div className="desk-section-heading"><div><p className="desk-eyebrow">Library</p><h2>{filter === "all" ? "Recently updated" : `All ${kindLabels[filter].toLowerCase()}`}</h2></div></div>
            {visibleDocuments.length ? <div className="desk-table">{visibleDocuments.map((document) => <article key={document.id}><div className={`desk-kind-icon kind-${document.kind}`}>{document.kind === "story" ? "S" : document.kind === "field-update" ? "R" : document.kind === "partner-church" ? "C" : document.kind === "active-need" ? "N" : "P"}</div><div><strong>{document.title}</strong><small>{kindSingular[document.kind]} · Updated {formatTimestamp(document.updatedAt)}</small></div><span className={`desk-status status-${document.status}`}>{document.status === "review" ? "For review" : document.status}</span><button onClick={() => edit(document)}>Edit</button></article>)}</div> : <div className="desk-zero"><h3>No items here yet.</h3><p>Create the first {filter === "all" ? "field report, story, church, or need" : kindLabels[filter].toLowerCase()}.</p></div>}
          </section>
        </> : active && <>
          <header className="desk-editor-bar"><button className="desk-back" onClick={() => { setView("dashboard"); void load(); }}>← Library</button><span className="desk-save-state" role="status">{message}</span><div><button className="desk-secondary" onClick={() => setPreview(!preview)}>{preview ? "Keep editing" : activeIsEditorial ? "Preview article" : "Preview public info"}</button><button className="desk-secondary" onClick={() => void changeStatus("review")}>Request review</button><button className="desk-primary" onClick={() => void changeStatus("published")}>Publish</button></div></header>
          {preview ? <div className="desk-preview">{activeIsEditorial ? <ArticlePreview document={active} /> : <RecordPreview document={active} churchName={activeChurchName} />}</div> : <div className={`desk-editor-layout ${activeIsEditorial ? "" : "desk-record-layout"}`}>
            {activeIsEditorial ? <article className="desk-editor-paper">
              <p className="desk-editor-type">{kindSingular[active.kind]}</p>
              <textarea className="desk-title-input" aria-label="Title" placeholder={active.kind === "story" ? "Story title" : active.kind === "field-update" ? "What happened?" : "Prayer focus title"} value={active.title} onChange={(event) => update("title", event.target.value)} rows={2} />
              <textarea className="desk-deck-input" aria-label="Subtitle" placeholder="A short subtitle or introduction" value={active.subtitle} onChange={(event) => update("subtitle", event.target.value)} rows={2} />
              <textarea className="desk-summary-input" aria-label="Summary" placeholder="Write a short summary for cards and search results…" value={active.summary} onChange={(event) => update("summary", event.target.value)} rows={3} />
              {active.kind === "prayer-request" && <label className="desk-inline-focus">One-line prayer focus<textarea value={metadataText(active, "focus")} onChange={(event) => updateMetadata("focus", event.target.value)} rows={2} placeholder="The main themes people will pray for" /></label>}
              <div className="desk-writing-toolbar" aria-label="Writing tools"><button title="Heading" onClick={() => insert("\n\n## ")}>H2</button><button title="Bold" onClick={() => insert("**", "**")}><strong>B</strong></button><button title="Quote" onClick={() => insert("\n\n> ")}>“</button><button title="Bulleted list" onClick={() => insert("\n\n- ")}>• List</button><span>Separate paragraphs with a blank line</span></div>
              <textarea ref={bodyRef} className="desk-body-input" aria-label="Article body" placeholder={active.kind === "prayer-request" ? "Share thanksgiving and prayer points…\n\nUse a simple list so people can pray along." : "Tell the story in your own words…\n\nKeep paragraphs short and clear. You can add headings, quotes, and lists using the toolbar."} value={active.body} onChange={(event) => update("body", event.target.value)} />
            </article> : active.kind === "partner-church" ? <article className="desk-record-form">
              <div className="desk-form-heading"><p className="desk-editor-type">Ministry partner church</p><h1>Church profile information</h1><p>Enter profile facts here. They will appear as a church card and a structured church profile—not as a story.</p></div>
              <section className="desk-form-section"><div><span>01</span><h2>Church identity</h2><p>The name and location people will see across the website.</p></div><div className="desk-form-fields"><label>Church name<input value={active.title} onChange={(event) => update("title", event.target.value)} placeholder="Full ministry or church name" /></label><label>Location<input value={metadataText(active, "location")} onChange={(event) => updateMetadata("location", event.target.value)} placeholder="City or municipality, province" /></label><label className="desk-field-full">Short church profile<textarea value={active.summary} onChange={(event) => update("summary", event.target.value)} rows={4} placeholder="A clear summary of the church and the community it serves" /></label></div></section>
              <section className="desk-form-section"><div><span>02</span><h2>Ministry connection</h2><p>Choose every KMI program this church carries locally.</p></div><div className="desk-checkbox-grid">{programs.map((program) => <label key={program.slug}><input type="checkbox" checked={metadataList(active, "programSlugs").includes(program.slug)} onChange={() => toggleChurchProgram(program.slug)} /><span>{program.name}</span></label>)}</div></section>
              <section className="desk-form-section"><div><span>03</span><h2>Prayer and profile status</h2><p>These details appear in the church’s public information sections.</p></div><div className="desk-form-fields"><label className="desk-field-full">Prayer focus<textarea value={metadataText(active, "prayer")} onChange={(event) => updateMetadata("prayer", event.target.value)} rows={4} placeholder="What should people pray for with this church?" /></label><label className="desk-field-full">Profile status<input value={metadataText(active, "profileStatus")} onChange={(event) => updateMetadata("profileStatus", event.target.value)} placeholder="Example: Profile maintained by the KMI team" /></label></div></section>
              <section className="desk-form-section"><div><span>04</span><h2>Church image</h2><p>Used on the partner church card and profile page.</p></div><div className="desk-form-fields"><label className="desk-upload desk-field-full">Church image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} /><span>{uploading ? "Uploading…" : "Choose JPG, PNG, or WebP"}</span></label><label className="desk-field-full">Or paste an image URL<input value={active.image} placeholder="https://…" onChange={(event) => update("image", event.target.value)} /></label>{active.image && <Image className="desk-form-image" unoptimized src={active.image} alt="Selected church image preview" width={520} height={320} />}<label className="desk-field-full">Image description<input value={active.imageAlt} placeholder="Describe the image for people who cannot see it" onChange={(event) => update("imageAlt", event.target.value)} /></label></div></section>
            </article> : <article className="desk-record-form">
              <div className="desk-form-heading"><p className="desk-editor-type">Active need</p><h1>Need information</h1><p>Enter a trackable ministry need. Each field feeds a specific public funding, progress, prayer, or accountability section.</p></div>
              <section className="desk-form-section"><div><span>01</span><h2>Need and ministry</h2><p>Name the need and connect it to the church and program doing the work.</p></div><div className="desk-form-fields"><label className="desk-field-full">Need title<input value={active.title} onChange={(event) => update("title", event.target.value)} placeholder="A clear, action-oriented name" /></label><label>Ministry partner church<select value={active.churchSlug} onChange={(event) => update("churchSlug", event.target.value)}><option value="">Select a church</option>{churchOptions.map((church) => <option value={church.slug} key={church.slug}>{church.name}</option>)}</select></label><label>Ministry program<select value={active.programSlug} onChange={(event) => update("programSlug", event.target.value)}><option value="">Select a program</option>{programs.map((program) => <option value={program.slug} key={program.slug}>{program.name}</option>)}</select></label><label className="desk-field-full">Short description<textarea value={active.summary} onChange={(event) => update("summary", event.target.value)} rows={4} placeholder="What support is needed and what will it make possible?" /></label></div></section>
              <section className="desk-form-section"><div><span>02</span><h2>Funding and timing</h2><p>These values power the progress bar and the need’s status details.</p></div><div className="desk-form-fields"><label>Target amount (PHP)<input type="number" min="0" value={metadataText(active, "target")} onChange={(event) => updateMetadata("target", Number(event.target.value))} /></label><label>Amount received (PHP)<input type="number" min="0" value={metadataText(active, "received")} onChange={(event) => updateMetadata("received", Number(event.target.value))} /></label><label>Need status<select value={metadataText(active, "needStatus") || "active"} onChange={(event) => updateMetadata("needStatus", event.target.value)}><option value="active">Open</option><option value="closing">Closing soon</option><option value="fully-funded">Fully funded</option><option value="completed">Completed</option></select></label><label>Target or completion date<input type="date" value={metadataText(active, "deadline")} onChange={(event) => updateMetadata("deadline", event.target.value)} /></label><label>Current phase<input value={metadataText(active, "phase")} onChange={(event) => updateMetadata("phase", event.target.value)} placeholder="Example: Ongoing — weekly ministry" /></label><label>Update cadence<input value={metadataText(active, "cadence")} onChange={(event) => updateMetadata("cadence", event.target.value)} placeholder="Example: Monthly field report" /></label><label className="desk-field-full">Giving designation<input value={metadataText(active, "designation")} onChange={(event) => updateMetadata("designation", event.target.value)} placeholder="Exact wording donors should use" /></label></div></section>
              <section className="desk-form-section"><div><span>03</span><h2>Accountability and prayer</h2><p>These become three distinct public information panels.</p></div><div className="desk-form-fields"><label className="desk-field-full">Prayer focus<textarea value={metadataText(active, "prayer")} onChange={(event) => updateMetadata("prayer", event.target.value)} rows={4} placeholder="What should partners pray for now?" /></label><label className="desk-field-full">Next milestone<textarea value={metadataText(active, "nextMilestone")} onChange={(event) => updateMetadata("nextMilestone", event.target.value)} rows={4} placeholder="What will the church confirm or complete next?" /></label><label className="desk-field-full">Long-term hope or transition goal<textarea value={metadataText(active, "transitionGoal")} onChange={(event) => updateMetadata("transitionGoal", event.target.value)} rows={4} placeholder="What should happen when this need is complete?" /></label></div></section>
            </article>}
            <aside className="desk-settings">
              <h2>{activeIsEditorial ? "Article details" : "Record controls"}</h2>
              {activeIsEditorial && <label>Publication date<input type="date" value={active.publishedOn} onChange={(event) => update("publishedOn", event.target.value)} /></label>}
              <label>Web address<input value={active.slug} placeholder="Created from the name or title" onChange={(event) => update("slug", event.target.value)} /><small>/{active.kind === "story" ? "stories" : active.kind === "field-update" ? "field-updates" : active.kind === "prayer-request" ? "prayer" : active.kind === "partner-church" ? "partner-churches" : "active-needs"}/{active.slug || "your-title"}</small></label>
              {activeIsEditorial && active.kind !== "prayer-request" && <label>Program<select value={active.programSlug} onChange={(event) => update("programSlug", event.target.value)}><option value="">Select a program</option>{programs.map((program) => <option value={program.slug} key={program.slug}>{program.name}</option>)}</select></label>}
              {active.kind === "field-update" && <label>Partner church<select value={active.churchSlug} onChange={(event) => update("churchSlug", event.target.value)}><option value="">Select a church</option>{churchOptions.map((church) => <option value={church.slug} key={church.slug}>{church.name}</option>)}</select></label>}
              {activeIsEditorial && <><label className="desk-upload">Feature image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])} /><span>{uploading ? "Uploading…" : "Choose JPG, PNG, or WebP"}</span></label><label>Or paste an image URL<input value={active.image} placeholder="https://…" onChange={(event) => update("image", event.target.value)} /></label>{active.image && <Image className="desk-image-thumb" unoptimized src={active.image} alt="Selected feature image preview" width={320} height={200} />}<label>Image description<input value={active.imageAlt} placeholder="Describe the image for people who cannot see it" onChange={(event) => update("imageAlt", event.target.value)} /></label></>}
              <div className="desk-status-panel"><span>Current status</span><strong>{active.status === "review" ? "For review" : active.status}</strong><small>Revision {active.revision || 1}</small></div>
              {active.id && <button className="desk-delete" onClick={() => void remove(active)}>Delete this {activeIsEditorial ? "article" : "record"}</button>}
            </aside>
          </div>}
          {active.status === "published" && activeIsEditorial && <SocialAssetKit document={active} />}
        </>}
      </main>
    </div>
  );
}
