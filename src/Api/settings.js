import api from "../config/axios.config";

/**
 * System Settings Management
 */

// Obtener el estado del modo mantenimiento
const getMaintenanceMode = () => {
  return api.get("/admin/settings/maintenance-mode");
};

// Actualizar el estado del modo mantenimiento
const updateMaintenanceMode = (isActive) => {
  return api.put("/admin/settings/maintenance-mode", { isActive });
};

export const settingsApi = {
  getMaintenanceMode,
  updateMaintenanceMode,
};
