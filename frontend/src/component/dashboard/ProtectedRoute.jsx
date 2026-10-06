import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Reads the `exp` claim (seconds since epoch) from a JWT without verifying it.
// Verification still happens on the server for every request; this only lets us
// send people with an expired token to the login page instead of a broken dashboard.
function getTokenExpiry(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json);
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

function isAuthenticated() {
  const token = localStorage.getItem("admin_token");
  if (!token) return false;

  const exp = getTokenExpiry(token);
  if (exp !== null && exp * 1000 <= Date.now()) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    return false;
  }
  return true;
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return children ? children : <Outlet />;
}
