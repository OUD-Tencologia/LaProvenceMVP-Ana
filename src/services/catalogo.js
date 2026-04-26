import { api } from './api.js'
import { SETOR_DISPLAY, SETOR_API } from './auth.js'

// Converte item da API para o formato que os componentes existentes esperam
export function normalizarItem(item) {
  if (!item) return item
  return {
    ...item,
    // imgs: array de URLs a partir de catalogo_images ordenado por posicao
    imgs: (item.catalogo_images ?? [])
      .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
      .map((i) => i.url),
    // setor: nome legível
    setor: SETOR_DISPLAY[item.setor] ?? item.setor,
    preco: Number(item.preco ?? 0),
  }
}

export const catalogoService = {
  async getAll(params = {}) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null)).toString()
    const res = await api.get(`/catalogo${q ? '?' + q : ''}`, false)
    const items = res.data ?? res
    return Array.isArray(items) ? items.map(normalizarItem) : []
  },

  async getById(id) {
    const res = await api.get(`/catalogo/${id}`, false)
    return normalizarItem(res.data ?? res)
  },

  async create(data) {
    const payload = { ...data, setor: SETOR_API[data.setor] ?? data.setor }
    const res = await api.post('/catalogo', payload)
    return normalizarItem(res.data ?? res)
  },

  async update(id, data) {
    const payload = { ...data }
    if (data.setor) payload.setor = SETOR_API[data.setor] ?? data.setor
    const res = await api.put(`/catalogo/${id}`, payload)
    return normalizarItem(res.data ?? res)
  },

  async delete(id) {
    await api.del(`/catalogo/${id}`)
  },

  // Gerenciamento de imagens
  async addImage(catalogoId, url, posicao = 0) {
    const res = await api.post('/catalogo-images', { catalogo_id: catalogoId, url, posicao })
    return res.data ?? res
  },

  async updateImage(id, data) {
    const res = await api.put(`/catalogo-images/${id}`, data)
    return res.data ?? res
  },

  async deleteImage(id) {
    await api.del(`/catalogo-images/${id}`)
  },
}
