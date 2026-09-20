import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function initials(name) {
  return (name || "S").charAt(0).toUpperCase();
}

const mainLinks = [
  { to: "/", icon: "\u2302", label: "Dashboard", end: true },
  { to: "/tasks", icon: "\u25A4", label: "My Tasks" },
  { to: "/submissions", icon: "\u2713", label: "Submissions" },
  { to: "/calendar", icon: "\u25F7", label: "Calendar" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const username = user?.username || "Student";
  const roleLabel = user?.role === "teacher" ? "Teacher Account" : "Student Account";

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-brand">
          <span>Assignments</span>
        </div>

        <div className="user-profile">
          <div className="user-avatar">{initials(username)}</div>
          <div>
            <h4>{username}</h4>
            <span>{roleLabel}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">MAIN MENU</p>

          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
              onClick={() => {
                if (window.innerWidth <= 900) setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          <p className="nav-label">ACCOUNT</p>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-link${isActive ? " active" : ""}`
            }
            onClick={() => {
              if (window.innerWidth <= 900) setSidebarOpen(false);
            }}
          >
            <span className="nav-icon">{"\u2699"}</span>
            Settings
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <a href="#" className="logout-link" onClick={handleLogout}>
            <span className="nav-icon">{"\u21AA"}</span>
            Logout
          </a>
        </div>
      </aside>

      <div
        className={`sidebar-overlay${sidebarOpen ? " show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {"\u2630"}
          </button>

          <div className="topbar-title">
            <h2>{user?.role === "teacher" ? "Teacher" : "Student"} Workspace</h2>
            <p>Manage your academic activities</p>
          </div>

          <div className="topbar-right">
            <button className="notification-button" type="button" title="Notifications">
              {"\u2667"}
              <span className="notification-dot" />
            </button>

            <div className="topbar-user">
              <div className="user-avatar small">{initials(username)}</div>
              <div>
                <strong>{username}</strong>
                <span>{user?.role === "teacher" ? "Teacher" : "Student"}</span>
              </div>
            </div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}