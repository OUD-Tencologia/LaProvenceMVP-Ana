import { create } from 'zustand'
import { setToken } from '../services/api.js'

const lp = {
  get:    (key) => { try { return JSON.parse(localStorage.getItem('lp_' + key)) } catch { return null } },
  set:    (key, val) => localStorage.setItem('lp_' + key, JSON.stringify(val)),
  remove: (key) => localStorage.removeItem('lp_' + key),
}

const useStore = create((set) => ({
  currentUser: lp.get('currentUser'),

  login(user, token) {
    lp.set('currentUser', user)
    setToken(token)
    set({ currentUser: user })
  },

  logout() {
    lp.remove('currentUser')
    setToken(null)
    set({ currentUser: null })
  },

  // Atualiza dados do usuário sem novo login (ex: após editar perfil)
  setCurrentUser(user) {
    lp.set('currentUser', user)
    set({ currentUser: user })
  },
}))

export default useStore
