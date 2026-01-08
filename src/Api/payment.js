import api from "../config/axios.config"

const createCheckout = (data) => {
  const { ticketsToBuy, description, selectedDate } = data
  return api.post('/payment/create-checkout', { 
    ticketsToBuy, 
    description, 
    selectedDate
  })
}

export const paymentApi = {
  createCheckout
}