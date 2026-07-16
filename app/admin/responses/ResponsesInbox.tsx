"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EngagementStatus, EngagementSubmission } from "../../lib/engagement";

const kindLabels = { contact: "Contact", newsletter: "Prayer updates", prayer: "Prayer response", giving: "Giving response" } as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(new Date(value));
}

export default function ResponsesInbox() {
  const [submissions, setSubmissions] = useState<EngagementSubmission[]>([]);
  const [filter, setFilter] = useState<EngagementSubmission["kind"] | "all">("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading responses…");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/engagement", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Responses could not be loaded.");
      setSubmissions(result.submissions);
      setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Responses could not be loaded."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  const visible = useMemo(() => filter === "all" ? submissions : submissions.filter((item) => item.kind === filter), [filter, submissions]);
  const newCount = submissions.filter((item) => item.status === "new").length;

  async function updateStatus(id: string, status: EngagementStatus) {
    const response = await fetch("/api/admin/engagement", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, status }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(result.error || "The response could not be updated."); return; }
    setSubmissions((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    setMessage("Response updated");
  }

  return (
    <div className="responses-inbox">
      <header><div><p className="desk-eyebrow">Supporter responses</p><h1>Prayer, giving, and contact inbox</h1><p>{newCount} new {newCount === 1 ? "response" : "responses"}</p></div><a className="button button-outline" href="/admin">Return to Content Desk</a></header>
      <nav aria-label="Response filters"><button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>All</button>{Object.entries(kindLabels).map(([kind, label]) => <button className={filter === kind ? "is-active" : ""} onClick={() => setFilter(kind as EngagementSubmission["kind"])} key={kind}>{label}</button>)}</nav>
      {message && <p className="responses-message" role="status">{message}</p>}
      {loading ? <div className="desk-zero"><h3>Opening the inbox…</h3></div> : visible.length ? <div className="responses-list">{visible.map((item) => <article className={`response-card status-${item.status}`} key={item.id}>
        <div className="response-card-top"><span>{kindLabels[item.kind]}</span><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></div>
        <h2>{item.name || item.email}</h2><a href={`mailto:${item.email}`}>{item.email}</a>
        {item.interest && <p><strong>Regarding:</strong> {item.interest}</p>}
        {item.reference && <p><strong>Reference:</strong> {item.reference}</p>}
        {item.message && <p className="response-message">{item.message}</p>}
        {item.sourcePath && <small>Submitted from {item.sourcePath}</small>}
        <div className="response-actions"><label>Status<select value={item.status} onChange={(event) => void updateStatus(item.id, event.target.value as EngagementStatus)}><option value="new">New</option><option value="read">Read</option><option value="resolved">Resolved</option></select></label><a className="button button-small" href={`mailto:${item.email}`}>Reply by email</a></div>
      </article>)}</div> : <div className="desk-zero"><h3>No responses in this view.</h3><p>New public form submissions will appear here.</p></div>}
    </div>
  );
}
