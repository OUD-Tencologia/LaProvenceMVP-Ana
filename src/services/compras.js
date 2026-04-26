import { api } from './api.js'

function normalizarCompra(c) {
  if (!c) return c
  return {
    ...c,
    valor_pago: Number(c.valor_pago ?? 0),
    // aliases para compatibilidade com código existente
    item_id:    c.catalogo_id,
    lista_id:   c.listas_id,
    data_compra: c.data_compra ?? c.created_at,
  }
}

export const comprasService = {
  // Público — qualquer um pode ver as compras de uma lista
  async getByLista(listaId) {
    const res = await api.get(`/compras/lista/${listaId}`, false)
    const data = res.data ?? res
    return Array.isArray(data) ? data.map(normalizarCompra) : []
  },

  async getById(id) {
    const res = await api.get(`/compras/${id}`)
    return normalizarCompra(res.data ?? res)
  },

  /**
   * Registrar compra (presentear).
   * ATENÇÃO: a rota POST /compras exige autenticação no backend atual.
   * Para checkout de convidados (sem login) funcionar, o endpoint precisa
   * ter o preHandler de auth removido no backend.
   */
  async create({ listas_id, catalogo_id, nome_convidado, cpf, telefone, valor_pago, forma_pagamento }) {
    const res = await api.post(
      '/compras',
      { listas_id, catalogo_id, nome_convidado, cpf, telefone, valor_pago, forma_pagamento },
      false // tenta sem auth; se o backend exigir, retornará 401
    )
    return normalizarCompra(res.data ?? res)
  },

  async update(id, data) {
    const res = await api.put(`/compras/${id}`, data)
    return normalizarCompra(res.data ?? res)
  },

  async aprovar(id) {
    return comprasService.update(id, { status_pagamento: 'Aprovado' })
  },

  async rejeitar(id) {
    return comprasService.update(id, { status_pagamento: 'Rejeitado' })
  },

  async delete(id) {
    await api.del(`/compras/${id}`)
  },
}
