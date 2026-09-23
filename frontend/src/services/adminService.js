const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("admin_access_token");
}

function formatApiError(status, payload) {
  if (typeof payload === "string") {
    return `HTTP ${status}: ${payload || "Request failed."}`;
  }

  const detail = payload?.detail || payload?.error || payload?.message;
  if (detail) {
    return `HTTP ${status}: ${detail}`;
  }

  if (payload && typeof payload === "object") {
    const fieldErrors = Object.entries(payload)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(" ") : String(messages)}`)
      .join("; ");
    if (fieldErrors) return `HTTP ${status}: ${fieldErrors}`;
  }

  return `HTTP ${status}: Admin request failed.`;
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
    }
    const error = new Error(formatApiError(response.status, payload));
    error.status = response.status;
    error.payload = payload;
    error.fields = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    console.error("[Admin API request failed]", {
      method: options.method || "GET",
      url: `${API_BASE_URL}${path}`,
      status: response.status,
      response: payload,
    });
    throw error;
  }

  return payload;
}

export async function fetchDashboardOverview() {
  return request("/api/admin/dashboard/");
}

export async function fetchAdminResource(path) {
  return request(path);
}

export async function createAdminResource(path, payload) {
  const isFormData = payload instanceof FormData;
  return request(path, {
    method: "POST",
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export async function updateAdminResource(path, payload) {
  const isFormData = payload instanceof FormData;
  return request(path, {
    method: "PATCH",
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export async function deleteAdminResource(path) {
  return request(path, {
    method: "DELETE",
  });
}

export async function fetchAdminProfile() {
  return request("/api/admin/profile/");
}

export async function fetchAdminProjects() {
  return request("/api/admin/projects/");
}

export async function fetchAdminMessages() {
  return request("/api/admin/messages/");
}

export async function fetchAdminContactInformation() {
  return request("/api/admin/contact-information/");
}

export async function saveAdminContactInformation(payload, exists) {
  return exists
    ? updateAdminResource("/api/admin/contact-information/", payload)
    : createAdminResource("/api/admin/contact-information/", payload);
}

export async function fetchAdminVisitors() {
  return request("/api/admin/visitors/");
}
