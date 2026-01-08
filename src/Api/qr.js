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
  return api.get(`/qr/validate-token?token=${token}`);
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
