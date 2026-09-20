import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";

import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/my-tasks.css";
import "./styles/submission.css";
import "./styles/calender.css";
import "./styles/settings.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);