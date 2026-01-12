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

// OAuth Authorization para Mercado Pago (Split de Pagos)
const initiateMercadoPagoAuthorization = () => {
  return api.get('/payment/mercadopago/authorize')
}

const disconnectMercadoPago = () => {
  return api.post('/payment/mercadopago/disconnect')
}

export const paymentApi = {
  createCheckout,
  validateDiscountCode,
  initiateMercadoPagoAuthorization,
  disconnectMercadoPago
}