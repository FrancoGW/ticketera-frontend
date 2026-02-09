import api from "../config/axios.config";

export const getBanks = () => api.get("/cbu/banks");

export const getCbuInfoForEvent = (eventId) => api.get(`/cbu/event/${eventId}/payment-info`);

export const uploadProofImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/cbu/upload-proof", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const createProof = (data) => api.post("/cbu/proof", data);

export const getProofs = (eventId) =>
  api.get(eventId ? `/cbu/proofs?eventId=${eventId}` : "/cbu/proofs");

export const getProofsForEvent = (eventId) => api.get(`/cbu/proofs/event/${eventId}`);

export const approveProof = (proofId) => api.put(`/cbu/proofs/${proofId}/approve`);

export const rejectProof = (proofId, reason) =>
  api.put(`/cbu/proofs/${proofId}/reject`, { reason });

const cbuApi = {
  getBanks,
  getCbuInfoForEvent,
  uploadProofImage,
  createProof,
  getProofs,
  getProofsForEvent,
  approveProof,
  rejectProof,
};

export default cbuApi;
