const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;

  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: payload,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    // response had no JSON body
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  postForm: (path, form) => request(path, { method: "POST", form }),
};