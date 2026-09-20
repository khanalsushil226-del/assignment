import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  function showError(text) {
    setMessage({ text, color: "red" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    if (!role || !username.trim() || !password) {
      showError("Please fill in all fields.");
      return;
    }

    try {
      const user = await login({ username: username.trim(), password });

      if (user.role !== role) {
        showError("The selected role does not match your account.");
        return;
      }

      setMessage({ text: "Login successful", color: "green" });
      navigate("/");
    } catch (error) {
      showError(error.message || "Unable to connect to the server.");
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-visual">
        <div className="brand">
          <span>ASSIGNMENTS</span>
        </div>

        <div className="visual-content">
          <span className="badge">SMART LEARNING PLATFORM</span>
          <h1>
            Learn. Submit.
            <br />
            <span>Achieve.</span>
          </h1>
          <p>
            Manage your academic tasks, submit assignments, and stay connected
            with your teachers in one place.
          </p>
        </div>

        <div className="visual-footer">
          <span>Built for students and teachers</span>
          <span>© 2026 Assignments</span>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <div className="mobile-brand">
            <div className="brand-icon">T</div>
            <span>ASSIGNMENTS</span>
          </div>

          <div className="form-header">
            <span className="form-label">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="role">Login as</label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                required
              >
                <option value="">Select your role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button
              type="button"
              id="showPassword"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Sign In
              <span>{"\u2192"}</span>
            </button>
          </form>

          {message && (
            <div id="loginMessage" style={{ color: message.color }}>
              {message.text}
            </div>
          )}

          <p className="register-text">
            Don't have an account?
            <Link to="/register">Create account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}