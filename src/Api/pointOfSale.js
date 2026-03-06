import api from "../config/axios.config";

const getPointsOfSale = () => {
  return api.get("/points-of-sale");
};

const createPointOfSale = (data) => {
  return api.post("/points-of-sale", {
    name: data.name,
    code: data.code || undefined,
  });
};

const updatePointOfSale = (id, data) => {
  return api.put(`/points-of-sale/${id}`, {
    name: data.name,
    code: data.code,
    active: data.active,
  });
};

const deletePointOfSale = (id) => {
  return api.delete(`/points-of-sale/${id}`);
};

const getPointOfSalePanel = (pdvId) => {
  return api.get(`/points-of-sale/${pdvId}/panel`);
};

const addPdvAccess = (pdvId, email) => {
  return api.post(`/points-of-sale/${pdvId}/access`, { email });
};

const removePdvAccess = (pdvId, email) => {
  return api.delete(`/points-of-sale/${pdvId}/access/${encodeURIComponent(email)}`);
};

const pointOfSaleApi = {
  getPointsOfSale,
  createPointOfSale,
  updatePointOfSale,
  deletePointOfSale,
  getPointOfSalePanel,
  addPdvAccess,
  removePdvAccess,
};

export default pointOfSaleApi;
