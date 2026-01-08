import { createStandaloneToast } from "@chakra-ui/react";
import axios from "axios";

const { toast } = createStandaloneToast();

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");

    // Add token to headers if it exists and Authorization header is not already set
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle special case where we want to remove Authorization header
    if (config.headers.deleteAuthorization) {
      delete config.headers.deleteAuthorization;
      delete config.headers.Authorization;
    }

    return config;
  },
  function (error) {
    // Handle request error
    toast({
      title: "Error",
      description: "Error al realizar la petición",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {

    // Handle different error scenarios
    if (!error.response) {
      // Network error
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle 404 Not Found
    if (status === 404) {
      
      toast({
        title: "Error",
        description: "Recurso no encontrado",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return Promise.reject(error);
    }

    // Handle validation errors (array of errors)
    if (data.errors?.length) {
      data.errors.forEach(({ msg }) => {
        console.log(msg);
        toast({
          title: "Error de validación",
          description: msg,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      });
      return Promise.reject(error);
    }

    // Handle single error message
    if (data.message) {
      toast({
        title: "Error",
        description: data.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return Promise.reject(error);
    }

    // Handle any other error
    toast({
      title: "Error",
      description: "Ocurrió un error inesperado",
      status: "error",
      duration: 5000,
      isClosable: true,
    });

    return Promise.reject(error);
  }
);

// Helper methods
api.setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

api.getToken = () => {
  return localStorage.getItem("token");
};

api.clearToken = () => {
  localStorage.removeItem("token");
};

export default api;