import React, { createContext, useContext, useState, useEffect } from "react";
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

  const checkAuth = async () => {
    // console.log("⚡ Running checkAuth");
    // console.log("⚡ Current Path:", location.pathname);

    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Configure axios to use the token for this request
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.get("/auth/check-status");
        // console.log("✅ Auth check success:", response.data);
        // Normalize roles: backend returns 'rol' (string), frontend expects 'roles' (array)
        const userData = response.data;
        if (userData && !userData.roles) {
          userData.roles = userData.rol ? [userData.rol] : [];
        }
        setUser(userData);
      }
    } catch (error) {
      // console.log("❌ Auth check error:", error);
      setUser(null);
      localStorage.removeItem("token");
    } finally {
      // console.log("🏁 Setting loading false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // console.log("🔄 Initial auth check effect");
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    login: async (email, password) => {
      // console.log("🔑 Login attempt");
      try {
        const { data } = await api.post("/auth/login", { email, password });
        // console.log("✅ Login success:", data);

        // Store the token in localStorage
        localStorage.setItem("token", data.token);

        // Set the token in axios defaults for future requests
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

        // Normalize roles: backend returns 'rol' (string), frontend expects 'roles' (array)
        const userData = data.user || data;
        if (userData && !userData.roles) {
          userData.roles = userData.rol ? [userData.rol] : [];
        }
        setUser(userData);
        navigate(location?.state?.from?.pathname || "/");
      } catch (error) {
        console.error("❌ Login failed:", error);
        throw error;
      }
    },
    logout: async () => {
      // console.log("🚪 Logout attempt");
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("❌ Logout error:", error);
      } finally {
        // Remove token and user data
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      }
    },
    checkAuth,
  };

  if (isLoading) {
    // console.log("⌛ Still loading, returning null");
    return null;
  }

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
