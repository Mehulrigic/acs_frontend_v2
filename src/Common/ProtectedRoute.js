import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = JSON.parse(localStorage.getItem("userRole"));
  const code = localStorage.getItem("code");

  if (token && user && (userRole.includes("Administrateur") || userRole.includes("Courtier") || userRole.includes("Assureur") || userRole.includes("Gestionnaire ACS"))) {
    return element;
  } else if (code !== null) {
    return element;
  } else {
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
