import { api } from './api.js'

function checkoutHeaders(checkoutAccessToken) {
  return { 'X-Checkout-Token': checkoutAccessToken }
}

export const pagBankService = {
  async getPublicKey() {
    const res = await api.get('/pagbank/public-key', false)
    return (res.data ?? res).public_key
  },

  async createPixOrder(compra_id, recaptcha_token, checkoutAccessToken) {
    const res = await api.post(
      '/pagbank/orders/pix',
      { compra_id, recaptcha_token },
      false,
      checkoutHeaders(checkoutAccessToken)
    )
    return res.data ?? res
  },

  async createCreditCardOrder(payload, checkoutAccessToken) {
    const res = await api.post(
      '/pagbank/orders/credit-card',
      payload,
      false,
      checkoutHeaders(checkoutAccessToken)
    )
    return res.data ?? res
  },

  async createThreeDsSession(compra_id, recaptcha_token, checkoutAccessToken) {
    const res = await api.post(
      '/pagbank/3ds/session',
      { compra_id, recaptcha_token },
      false,
      checkoutHeaders(checkoutAccessToken)
    )
    return res.data ?? res
  },

  async getOrderStatus(compra_id, checkoutAccessToken) {
    const res = await api.get(
      `/pagbank/orders/${compra_id}/status`,
      false,
      checkoutHeaders(checkoutAccessToken)
    )
    return res.data ?? res
  },

  async cancelOrder(compra_id, checkoutAccessToken) {
    const res = await api.post(
      `/pagbank/orders/${compra_id}/cancel`,
      {},
      false,
      checkoutHeaders(checkoutAccessToken)
    )
    return res.data ?? res
  },
}
