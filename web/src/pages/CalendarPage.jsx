import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import { formatDate, subjectLabel } from "../utils.js";

function dateKey(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

function todayKey() {
  const now = new Date();
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    api
      .get("/api/assignments")
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => {});
  }, []);

  const eventsByDate = useMemo(() => {
    const map = {};
    assignments.forEach((assignment) => {
      const key = assignment.due_date;
      if (!map[key]) map[key] = [];
      map[key].push({
        title: assignment.title,
        subject: subjectLabel(assignment.subject),
      });
    });
    return map;
  }, [assignments]);

  const monthName = current.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const tKey = todayKey();

  const upcoming = useMemo(() => {
    const today = todayKey();
    return assignments
      .filter((item) => item.due_date >= today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .map((item) => ({
        title: item.title,
        subject: subjectLabel(item.subject),
        date: item.due_date,
      }));
  }, [assignments]);

  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];

  return (
    <section className="calendar-page">
      <div className="page-heading">
        <div>
          <h1>Calendar</h1>
          <p>Track your assignment deadlines and important dates.</p>
        </div>

        <button className="today-button" onClick={() => setCurrent(new Date())}>
          Today
        </button>
      </div>

      <div className="calendar-layout">
        <section className="calendar-card">
          <div className="calendar-header">
            <button
              className="month-button"
              onClick={() => setCurrent(new Date(year, month - 1, 1))}
            >
              {"\u2039"}
            </button>
            <h2>{monthName}</h2>
            <button
              className="month-button"
              onClick={() => setCurrent(new Date(year, month + 1, 1))}
            >
              {"\u203A"}
            </button>
          </div>

          <div className="calendar-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-days">
            {cells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }

              const key = dateKey(year, month, day);
              const dayEvents = eventsByDate[key] || [];

              return (
                <div
                  key={key}
                  className={`calendar-day${key === tKey ? " today" : ""}${
                    dayEvents.length > 0 ? " has-assignment" : ""
                  }`}
                >
                  <div className="calendar-day-number">{day}</div>
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.title}
                      className="calendar-event"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="upcoming-card">
          <div className="upcoming-header">
            <h2>Upcoming Deadlines</h2>
            <span>{upcoming.length}</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="empty-upcoming" style={{ display: "block" }}>
              No upcoming deadlines.
            </div>
          ) : (
            <div className="upcoming-list">
              {upcoming.map((item) => (
                <div className="upcoming-item" key={`${item.title}-${item.date}`}>
                  <h3>{item.title}</h3>
                  <span className="upcoming-subject">{item.subject}</span>
                  <div className="upcoming-date">
                    <span>{"\u25A3"}</span>
                    <strong>{formatDate(item.date)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot assignment-dot" />
          <span>Assignment Deadline</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot today-dot" />
          <span>Today</span>
        </div>
      </div>
    </section>
  );
}