import { formatApiError, getApiFieldErrors } from "@/utils/apiErrors";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getStoredAccessToken() {
  return localStorage.getItem("admin_access_token");
}

function setStoredSession(data) {
  if (data.access) {
    localStorage.setItem("admin_access_token", data.access);
  }
  if (data.refresh) {
    localStorage.setItem("admin_refresh_token", data.refresh);
  }
  if (data.user) {
    localStorage.setItem("admin_user", JSON.stringify(data.user));
  }
}

function clearStoredSession() {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
  localStorage.removeItem("admin_user");
}

async function request(path, options = {}) {
  const token = getStoredAccessToken();

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (cause) {
    console.error("[Admin authentication network failure]", { path, cause });
    const error = new Error("Unable to connect to the server. Please try again.");
    error.status = 0;
    error.cause = cause;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  const rawPayload = await response.text();
  let payload = rawPayload;
  if (contentType.includes("application/json")) {
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      payload = rawPayload;
    }
  }

  if (!response.ok) {
    const error = new Error(formatApiError(response.status, payload, "Unable to sign in. Please check your details."));
    error.status = response.status;
    error.payload = payload;
    error.fields = getApiFieldErrors(payload);
    throw error;
  }

  return payload;
}

export async function loginAdmin(credentials) {
  const data = await request("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  setStoredSession(data);
  return data;
}

export async function logoutAdmin() {
  try {
    await request("/api/auth/logout/", {
      method: "POST",
    });
  } finally {
    clearStoredSession();
  }
}

export async function getCurrentAdmin() {
  return request("/api/auth/me/");
}

export function isAdminAuthenticated() {
  return Boolean(getStoredAccessToken());
}

export function getStoredAdminUser() {
  const raw = localStorage.getItem("admin_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export { clearStoredSession, getStoredAccessToken };
