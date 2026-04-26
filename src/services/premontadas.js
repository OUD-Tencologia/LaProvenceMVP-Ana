import { api } from './api.js'
import { normalizarItem } from './catalogo.js'

function normalizarPremontada(p) {
  if (!p) return p
  return {
    ...p,
    // selectedItens: array de IDs para compatibilidade com Admin.jsx
    itens: p.itens ?? (p.premontada_itens ?? []).map((i) => i.catalogo_id),
    selectedItens: p.itens ?? (p.premontada_itens ?? []).map((i) => i.catalogo_id),
  }
}

export const premontadasService = {
  async getAll() {
    const res = await api.get('/premontadas', false)
    const data = res.data ?? res
    return Array.isArray(data) ? data.map(normalizarPremontada) : []
  },

  async getById(id) {
    const res = await api.get(`/premontadas/${id}`, false)
    return normalizarPremontada(res.data ?? res)
  },

  // Retorna os itens de catálogo de uma pré-montada
  async getItens(premontadaId) {
    const res = await api.get(`/premontadas/${premontadaId}/itens`, false)
    const data = res.data ?? res
    return Array.isArray(data) ? data.map((i) => normalizarItem(i.catalogo ?? i)) : []
  },

  async create(data) {
    const res = await api.post('/premontadas', data)
    return normalizarPremontada(res.data ?? res)
  },

  async update(id, data) {
    const res = await api.put(`/premontadas/${id}`, data)
    return normalizarPremontada(res.data ?? res)
  },

  async delete(id) {
    await api.del(`/premontadas/${id}`)
  },

  async addItem(premontadaId, catalogoId) {
    const res = await api.post('/premontada-itens', { premontada_id: premontadaId, catalogo_id: catalogoId })
    return res.data ?? res
  },

  async removeItem(premontadaId, catalogoId) {
    await api.del(`/premontada-itens/${premontadaId}/${catalogoId}`)
  },

  // Sincroniza os itens de uma pré-montada (adiciona os novos, remove os que saíram)
  async syncItens(premontadaId, novosIds, idsAtuais) {
    const toAdd = novosIds.filter((id) => !idsAtuais.includes(id))
    const toRemove = idsAtuais.filter((id) => !novosIds.includes(id))
    await Promise.all([
      ...toAdd.map((id) => premontadasService.addItem(premontadaId, id)),
      ...toRemove.map((id) => premontadasService.removeItem(premontadaId, id)),
    ])
  },
}
