const ignoredErrorKeys = new Set(["status", "code", "traceback", "error_code"]);

function cleanMessage(value) {
  if (typeof value !== "string") return "";
  const message = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!message || /traceback|internal server error|<!doctype html/i.test(message)) return "";
  return message;
}

function collectMessages(value, field = "") {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMessages(item, field));
  }
  if (typeof value === "string") {
    const message = cleanMessage(value);
    return message ? [field ? `${field.replace(/_/g, " ")}: ${message}` : message] : [];
  }
  if (!value || typeof value !== "object") return [];

  const preferred = ["detail", "error", "message"]
    .filter((key) => value[key] !== undefined)
    .flatMap((key) => collectMessages(value[key]));
  if (preferred.length) return preferred;

  return Object.entries(value)
    .filter(([key]) => !ignoredErrorKeys.has(key))
    .flatMap(([key, nested]) => collectMessages(nested, key));
}

export function formatApiError(status, payload, fallback = "Request failed. Please try again.") {
  if (status >= 500) return "The server could not complete the request. Please try again later.";
  const messages = collectMessages(payload);
  if (messages.length) return messages.join(" ");
  return fallback;
}

export function getApiFieldErrors(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  return Object.fromEntries(
    Object.entries(payload)
      .filter(([key]) => !["detail", "error", "message", ...ignoredErrorKeys].includes(key))
      .map(([key, value]) => {
        const messages = collectMessages(value);
        return [key, messages[0] || ""];
      })
      .filter(([, message]) => Boolean(message)),
  );
}
