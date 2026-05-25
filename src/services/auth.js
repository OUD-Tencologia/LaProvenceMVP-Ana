import { api } from './api.js'

// Mapeamento do enum Setor do banco → nome de exibição
export const SETOR_DISPLAY = {
  Mesa_posta:   'Mesa posta',
  Prataria:     'Prataria',
  Adornos:      'Adornos',
  Aromas:       'Aromas',
  Mobiliario:   'Mobiliário',
  Vasos:        'Vasos',
  Complementos: 'Complementos',
}

// Nome de exibição → enum do banco
export const SETOR_API = {
  'Mesa posta':  'Mesa_posta',
  Prataria:      'Prataria',
  Adornos:       'Adornos',
  Aromas:        'Aromas',
  'Mobiliário':  'Mobiliario',
  Vasos:         'Vasos',
  Complementos:  'Complementos',
}

export const authService = {
  /**
   * POST /login creates an HttpOnly session cookie and returns { user }.
   * user shape: { id, nome_noiva, nome_noivo, email, telefone, role, ... }
   */
  async login(email, password) {
    const res = await api.post('/login', { email, password }, false)
    // Backend envolve em { success, message, data: { user } }.
    const payload = res.data ?? res
    const user = payload.user ?? payload
    user.nome = user.nome ?? [user.nome_noiva, user.nome_noivo].filter(Boolean).join(' & ')
    return { user }
  },

  async session() {
    const res = await api.get('/session')
    const user = (res.data ?? res).user
    user.nome = user.nome ?? [user.nome_noiva, user.nome_noivo].filter(Boolean).join(' & ')
    return user
  },

  async logout() {
    await api.post('/logout', {})
  },

  /**
   * POST /users → cria conta (público)
   * Depois de criar, faz login automático para abrir a sessão segura.
   */
  async register({ nome_noiva, nome_noivo, email, telefone, data_casamento, password }) {
    await api.post('/users', { nome_noiva, nome_noivo, email, telefone, data_casamento, password }, false)
    return authService.login(email, password)
  },
}
