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

// Contenido del banner principal (público)
const getLandingContent = () => {
  return api.get("/admin/settings/landing-content");
};

// Actualizar contenido del banner (admin)
const updateLandingContent = (data) => {
  return api.put("/admin/settings/landing-content", data);
};

export const settingsApi = {
  getMaintenanceMode,
  updateMaintenanceMode,
  getLandingContent,
  updateLandingContent,
};
