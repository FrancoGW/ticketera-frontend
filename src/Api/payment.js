import api from "../config/axios.config"

const createCheckout = (data) => {
  const { ticketsToBuy, description, selectedDate, discountCode, discountAmount } = data
  return api.post('/payment/create-checkout', { 
    ticketsToBuy, 
    description, 
    selectedDate,
    discountCode,
    discountAmount
  })
}

const validateDiscountCode = (discountCode) => {
  return api.post('/payment/validate-discount-code', { discountCode })
}

// Preview del checkout para mostrar total y cargo por servicio antes de crear el checkout
const previewCheckout = (data) => {
  const { ticketsToBuy, description, selectedDate, discountCode, discountAmount } = data
  return api.post('/payment/preview-checkout', { 
    ticketsToBuy, 
    description, 
    selectedDate,
    discountCode,
    discountAmount
  })
}

// OAuth Authorization para Mercado Pago (Split de Pagos)
const initiateMercadoPagoAuthorization = () => {
  return api.get('/payment/mercadopago/authorize')
}

const disconnectMercadoPago = () => {
  return api.post('/payment/mercadopago/disconnect')
}

// Obtener todos los payments aprobados (para métricas)
const getApprovedPayments = () => {
  return api.get('/payment/admin/approved')
}

export const paymentApi = {
  createCheckout,
  validateDiscountCode,
  previewCheckout,
  initiateMercadoPagoAuthorization,
  disconnectMercadoPago,
  getApprovedPayments
}