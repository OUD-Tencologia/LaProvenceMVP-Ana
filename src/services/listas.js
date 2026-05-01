import { api } from './api.js'
import { normalizarItem } from './catalogo.js'

// Normaliza lista da API (converte data_casamento para string YYYY-MM-DD)
function normalizarLista(lista) {
  if (!lista) return lista
  return {
    ...lista,
    data_casamento: lista.data_casamento
      ? lista.data_casamento.split('T')[0]
      : null,
    user: lista.user
      ? {
          ...lista.user,
          data_casamento: lista.user.data_casamento
            ? lista.user.data_casamento.split('T')[0]
            : null,
        }
      : lista.user,
  }
}

// Normaliza item da lista (inclui .catalogo normalizado)
function normalizarListaItem(li) {
  return {
    ...li,
    catalogo: li.catalogo ? normalizarItem(li.catalogo) : undefined,
    // alias para compatibilidade
    catalogo_id: li.catalogo_id ?? li.catalogo?.id,
  }
}

export const listasService = {
  // Gestor: todas as listas
  async getAll() {
    const res = await api.get('/listas')
    const data = res.data ?? res
    return Array.isArray(data) ? data.map(normalizarLista) : []
  },

  async getById(id) {
    const res = await api.get(`/listas/${id}`)
    return normalizarLista(res.data ?? res)
  },

  // Público — sem auth
  async getByCodigo(codigo) {
    const res = await api.get(`/listas/codigo/${codigo}`, false)
    return normalizarLista(res.data ?? res)
  },

  // Noivo: sua própria lista
  async getByUser(userId) {
    const res = await api.get(`/listas/user/${userId}`)
    return normalizarLista(res.data ?? res)
  },

  async create(data) {
    const res = await api.post('/listas', data)
    return normalizarLista(res.data ?? res)
  },

  async update(id, data) {
    const res = await api.put(`/listas/${id}`, data)
    return normalizarLista(res.data ?? res)
  },

  async delete(id) {
    await api.del(`/listas/${id}`)
  },

  // Itens da lista (público para a lista pública dos noivos)
  async getItens(listaId, requiresAuth = true) {
    const res = await api.get(`/listas/${listaId}/itens`, requiresAuth)
    const data = res.data ?? res
    return Array.isArray(data) ? data.map(normalizarListaItem) : []
  },

  async addItem(listaId, catalogoId) {
    const res = await api.post('/lista-itens', { listas_id: listaId, catalogo_id: catalogoId })
    return normalizarListaItem(res.data ?? res)
  },

  async removeItem(listaItemId) {
    await api.del(`/lista-itens/${listaItemId}`)
  },
}
