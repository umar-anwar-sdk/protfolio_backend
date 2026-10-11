import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { showToast, subscribeToToastEvents } from "@/utils/toastNotifications";
import { TimerMessage } from "@/components/TimerMessage";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => subscribeToToastEvents((notification) => {
    setNotifications((current) => [...current, notification]);
  }), []);

  const dismissToast = useCallback((id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <aside className="timer-message-stack" aria-label="Notifications">
        {notifications.map((notification) => (
          <TimerMessage key={notification.id} {...notification} onDismiss={dismissToast} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}
