import api from "../config/axios.config";

const createQr = (eventRef, ticketRef, userEmail) => {
  return api.post("/qr", { eventRef, ticketRef, userEmail });
};

const validateQr = (qrId, token) => {
  return api.get(`/qr/validate/${qrId}?token=${token}`);
};

const getQrInfo = (qrId) => {
  return api.get(`/qr/get/${qrId}`);
};

const validateValidator = (token) => {
  // Este endpoint es público (NO requiere autenticación)
  // Necesitamos hacer la petición sin el header de Authorization
  return api.get(`/qr/validate-token?token=${token}`, {
    headers: {
      deleteAuthorization: true // Flag para que el interceptor elimine el Authorization header
    }
  });
};

const generateValidatorUrl = () => {
  return api.get(`/qr/generate-validator`);
};

const getScannerUrl = () => {
  return api.get("/qr/validator-url");
};

export const qrApi = {
  createQr,
  validateQr,
  getQrInfo,
  validateValidator,
  generateValidatorUrl,
  getScannerUrl,
};
