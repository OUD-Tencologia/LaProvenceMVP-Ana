import { api } from './api.js'

function normalizarCompra(c) {
  if (!c) return c
  return {
    ...c,
    valor_pago: Number(c.valor_pago ?? 0),
    item_id: c.catalogo_id,
    lista_id: c.listas_id,
    data_compra: c.data_compra ?? c.created_at,
  }
}

export const comprasService = {
  async getByLista(listaId) {
    const res = await api.get(`/compras/lista/${listaId}`)
    const data = res.data ?? res
    return Array.isArray(data) ? data.map(normalizarCompra) : []
  },

  async getPublicAvailabilityByLista(listaId) {
    const res = await api.get(`/compras/lista/${listaId}/disponibilidade`, false)
    const data = res.data ?? res
    return Array.isArray(data) ? data.map(normalizarCompra) : []
  },

  async getById(id) {
    const res = await api.get(`/compras/${id}`)
    return normalizarCompra(res.data ?? res)
  },

  async create({
    listas_id,
    catalogo_id,
    nome_convidado,
    email,
    cpf,
    telefone,
    valor_pago,
    forma_pagamento,
    status_pagamento,
    is_new_gestor,
    recaptcha_token,
  }) {
    const res = await api.post(
      '/compras',
      {
        listas_id,
        catalogo_id,
        nome_convidado,
        email,
        cpf,
        telefone,
        valor_pago,
        forma_pagamento,
        status_pagamento,
        is_new_gestor,
        recaptcha_token,
      },
      false
    )
    return normalizarCompra(res.data ?? res)
  },

  async update(id, data) {
    const res = await api.put(`/compras/${id}`, data)
    return normalizarCompra(res.data ?? res)
  },

  async cancelar(id) {
    return comprasService.update(id, { status_pagamento: 'Cancelado' })
  },

  async delete(id) {
    await api.del(`/compras/${id}`)
  },
}
