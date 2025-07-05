import React from "react";
import { Navigate } from "react-router-dom";

function isAuthenticated() {
  // Check for admin token in localStorage
  return Boolean(localStorage.getItem("admin_token"));
}

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/dashboard/login" replace />;
  }

  return children;
}
