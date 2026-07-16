export type EngagementKind = "contact" | "newsletter" | "prayer" | "giving";
export type EngagementStatus = "new" | "read" | "resolved";

export type EngagementSubmission = {
  id: string;
  kind: EngagementKind;
  name: string;
  email: string;
  interest: string;
  message: string;
  reference: string;
  sourcePath: string;
  metadata: Record<string, string | number | boolean>;
  status: EngagementStatus;
  createdAt: string;
  updatedAt: string;
};

export function rowToEngagement(row: Record<string, unknown>): EngagementSubmission {
  return {
    id: String(row.id),
    kind: String(row.kind) as EngagementKind,
    name: String(row.name || ""),
    email: String(row.email || ""),
    interest: String(row.interest || ""),
    message: String(row.message || ""),
    reference: String(row.reference || ""),
    sourcePath: String(row.source_path || ""),
    metadata: row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? row.metadata as EngagementSubmission["metadata"]
      : {},
    status: String(row.status) as EngagementStatus,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
  };
}
