import { Navigate, Outlet } from "react-router-dom";
import { isAdminAuthenticated } from "@/services/authService";

export function ProtectedAdminRoute() {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
