const subscribers = new Set();
let toastSequence = 0;

export function subscribeToToastEvents(subscriber) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function showToast(message, type = "info", duration = 3000) {
  let resolvedType = type;
  let resolvedDuration = duration;

  if (type && typeof type === "object") {
    resolvedType = type.type || "info";
    resolvedDuration = type.duration ?? 3000;
  }

  const notification = {
    id: `${Date.now()}-${toastSequence++}`,
    message: String(message || ""),
    type: ["success", "error", "warning", "info"].includes(resolvedType) ? resolvedType : "info",
    duration: Number.isFinite(Number(resolvedDuration)) ? Math.max(0, Number(resolvedDuration)) : 3000,
  };

  subscribers.forEach((subscriber) => subscriber(notification));
  return notification.id;
}
