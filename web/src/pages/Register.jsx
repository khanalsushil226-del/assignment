import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);

  function showError(text) {
    setMessage({ text, color: "red" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    if (!role || !username.trim() || !email.trim() || !password || !confirmPassword) {
      showError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      showError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      await register({
        role,
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setMessage({ text: "Registration successful. Redirecting...", color: "green" });
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      showError(error.message || "Unable to connect to the server.");
    }
  }

  return (
    <main className="auth-container">
      <section className="auth-visual">
        <div className="brand">
          <span>Assignments</span>
        </div>

        <div className="visual-content">
          <span className="badge">SMART LEARNING PLATFORM</span>
          <h1>
            Start your
            <br />
            <span>journey.</span>
          </h1>
          <p>
            Join your academic community, manage your assignments, and stay
            organized throughout your learning journey.
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
            <span>Assignments</span>
          </div>

          <div className="form-header">
            <span className="form-label">CREATE ACCOUNT</span>
            <h2>Join Assignments</h2>
            <p>Create your account to access your academic workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="registerRole">Register as</label>
              <select
                id="registerRole"
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
              <label htmlFor="registerUsername">Username</label>
              <input
                type="text"
                id="registerUsername"
                placeholder="Choose a username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">Email Address</label>
              <input
                type="email"
                id="registerEmail"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="registerPassword"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <button
              type="button"
              id="showRegisterPassword"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>

            <button type="submit" className="login-btn">
              Create Account
              <span>{"\u2192"}</span>
            </button>
          </form>

          {message && (
            <div id="registerMessage" style={{ color: message.color }}>
              {message.text}
            </div>
          )}

          <p className="register-text">
            Already have an account?
            <Link to="/login">Sign In</Link>
          </p>
        </div>
      </section>
    </main>
  );
}