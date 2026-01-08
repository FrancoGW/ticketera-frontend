import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  // console.log("🛡️ ProtectedRoute Check");
  // console.log("🛡️ Current Path:", location.pathname);
  // console.log("🛡️ User State:", user);
  // console.log("🛡️ Required Roles:", roles);

  if (!user) {
    // console.log("🚫 No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle both 'rol' (string) from backend and 'roles' (array) format
  const userRoles = user.roles || (user.rol ? [user.rol] : []);
  
  if (roles && roles.length > 0 && !roles.some((role) => userRoles.includes(role))) {
    // console.log("🚫 User lacks required roles");
    return <Navigate to="/" replace />;
  }

  // console.log("✅ Access granted to protected route");
  return <>{children}</>;
};
