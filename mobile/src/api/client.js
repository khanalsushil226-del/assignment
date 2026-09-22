import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Android emulator reaches the host machine via 10.0.2.2.
// For a physical device, replace with your computer's LAN IP, e.g. http://192.168.1.5:5001
export const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5001',
  default: 'http://localhost:5001',
});

const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

export async function getToken() {
  return (await AsyncStorage.getItem(TOKEN_KEY)) || '';
}

export async function setToken(token) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export async function getStoredUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user) {
  if (user) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(USER_KEY);
  }
}

export function formatDate(dateString) {
  if (!dateString) {return '';}
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {return String(dateString);}
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatFullDate(dateString) {
  if (!dateString) {return '';}
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) {return String(dateString);}
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function subjectLabel(subject) {
  const value = String(subject || '').toLowerCase();
  if (value.includes('python')) {return 'Python';}
  if (value.includes('database') || value.includes('sql')) {return 'Database';}
  if (value.includes('web') || value.includes('html')) {return 'Web Development';}
  if (value.includes('project')) {return 'Project';}
  return 'General';
}

export function statusLabel(status) {
  const labels = {
    pending: 'Pending',
    submitted: 'Submitted',
    assigned: 'Assigned',
    review: 'Under Review',
    approved: 'Approved',
    revision: 'Needs Revision',
  };
  return labels[status] || status || 'Pending';
}

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = await getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;

  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new Error('Unable to connect to the server');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  postForm: (path, form) => request(path, { method: 'POST', form }),
};
