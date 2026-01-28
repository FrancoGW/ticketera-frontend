import api from "../config/axios.config";

const createTicket = (data) => {
  // Asegurémonos de que las fechas se envían como el backend espera
  const ticketData = {
    title: data.title,
    price: parseFloat(data.price),
    ticketType: data.ticketType,
    discountPercentage: parseFloat(data.discountPercentage),
    dates: data.dates,
    eventRef: data.eventRef,
    // Convertimos explícitamente las fechas
    saleStartDate: new Date(data.saleStartDate).toISOString(),
    saleEndDate: new Date(data.saleEndDate).toISOString(),
    visibleFrom: new Date(data.visibleFrom).toISOString(),
    soldCount: parseInt(data.soldCount) || 0
  };

  console.log('Datos antes de enviar:', ticketData);
  
  return api.post('/tickets/', ticketData);
}

const deleteTicket = (id) => {
  return api.delete(`/tickets/${id}`);
};

const getTickets = (eventId) => {
  return api.get(`/tickets/event/${eventId}`).then((response) => response.data);
};

const updateTicket = (id, data) => {
  const { title, price, dates, maxEntries, defaultConfiguration } = data;

  return api.put(`/tickets/${id}`, {
    title,
    price,
    dates,
    maxEntries,
    defaultConfiguration,
  });
};

const getTicketsByUser = () => {
  return api.get("/tickets/user");
};

// ticketsToSend = [ { ticketId, quantity, { date, timeStart, timeEnd } } ]
const sendInvitations = (eventId, ticketsToSend, emails) => {
  return api.post("/tickets/send-invitations", {
    eventId,
    ticketsToSend,
    emails,
  });
};

const makeTransferable = (ticketId) => {
  if (!ticketId) {
    throw new Error("El ID del ticket es requerido");
  }
  return api.put(`/tickets/${ticketId}/make-transferable`);
};

const makeNonTransferable = (ticketId) => {
  if (!ticketId) {
    throw new Error("El ID del ticket es requerido");
  }
  return api.put(`/tickets/${ticketId}/make-non-transferable`);
};

const transferTicket = (ticketId, toUserEmail) => {
  if (!ticketId || !toUserEmail) {
    throw new Error("El ID del ticket y el email son requeridos");
  }
  return api.post("/tickets/transfer", {
    ticketId,
    toUserEmail,
  });
};

const checkEmailExists = (email) => {
  if (!email) {
    throw new Error("El email es requerido");
  }
  return api.post("/users/check-email", { email });
};

// Endpoints de lotes (batches)
const createBatch = (data) => {
  const { name, price, startDate, endDate, ticketRef, maxEntries } = data;
  return api.post("/tickets/batch", {
    name,
    price,
    startDate,
    endDate,
    ticketRef,
    maxEntries,
  });
};

const updateBatch = (batchId, data) => {
  const { name, price, startDate, endDate, maxEntries } = data;
  return api.put(`/tickets/batch/${batchId}`, {
    name,
    price,
    startDate,
    endDate,
    maxEntries,
  });
};

const activateBatch = (batchId) => {
  return api.put(`/tickets/batch/${batchId}/activate`);
};

const getActiveBatch = (ticketId) => {
  return api.get(`/tickets/batch/active/${ticketId}`);
};

const getBatches = (ticketId) => {
  return api.get(`/tickets/batch/${ticketId}`);
};

// Endpoints para tickets de cortesía
const generateCourtesyTicket = (data) => {
  if (!data.eventId || !data.ticketId || !data.email || !data.date) {
    throw new Error(
      "Todos los campos son requeridos para generar un ticket de cortesía"
    );
  }
  return api.post("/tickets/courtesy", {
    eventId: data.eventId,
    ticketId: data.ticketId,
    email: data.email,
    date: data.date,
    quantity: data.quantity || 1, // Cantidad de tickets a generar
    sendEmail: data.sendEmail !== undefined ? data.sendEmail : true, // Opción para enviar por email
  });
};

const getCourtesyTicketsCount = (eventId) => {
  if (!eventId) {
    throw new Error("El ID del evento es requerido");
  }
  return api.get(`/tickets/courtesy/count/${eventId}`);
};

const getCourtesyTicketsHistory = (eventId) => {
  if (!eventId) {
    throw new Error("El ID del evento es requerido");
  }
  return api.get(`/tickets/courtesy/history/${eventId}`);
};

const deactivateBatch = (batchId) => {
  if (!batchId) {
    throw new Error("El ID del lote es requerido");
  }
  return api.put(`/tickets/batch/${batchId}/deactivate`);
};
const getPdvTickets = () => {
  return api.get("/tickets/pdv");
};
const getPdvEvents = (page = 1, limit = 10) => {
  return api.get(`/events?page=${page}&limit=${limit}`);
};
const getPdvSpecialTickets = (type) => {
  return api.get(`/tickets/pdv/special?type=${type}`);
};

const sellTicket = (data) => {
  return api.post("/tickets/pdv/sell", {
    eventId: data.eventId,
    ticketId: data.ticketId,
    customerEmail: data.customerEmail,
    quantity: data.quantity,
    specialType: data.specialType, // 'student' or 'senior'
  });
};

const downloadTicket = (ticketId) => {
  return api.get(`/tickets/pdv/download/${ticketId}`, {
    responseType: "blob",
  });
};
const getTicketsByEventForUser = (eventId) => {
  return api.get(`/tickets/event/getTicketsByEventForUser/${eventId}`);
};
const ticketApi = {
  getTicketsByEventForUser,
  getPdvEvents,
  createTicket,
  deleteTicket,
  getTickets,
  updateTicket,
  getTicketsByUser,
  sendInvitations,
  makeTransferable,
  makeNonTransferable,
  transferTicket,
  checkEmailExists,
  createBatch,
  updateBatch,
  activateBatch,
  deactivateBatch,
  getActiveBatch,
  getBatches,
  generateCourtesyTicket,
  getCourtesyTicketsCount,
  getCourtesyTicketsHistory,
  getPdvTickets,
  getPdvSpecialTickets,
  sellTicket,
  downloadTicket,
};

export default ticketApi;
