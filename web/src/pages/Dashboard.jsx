import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import TaskModal from "../components/TaskModal.jsx";
import { formatDate, formatFullDate, subjectLabel, statusLabel } from "../utils.js";

const statMeta = [
  { icon: "green", glyph: "\u25A4" },
  { icon: "orange", glyph: "\u25F7" },
  { icon: "blue", glyph: "\u2713" },
  { icon: "purple", glyph: "\u2197" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [today, setToday] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const load = useCallback(async () => {
    try {
      const [data, list] = await Promise.all([
        api.get("/api/dashboard"),
        api.get("/api/assignments"),
      ]);
      setStats(data.stats || []);
      setCompletionRate(data.completionRate || 0);
      setAssignments(list.assignments || []);
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const username = user?.username || "Student";
  const recent = assignments.slice(0, 3);
  const upcoming = assignments
    .filter((item) => item.due_date >= toKey(new Date()))
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 3);

  return (
    <section className="dashboard-content">
      <div className="welcome-section">
        <div>
          <span className="welcome-label">
            {isTeacher ? "TEACHER WORKSPACE" : "STUDENT WORKSPACE"}
          </span>
          <h1>
            Welcome back, <span>{username}</span>!
          </h1>
          <p>Here's what's happening with your assignments today.</p>
        </div>

        <div className="date-display">
          <span>Today</span>
          <strong>{today}</strong>
        </div>
      </div>

      {!loading && (
        <>
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const meta = statMeta[index % statMeta.length];
              return (
                <div className="stat-card" key={stat.label}>
                  <div className="stat-header">
                    <span>{stat.label}</span>
                    <div className={`stat-icon ${meta.icon}`}>{meta.glyph}</div>
                  </div>
                  <h2>{stat.value}</h2>
                  <p className="stat-description">
                    {stat.label === "Completion Rate"
                      ? "Overall progress"
                      : stat.label === "Assignments Posted"
                        ? "Posted by you"
                        : stat.label === "Total Submissions"
                          ? "From all students"
                          : stat.label === "Pending Tasks"
                            ? "Awaiting submission"
                            : stat.label === "Submitted"
                              ? "Assignments submitted"
                              : "Assigned to you"}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="dashboard-grid">
            <section className="tasks-section">
              <div className="section-header">
                <div>
                  <h2>Recent Assignments</h2>
                  <p>Keep track of your latest tasks.</p>
                </div>
              </div>

              {recent.length === 0 ? (
                <div className="empty-state" style={{ display: "block" }}>
                  <h3>No assignments yet</h3>
                  <p>{isTeacher ? "Post your first assignment." : "Check back soon."}</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {recent.map((task) => (
                    <div className="task-card" key={task.id}>
                      <div className="task-card-top">
                        <div className="task-type">
                          {subjectLabel(task.subject).toUpperCase()}
                        </div>
                        <span
                          className={`task-status ${
                            task.my_status === "approved"
                              ? "submitted"
                              : task.my_status === "assigned"
                                ? "submitted"
                                : "pending"
                          }`}
                        >
                          {statusLabel(task.my_status)}
                        </span>
                      </div>

                      <h3>{task.title}</h3>
                      <p>{task.description || "No description provided."}</p>

                      <div className="task-card-bottom">
                        <div className="task-deadline">
                          <span>{"\u25F7"}</span>
                          Due: {formatDate(task.due_date)}
                        </div>
                        <button
                          className="task-button"
                          onClick={() => setSelected(task)}
                        >
                          View Task
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="dashboard-side">
              <div className="progress-card">
                <div className="section-header">
                  <div>
                    <h2>Your Progress</h2>
                    <p>Assignment completion</p>
                  </div>
                </div>

                <div className="progress-circle">
                  <div className="progress-inner">
                    <strong>{completionRate}%</strong>
                    <span>Completed</span>
                  </div>
                </div>
              </div>

              <div className="upcoming-card">
                <div className="section-header">
                  <div>
                    <h2>Upcoming Deadlines</h2>
                    <p>Don't miss your tasks.</p>
                  </div>
                </div>

                {upcoming.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: 12 }}>
                    No upcoming deadlines.
                  </p>
                ) : (
                  upcoming.map((task) => {
                    const due = new Date(`${task.due_date}T00:00:00`);
                    return (
                      <div className="deadline-item" key={task.id}>
                        <div className="deadline-date">
                          <strong>{due.getDate()}</strong>
                          <span>
                            {due.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4>{task.title}</h4>
                          <span>Assignment deadline</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>
          </div>
        </>
      )}

      <TaskModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title}
        description={
          selected?.description || "Assignment details will appear here."
        }
        due={selected ? formatFullDate(selected.due_date) : undefined}
        footer={
          <>
            <button className="modal-secondary" onClick={() => setSelected(null)}>
              Close
            </button>
            {!isTeacher && (
              <button
                className="modal-primary"
                onClick={() => {
                  setSelected(null);
                  navigate("/submissions");
                }}
              >
                Submit Assignment
              </button>
            )}
          </>
        }
      />
    </section>
  );
}

function toKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}