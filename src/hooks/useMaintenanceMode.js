import { useState, useEffect } from 'react';
import { settingsApi } from '../Api/settings';

export const useMaintenanceMode = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar el estado inicial desde el backend
  useEffect(() => {
    const loadMaintenanceMode = async () => {
      try {
        setIsLoading(true);
        const response = await settingsApi.getMaintenanceMode();
        // El backend debe devolver { isActive: boolean }
        const isActive = response.data?.isActive || false;
        console.log('🔧 Modo mantenimiento cargado desde backend:', isActive);
        setIsMaintenanceMode(isActive);
        setError(null);
      } catch (err) {
        console.error('Error cargando modo mantenimiento:', err);
        
        // Si el endpoint no existe (404), asumir que está desactivado
        if (err?.response?.status === 404) {
          setIsMaintenanceMode(false);
          // No mostrar error para 404, es esperado si el backend no implementó el endpoint
        } else if (err?.response?.status === 401) {
          // Si no está autenticado (401), asumir false silenciosamente
          // El endpoint debería ser público, pero si no lo es, no romper la app
          setIsMaintenanceMode(false);
          // No mostrar error ni hacer redirect (el interceptor ya lo maneja)
        } else {
          // Para otros errores, solo log en consola, no romper la app
          setIsMaintenanceMode(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMaintenanceMode();
  }, []);

  const setMaintenanceMode = async (value) => {
    try {
      // Optimistic update
      setIsMaintenanceMode(value);
      
      // Actualizar en el backend
      await settingsApi.updateMaintenanceMode(value);
      setError(null);
    } catch (err) {
      console.error('Error actualizando modo mantenimiento:', err);
      // Revertir el cambio si falla
      setIsMaintenanceMode(!value);
      setError(err?.response?.data?.message || 'Error al actualizar configuración');
      throw err; // Lanzar el error para que el componente pueda manejarlo
    }
  };

  const toggleMaintenanceMode = async () => {
    await setMaintenanceMode(!isMaintenanceMode);
  };

  return {
    isMaintenanceMode,
    isLoading,
    error,
    toggleMaintenanceMode,
    setMaintenanceMode,
  };
};
