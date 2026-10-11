import { formatApiError, getApiFieldErrors } from "@/utils/apiErrors";
import { showToast } from "@/utils/toastNotifications";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const resourceLabels = {
  about: "About information",
  "contact-information": "Contact information",
  education: "Education",
  experience: "Experience",
  highlights: "About highlight",
  messages: "Message",
  profile: "Profile information",
  projects: "Project",
  "project-highlights": "Project highlight",
  "project-images": "Gallery image",
  "project-sections": "Case study section",
  skills: "Skill",
  "social-links": "Social link",
  technologies: "Technology",
  testimonials: "Testimonial",
};

function getResourceLabel(path) {
  const segments = path.split("?")[0].split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  const resource = adminIndex >= 0 ? segments[adminIndex + 1] : "";
  return resourceLabels[resource] || "Item";
}

function notifySuccess(path, action, options) {
  if (options?.successMessage === false) return;
  const message = typeof options?.successMessage === "string"
    ? options.successMessage
    : `${getResourceLabel(path)} ${action} successfully.`;
  showToast(message, "success");
}

function getToken() {
  return localStorage.getItem("admin_access_token");
}

async function request(path, options = {}, settings = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
  } catch (cause) {
    const message = "Unable to connect to the server. Please check your connection and try again.";
    console.error("[Admin API network failure]", { method: options.method || "GET", url: `${API_BASE_URL}${path}`, cause });
    if (!settings.suppressErrorToast) showToast(message, "error");
    const error = new Error(message);
    error.status = 0;
    error.cause = cause;
    throw error;
  }

  if (response.status === 204) {
    return null;
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
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_user");
    }
    const message = response.status === 401 || response.status === 403
      ? "Your admin session has expired or you do not have permission to perform this action."
      : formatApiError(response.status, payload, `The request could not be completed (${response.status}).`);
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    error.fields = getApiFieldErrors(payload);
    console.error("[Admin API request failed]", {
      method: options.method || "GET",
      url: `${API_BASE_URL}${path}`,
      status: response.status,
      response: payload,
    });
    if (!settings.suppressErrorToast) showToast(message, "error");
    throw error;
  }

  return payload;
}

export async function fetchDashboardOverview() {
  return request("/api/admin/dashboard/");
}

export async function fetchAdminResource(path, settings = {}) {
  return request(path, {}, settings);
}

export async function createAdminResource(path, payload, options = {}) {
  const isFormData = payload instanceof FormData;
  const result = await request(path, {
    method: "POST",
    body: isFormData ? payload : JSON.stringify(payload),
  });
  notifySuccess(path, "created", options);
  return result;
}

export async function updateAdminResource(path, payload, options = {}) {
  const isFormData = payload instanceof FormData;
  const result = await request(path, {
    method: "PATCH",
    body: isFormData ? payload : JSON.stringify(payload),
  });
  notifySuccess(path, "updated", options);
  return result;
}

export async function deleteAdminResource(path, options = {}) {
  const result = await request(path, {
    method: "DELETE",
  });
  notifySuccess(path, "deleted", options);
  return result;
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
