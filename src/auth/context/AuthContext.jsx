import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


const AuthContext = createContext(null);

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
});

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedAuth = useRef(false);

  const checkAuth = async (skipIfUserExists = false) => {
    // Si ya hay un usuario y se pide saltar, no verificar
    if (skipIfUserExists && user) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Configure axios to use the token for this request
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get("/auth/check-status");
      // Normalize roles: backend returns 'rol' (string), frontend expects 'roles' (array)
      const userData = response.data;
      // Si el backend devuelve un token nuevo, persistirlo para mantener el cliente sincronizado
      if (userData?.token) {
        localStorage.setItem("token", userData.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
      }
      if (userData && !userData.roles) {
        userData.roles = userData.rol ? [userData.rol] : [];
      }
      // Normalizar roles a minúsculas para evitar mismatches (BUYER vs buyer, etc.)
      if (userData?.roles && Array.isArray(userData.roles)) {
        userData.roles = userData.roles.map((r) => String(r).toLowerCase());
      }
      if (userData?.rol) {
        userData.rol = String(userData.rol).toLowerCase();
      }
      setUser(userData);
    } catch (error) {
      // Limpiar si es un error de autenticación (401) o si no hay respuesta
      if (error?.response?.status === 401 || !error?.response) {
        setUser(null);
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo verificar una vez al montar el componente
    // Usar ref para evitar ejecuciones múltiples
    if (hasCheckedAuth.current) {
      return;
    }

    const token = localStorage.getItem("token");
    if (token) {
      hasCheckedAuth.current = true;
      checkAuth();
    } else {
      setUser(null);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    isLoading,
    login: async (email, password) => {
      try {
        setIsLoading(true);
        const { data } = await api.post("/auth/login", { email, password });

        // Store the token in localStorage
        localStorage.setItem("token", data.token);

        // Set the token in axios defaults for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        // Normalize roles: backend returns 'rol' (string), frontend expects 'roles' (array)
        const userData = data.user || data;
        if (userData && !userData.roles) {
          userData.roles = userData.rol ? [userData.rol] : [];
        }
        
        // Establecer el usuario inmediatamente
        setUser(userData);
        setIsLoading(false);
        hasCheckedAuth.current = true; // Marcar que ya verificamos
        
        // Navegar después de establecer el usuario
        // Si es admin, redirigir al dashboard
        const userRoles = userData?.roles || (userData?.rol ? [userData.rol] : []);
        const isAdmin = userRoles.some(role => String(role).toLowerCase() === 'admin');
        
        let redirectTo = location?.state?.from?.pathname || "/";
        if (isAdmin && redirectTo === "/") {
          redirectTo = "/admin";
        }
        navigate(redirectTo);
      } catch (error) {
        setIsLoading(false);
        console.error("❌ Login failed:", error);
        throw error;
      }
    },
    logout: async () => {
      try {
        // Limpiar inmediatamente el estado local
        localStorage.removeItem("token");
        setUser(null);
        setIsLoading(false);
        hasCheckedAuth.current = false; // Resetear el flag
        
        // Limpiar el header de Authorization en axios
        delete api.defaults.headers.common["Authorization"];
        
        // Intentar hacer logout en el servidor (pero no bloquear si falla)
        try {
          await api.post("/auth/logout");
        } catch (error) {
          // Ignorar errores del servidor, ya limpiamos localmente
          console.error("❌ Logout error:", error);
        }
        
        // Navegar al login
        navigate("/login");
      } catch (error) {
        console.error("❌ Logout error:", error);
        // Asegurarse de limpiar todo incluso si hay error
        localStorage.removeItem("token");
        setUser(null);
        setIsLoading(false);
        navigate("/login");
      }
    },
    checkAuth,
  };

  // No bloquear el render mientras carga, solo mostrar un estado de carga si es necesario
  // console.log("🎨 Rendering AuthProvider with children");
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
