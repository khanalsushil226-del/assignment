import { createContext, useContext, useEffect, useState } from "react";
import {
  api,
  getToken,
  setToken,
  getStoredUser,
  setStoredUser,
} from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;

    api
      .get("/api/auth/me")
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        setStoredUser(currentUser);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await api.post("/api/auth/login", credentials);
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.post("/api/auth/register", payload);
    setToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setToken("");
    setStoredUser(null);
    setUser(null);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    setStoredUser(nextUser);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}