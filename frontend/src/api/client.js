import { formatApiError, getApiFieldErrors } from "@/utils/apiErrors";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(path, options = {}) {
  const requestOptions = {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  };

  if (!(options.body instanceof FormData) && !requestOptions.headers["Content-Type"]) {
    requestOptions.headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, requestOptions);
  } catch (cause) {
    console.error("[API network failure]", { path, cause });
    const error = new Error("Unable to connect to the server. Please check your connection and try again.");
    error.cause = cause;
    error.status = 0;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  let payload;
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = await response.text().catch(() => "");
    }
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const error = new Error(formatApiError(response.status, payload));
    error.status = response.status;
    error.payload = payload;
    error.fields = getApiFieldErrors(payload);
    throw error;
  }

  return payload;
}
