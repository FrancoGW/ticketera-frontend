import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Center, Spinner } from "@chakra-ui/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Esperar a que termine de cargar antes de decidir
  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="primary"
          size="xl"
        />
      </Center>
    );
  }

  // Si no hay usuario después de cargar, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle both 'rol' (string) from backend and 'roles' (array) format
  const userRolesRaw = user.roles || (user.rol ? [user.rol] : []);
  const userRoles = userRolesRaw.map((r: any) => String(r).toLowerCase());
  const requiredRoles = (roles || []).map((r) => String(r).toLowerCase());
  
  if (requiredRoles.length > 0 && !requiredRoles.some((role) => userRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
