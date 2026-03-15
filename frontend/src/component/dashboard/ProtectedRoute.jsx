import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function isAuthenticated() {
  return Boolean(localStorage.getItem("admin_token"));
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return children ? children : <Outlet />;
}
