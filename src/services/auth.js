import { api, setToken } from './api.js'

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
   * POST /login → { token, user }
   * user shape: { id, nome_noiva, nome_noivo, email, telefone, role, ... }
   */
  async login(email, password) {
    const res = await api.post('/login', { email, password }, false)
    // Backend envolve em { success, message, data: { user, token } }
    const payload = res.data ?? res
    const token = payload.token
    const user = payload.user ?? payload
    if (token) setToken(token)
    user.nome = user.nome ?? [user.nome_noiva, user.nome_noivo].filter(Boolean).join(' & ')
    return { token, user }
  },

  /**
   * POST /users → cria conta (público)
   * Depois de criar, faz login automático para obter token.
   */
  async register({ nome_noiva, nome_noivo, email, telefone, data_casamento, password }) {
    await api.post('/users', { nome_noiva, nome_noivo, email, telefone, data_casamento, password }, false)
    return authService.login(email, password)
  },
}
