import api from "../config/axios.config";

/**
 * Email Templates Management
 */

// Obtener todos los templates de email
const getEmailTemplates = () => {
  return api.get("/admin/email-templates");
};

// Obtener un template específico por tipo
const getEmailTemplate = (type) => {
  return api.get(`/admin/email-templates/${type}`);
};

// Actualizar un template de email
const updateEmailTemplate = (type, templateData) => {
  return api.put(`/admin/email-templates/${type}`, templateData);
};

// Obtener preview de un template
const previewEmailTemplate = (type, data) => {
  return api.post(`/admin/email-templates/${type}/preview`, data);
};

// Enviar email de prueba
const testEmailTemplate = (type, email) => {
  return api.post(`/admin/email-templates/${type}/test`, { email });
};

export const emailApi = {
  getEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  previewEmailTemplate,
  testEmailTemplate,
};
