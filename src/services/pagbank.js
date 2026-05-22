import { api } from './api.js'

export const pagBankService = {
  async getPublicKey() {
    const res = await api.get('/pagbank/public-key', false)
    return (res.data ?? res).public_key
  },

  async createPixOrder(compra_id, recaptcha_token) {
    const res = await api.post('/pagbank/orders/pix', { compra_id, recaptcha_token }, false)
    return res.data ?? res
  },

  async createCreditCardOrder(payload) {
    const res = await api.post('/pagbank/orders/credit-card', payload, false)
    return res.data ?? res
  },

  async getOrderStatus(compra_id) {
    const res = await api.get(`/pagbank/orders/${compra_id}/status`, false)
    return res.data ?? res
  },

  async cancelOrder(compra_id) {
    const res = await api.post(`/pagbank/orders/${compra_id}/cancel`, {}, false)
    return res.data ?? res
  },
}
