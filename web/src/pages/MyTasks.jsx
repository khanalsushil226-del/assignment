import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import TaskModal from "../components/TaskModal.jsx";
import { formatFullDate, subjectLabel, statusLabel } from "../utils.js";

const initialForm = { title: "", subject: "", description: "", due_date: "" };

export default function MyTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isTeacher = user?.role === "teacher";

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const [viewing, setViewing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState(null);

  async function load() {
    try {
      const data = await api.get("/api/assignments");
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return assignments.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "submitted"
          ? task.my_status === "approved"
          : task.my_status === statusFilter);
      const matchesSubject =
        subjectFilter === "all" ||
        subjectLabel(task.subject).toLowerCase() === subjectFilter;
      return matchesSearch && matchesStatus && matchesSubject;
    });
  }, [assignments, search, statusFilter, subjectFilter]);

  async function handleAddTask(event) {
    event.preventDefault();
    setMessage(null);

    try {
      await api.post("/api/assignments", form);
      setMessage({ text: "Assignment created successfully", color: "green" });
      setForm(initialForm);
      setAddOpen(false);
      load();
    } catch (error) {
      setMessage({ text: error.message, color: "red" });
    }
  }

  async function handleQuestion(event) {
    event.preventDefault();

    if (!question.trim()) return;

    try {
      await api.post("/api/questions", { content: question.trim() });
      setQuestion("");
      setQuestionOpen(false);
    } catch (error) {
      setMessage({ text: error.message, color: "red" });
    }
  }

  return (
    <section className="tasks-content">
      <div className="page-heading">
        <div>
          <h1>My Tasks</h1>
          <p>View and manage your assignments.</p>
        </div>

        <div className="role-actions">
          {isTeacher ? (
            <button
              id="addTaskButton"
              className="primary-button"
              onClick={() => setAddOpen(true)}
            >
              + Add Task
            </button>
          ) : (
            <button
              id="raiseQuestionButton"
              className="secondary-button"
              onClick={() => setQuestionOpen(true)}
            >
              ? Raise a Question
            </button>
          )}

          <div className="task-summary">
            <strong>{filtered.length}</strong>
            <span>Total Tasks</span>
          </div>
        </div>
      </div>

      <div className="task-controls">
        <div className="search-box">
          <span>{"\u2315"}</span>
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
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

      {message && (
        <div style={{ color: message.color, marginBottom: 14, fontSize: 13 }}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="empty-state" style={{ display: "block" }}>
          <h3>Loading tasks...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ display: "block" }}>
          <h3>No assignments found</h3>
          <p>Try changing your search or filters.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filtered.map((task) => (
            <div className="task-item" key={task.id}>
              <div className="task-item-header">
                <span className="task-type">
                  {subjectLabel(task.subject).toUpperCase()}
                </span>
                <span
                  className={`task-status ${
                    task.my_status === "approved" ? "submitted" : "pending"
                  }`}
                >
                  {statusLabel(task.my_status)}
                </span>
              </div>

              <h3>{task.title}</h3>
              <p>{task.description || "No description provided."}</p>

              <div className="task-item-footer">
                <span>
                  {"\u25F7"} Due: {formatFullDate(task.due_date)}
                </span>
                <button className="view-task" onClick={() => setViewing(task)}>
                  View Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskModal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        description={
          viewing?.description || "Assignment details will appear here."
        }
        due={viewing ? formatFullDate(viewing.due_date) : undefined}
        footer={
          <>
            <button className="modal-secondary" onClick={() => setViewing(null)}>
              Close
            </button>
            {!isTeacher && (
              <button
                className="modal-primary"
                onClick={() => {
                  setViewing(null);
                  navigate("/submissions");
                }}
              >
                Submit Assignment
              </button>
            )}
          </>
        }
      />

      <TaskModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Task"
        label="POST ASSIGNMENT"
        description="Create a new assignment for your students."
        footer={
          <>
            <button className="modal-secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button className="modal-primary" type="submit" form="addTaskForm">
              Create Assignment
            </button>
          </>
        }
      >
        <form id="addTaskForm" onSubmit={handleAddTask} style={{ marginTop: 16 }}>
          <div className="form-group">
            <label htmlFor="addTitle">Title</label>
            <input
              id="addTitle"
              type="text"
              placeholder="Assignment title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="addSubject">Subject</label>
            <select
              id="addSubject"
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
              required
            >
              <option value="">Select subject</option>
              <option value="Python">Python</option>
              <option value="Database">Database</option>
              <option value="Web Development">Web Development</option>
              <option value="Project">Project</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="addDue">Due Date</label>
            <input
              id="addDue"
              type="date"
              value={form.due_date}
              onChange={(event) => setForm({ ...form, due_date: event.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="addDescription">Description</label>
            <textarea
              id="addDescription"
              rows="3"
              placeholder="Describe the assignment..."
              style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 8, fontFamily: "inherit" }}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
        </form>
      </TaskModal>

      <TaskModal
        open={questionOpen}
        onClose={() => setQuestionOpen(false)}
        title="Raise a Question"
        label="ASK YOUR TEACHER"
        description="Have a question about an assignment? Ask it here."
        footer={
          <>
            <button className="modal-secondary" onClick={() => setQuestionOpen(false)}>
              Cancel
            </button>
            <button className="modal-primary" type="submit" form="questionForm">
              Submit Question
            </button>
          </>
        }
      >
        <form id="questionForm" onSubmit={handleQuestion} style={{ marginTop: 16 }}>
          <div className="form-group">
            <textarea
              rows="4"
              placeholder="Type your question..."
              style={{ width: "100%", padding: 12, border: "1px solid var(--border)", borderRadius: 8, fontFamily: "inherit", resize: "vertical" }}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              required
            />
          </div>
        </form>
      </TaskModal>
    </section>
  );
}