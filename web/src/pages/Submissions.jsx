import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { formatDate, subjectLabel, statusLabel } from "../utils.js";

export default function Submissions() {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, review: 0, approved: 0, revision: 0 });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [submitOpen, setSubmitOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const [formState, setFormState] = useState({
    assignment_id: "",
    note: "",
    file: null,
    fileName: "No file selected",
  });

  const load = useCallback(async () => {
    try {
      const [sub, assign] = await Promise.all([
        api.get("/api/submissions"),
        api.get("/api/assignments"),
      ]);
      setSubmissions(sub.submissions || []);
      setStats(sub.stats || {});
      setAssignments(assign.assignments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return submissions.filter((row) => {
      const matchesSearch = [
        row.assignment_title,
        row.student_username,
        subjectLabel(row.subject),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved"
          ? row.status === "approved"
          : statusFilter === "revision"
            ? row.status === "revision"
            : row.status === "review");
      const matchesSubject =
        subjectFilter === "all" ||
        subjectLabel(row.subject).toLowerCase() === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [submissions, search, statusFilter, subjectFilter]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setBusy(true);

    if (!formState.assignment_id || !formState.file) {
      setMessage({ text: "Please select an assignment and upload a file.", color: "red" });
      setBusy(false);
      return;
    }

    const form = new FormData();
    form.append("assignment_id", formState.assignment_id);
    form.append("note", formState.note);
    form.append("file", formState.file);

    try {
      await api.postForm("/api/submissions", form);
      setMessage({ text: "Submission uploaded successfully", color: "green" });
      setSubmitOpen(false);
      setFormState({
        assignment_id: "",
        note: "",
        file: null,
        fileName: "No file selected",
      });
      load();
    } catch (error) {
      setMessage({ text: error.message, color: "red" });
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/api/submissions/${id}`, { status });
      load();
    } catch (error) {
      alert(error.message);
    }
  }

  const statCards = [
    { label: "Total Submissions", value: stats.total },
    { label: "Under Review", value: stats.review },
    { label: "Approved", value: stats.approved },
    { label: "Needs Revision", value: stats.revision },
  ];

  return (
    <section className="submission-content">
      <div className="page-heading">
        <div>
          <span className="page-label">
            {isTeacher ? "TEACHER WORKSPACE" : "STUDENT WORKSPACE"}
          </span>
          <h1>{isTeacher ? "Review Submissions" : "My Submissions"}</h1>
          <p>Review and manage submitted assignments.</p>
        </div>

        {!isTeacher && (
          <button className="primary-button" onClick={() => setSubmitOpen(true)}>
            + Submit Assignment
          </button>
        )}
      </div>

      <div className="submission-stats">
        {statCards.map((card) => (
          <div className="submission-stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </div>

      {message && (
        <div style={{ color: message.color, marginBottom: 14, fontSize: 13 }}>
          {message.text}
        </div>
      )}

      <div className="submission-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search submissions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="revision">Needs Revision</option>
        </select>

        <select
          value={subjectFilter}
          onChange={(event) => setSubjectFilter(event.target.value)}
        >
          <option value="all">All Subjects</option>
          <option value="python">Python</option>
          <option value="database">Database</option>
          <option value="web">Web Development</option>
        </select>
      </div>

      <div className="submission-table-wrapper">
        <div className="table-heading">
          <h3>Submission History</h3>
          <span>
            {filtered.length} submission{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="submission-table-container">
          <table className="submission-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Subject</th>
                {isTeacher && <th>Student</th>}
                <th>Submitted On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="assignment-name">
                      <strong>{row.assignment_title}</strong>
                      <span>{row.original_name || "File attached"}</span>
                    </div>
                  </td>
                  <td>{subjectLabel(row.subject)}</td>
                  {isTeacher && <td>{row.student_username}</td>}
                  <td>{formatDate(row.created_at)}</td>
                  <td>
                    <span className={`status-badge ${row.status}`}>
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        className="view-button"
                        onClick={() => setDetails(row)}
                      >
                        View
                      </button>
                      {isTeacher && (
                        <>
                          <button
                            className="view-button"
                            style={{ background: "#e8f7ed", color: "#056c24" }}
                            onClick={() => updateStatus(row.id, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="view-button"
                            style={{ background: "#fde9e9", color: "#b42323" }}
                            onClick={() => updateStatus(row.id, "revision")}
                          >
                            Revision
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="empty-state" style={{ display: "block" }}>
            <h3>No submissions found</h3>
            <p>Try changing your search or filter options.</p>
          </div>
        )}
      </div>

      {submitOpen && (
        <div className="submission-modal show" onClick={(event) => event.target === event.currentTarget && setSubmitOpen(false)}>
          <div className="submission-modal-content">
            <div className="modal-header">
              <div>
                <span className="page-label">NEW SUBMISSION</span>
                <h2>Submit Assignment</h2>
              </div>
              <button className="modal-close" onClick={() => setSubmitOpen(false)}>
                {"\u00D7"}
              </button>
            </div>

            <form id="submissionForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="assignmentName">Assignment</label>
                <select
                  id="assignmentName"
                  value={formState.assignment_id}
                  onChange={(event) =>
                    setFormState({ ...formState, assignment_id: event.target.value })
                  }
                  required
                >
                  <option value="">Select assignment</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="submissionNote">Submission Note</label>
                <textarea
                  id="submissionNote"
                  placeholder="Write a short note about your submission..."
                  rows="4"
                  value={formState.note}
                  onChange={(event) =>
                    setFormState({ ...formState, note: event.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="submissionFile">Upload File</label>
                <input
                  type="file"
                  id="submissionFile"
                  required
                  onChange={(event) =>
                    setFormState({
                      ...formState,
                      file: event.target.files[0] || null,
                      fileName: event.target.files[0]?.name || "No file selected",
                    })
                  }
                />
                <small id="selectedFile">{formState.fileName}</small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setSubmitOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={busy}>
                  {busy ? "Uploading..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {details && (
        <div className="details-modal show" onClick={(event) => event.target === event.currentTarget && setDetails(null)}>
          <div className="details-modal-content">
            <div className="modal-header">
              <div>
                <span className="page-label">SUBMISSION DETAILS</span>
                <h2>{details.assignment_title}</h2>
              </div>
              <button className="modal-close" onClick={() => setDetails(null)}>
                {"\u00D7"}
              </button>
            </div>

            <div className="details-content">
              <p>
                <strong>Submission Status:</strong> {statusLabel(details.status)}
              </p>
              {isTeacher && (
                <p>
                  <strong>Student:</strong> {details.student_username}
                </p>
              )}
              <p>
                <strong>Submitted On:</strong> {formatDate(details.created_at)}
              </p>
              <p>
                <strong>File:</strong> {details.original_name || "None"}
              </p>
              <p>
                <strong>Note:</strong> {details.note || "No note provided."}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}