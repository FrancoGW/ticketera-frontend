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

// Sincronizar un pago por ID de Mercado Pago (solo admin)
const syncPayment = (paymentId) => {
  return api.post('/payment/sync-payment', { paymentId })
}

// Estadísticas del organizador (ventas, ganancias, devoluciones)
const getSellerStats = () => {
  return api.get('/payment/seller/stats')
}

// Checkout de membresía plan CBU (mensualidad)
const createMembershipCheckout = () => {
  return api.post('/payment/create-membership-checkout')
}

// GP-Coins (plan A tu medida)
const getGpCoinsBalance = () => api.get('/payment/gp-coins/balance')
const getGpCoinsPurchases = () => api.get('/payment/gp-coins/purchases')
const createGpCoinsCheckout = (quantity) => api.post('/payment/gp-coins/checkout', { quantity })

export const paymentApi = {
  createCheckout,
  createMembershipCheckout,
  getGpCoinsBalance,
  getGpCoinsPurchases,
  createGpCoinsCheckout,
  validateDiscountCode,
  previewCheckout,
  initiateMercadoPagoAuthorization,
  disconnectMercadoPago,
  getApprovedPayments,
  getSellerStats,
  syncPayment,
}