export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullDate(dateString) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function subjectKey(subject) {
  const value = (subject || "").toString().toLowerCase();
  if (value.includes("python")) return "python";
  if (value.includes("database") || value.includes("sql")) return "database";
  if (value.includes("web") || value.includes("html")) return "web";
  if (value.includes("project")) return "project";
  return "other";
}

export function subjectLabel(subject) {
  const key = subjectKey(subject);
  const labels = {
    python: "Python",
    database: "Database",
    web: "Web Development",
    project: "Project",
    other: "General",
  };
  return labels[key] || "General";
}

export function statusLabel(status) {
  const labels = {
    pending: "Pending",
    submitted: "Submitted",
    assigned: "Assigned",
    review: "Under Review",
    approved: "Approved",
    revision: "Needs Revision",
  };
  return labels[status] || status || "Pending";
}