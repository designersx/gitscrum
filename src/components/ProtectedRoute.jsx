import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If token doesn't exist, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — allow access
  return children;
};

export default ProtectedRoute;
