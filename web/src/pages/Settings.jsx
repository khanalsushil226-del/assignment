import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Settings() {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileMessage, setProfileMessage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState(null);

  const [reminders, setReminders] = useState(
    localStorage.getItem("assignmentReminders") !== "false"
  );
  const [updates, setUpdates] = useState(
    localStorage.getItem("submissionUpdates") !== "false"
  );
  const [compact, setCompact] = useState(
    localStorage.getItem("compactView") === "true"
  );

  useEffect(() => {
    document.body.classList.toggle("compact-mode", compact);
    return () => document.body.classList.remove("compact-mode");
  }, [compact]);

  async function handleProfile(event) {
    event.preventDefault();
    setProfileMessage(null);

    if (!username.trim()) {
      setProfileMessage({ text: "Username cannot be empty.", color: "red" });
      return;
    }

    try {
      const data = await api.patch("/api/profile", {
        username: username.trim(),
        email: email ?? undefined,
      });
      updateUser(data.user);
      setProfileMessage({ text: "Profile updated successfully.", color: "var(--primary)" });
    } catch (error) {
      setProfileMessage({ text: error.message, color: "red" });
    }
  }

  async function handlePassword(event) {
    event.preventDefault();
    setSecurityMessage(null);

    try {
      const data = await api.patch("/api/profile/password", {
        currentPassword,
        newPassword,
      });
      setSecurityMessage({ text: data.message, color: "var(--primary)" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setSecurityMessage({ text: error.message, color: "red" });
    }
  }

  const initial = (user?.username || "S").charAt(0).toUpperCase();
  const roleLabel = user?.role === "teacher" ? "Teacher Account" : "Student Account";

  return (
    <section className="settings-page">
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your account and application preferences.</p>
        </div>
      </div>

      <div className="settings-layout">
        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Profile Information</h2>
            <p>View and update your basic account information.</p>
          </div>

          <form id="profileForm" onSubmit={handleProfile}>
            <div className="profile-preview">
              <div className="large-avatar">{initial}</div>
              <div>
                <h3>{username || "Student"}</h3>
                <p>{roleLabel}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="profileUsername">Username</label>
                <input
                  type="text"
                  id="profileUsername"
                  placeholder="Enter username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profileEmail">Email Address</label>
                <input
                  type="email"
                  id="profileEmail"
                  placeholder="Enter email"
                  value={email || ""}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              Save Profile
            </button>

            {profileMessage && (
              <p className="form-message" style={{ color: profileMessage.color }}>
                {profileMessage.text}
              </p>
            )}
          </form>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Notifications</h2>
            <p>Control how you receive assignment updates.</p>
          </div>

          <div className="setting-option">
            <div>
              <h3>Assignment Reminders</h3>
              <p>Receive reminders about upcoming deadlines.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={reminders}
                onChange={(event) => {
                  setReminders(event.target.checked);
                  localStorage.setItem("assignmentReminders", event.target.checked);
                }}
              />
              <span className="slider" />
            </label>
          </div>

          <div className="setting-option">
            <div>
              <h3>Submission Updates</h3>
              <p>Get notified when submission status changes.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={updates}
                onChange={(event) => {
                  setUpdates(event.target.checked);
                  localStorage.setItem("submissionUpdates", event.target.checked);
                }}
              />
              <span className="slider" />
            </label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Appearance</h2>
            <p>Customize your application appearance.</p>
          </div>

          <div className="setting-option">
            <div>
              <h3>Compact View</h3>
              <p>Use a more compact layout for content.</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={compact}
                onChange={(event) => {
                  setCompact(event.target.checked);
                  localStorage.setItem("compactView", event.target.checked);
                }}
              />
              <span className="slider" />
            </label>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Security</h2>
            <p>Manage your account security settings.</p>
          </div>

          <form onSubmit={handlePassword}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="secondary-button">
              Change Password
            </button>

            {securityMessage && (
              <p className="form-message" style={{ color: securityMessage.color }}>
                {securityMessage.text}
              </p>
            )}
          </form>
        </section>
      </div>
    </section>
  );
}