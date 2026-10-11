import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import "./TimerMessage.css";

const iconsByType = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

const DEFAULT_DURATION = 3000;
const EXIT_DURATION = 260;

export function TimerMessage({ id, message, type = "info", duration = DEFAULT_DURATION, onDismiss }) {
  const [isExiting, setIsExiting] = useState(false);
  const dismissRef = useRef(onDismiss);
  const timersRef = useRef([]);
  const safeDuration = Number.isFinite(Number(duration)) ? Math.max(0, Number(duration)) : DEFAULT_DURATION;
  const exitDuration = Math.min(EXIT_DURATION, safeDuration);
  const Icon = iconsByType[type] || iconsByType.info;

  dismissRef.current = onDismiss;

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setIsExiting(true), Math.max(0, safeDuration - exitDuration));
    const dismissTimer = window.setTimeout(() => dismissRef.current?.(id), safeDuration);
    timersRef.current = [exitTimer, dismissTimer];

    return () => timersRef.current.forEach(window.clearTimeout);
  }, [id, safeDuration, exitDuration]);

  function dismiss() {
    timersRef.current.forEach(window.clearTimeout);
    setIsExiting(true);
    const timer = window.setTimeout(() => dismissRef.current?.(id), exitDuration);
    timersRef.current = [timer];
  }

  return (
    <div
      className={`timer-message timer-message--${type} ${isExiting ? "timer-message--exiting" : ""}`}
      style={{ "--toast-duration": `${safeDuration}ms`, "--toast-exit-duration": `${exitDuration}ms` }}
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <Icon className="timer-message__icon" aria-hidden="true" />
      <p className="timer-message__text">{message}</p>
      <button className="timer-message__close" type="button" onClick={dismiss} aria-label="Dismiss notification">
        <X size={17} aria-hidden="true" />
      </button>
      <span className="timer-message__progress" aria-hidden="true" />
    </div>
  );
}
