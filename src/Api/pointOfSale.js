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

const getMyPdvAccess = () => {
  return api.get("/points-of-sale/my-access");
};

const addPdvAccess = (pdvId, email, options = {}) => {
  return api.post(`/points-of-sale/${pdvId}/access`, {
    email,
    sendInvitation: options.sendInvitation !== false,
    sendPassword: options.sendPassword === true,
    customPassword: options.customPassword || undefined,
  });
};

const removePdvAccess = (pdvId, email) => {
  return api.delete(`/points-of-sale/${pdvId}/access/${encodeURIComponent(email)}`);
};

const pointOfSaleApi = {
  getPointsOfSale,
  getMyPdvAccess,
  createPointOfSale,
  updatePointOfSale,
  deletePointOfSale,
  getPointOfSalePanel,
  addPdvAccess,
  removePdvAccess,
};

export default pointOfSaleApi;
