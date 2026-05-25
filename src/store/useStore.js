import { create } from 'zustand'
import { authService } from '../services/auth.js'

function clearLegacySessionStorage() {
  localStorage.removeItem('lp_token')
  localStorage.removeItem('lp_currentUser')
}

const useStore = create((set) => ({
  currentUser: null,
  sessionChecked: false,

  async loadSession() {
    clearLegacySessionStorage()
    try {
      const user = await authService.session()
      set({ currentUser: user, sessionChecked: true })
    } catch {
      set({ currentUser: null, sessionChecked: true })
    }
  },

  login(user) {
    set({ currentUser: user, sessionChecked: true })
  },

  logout() {
    set({ currentUser: null, sessionChecked: true })
    return authService.logout().catch(() => {})
  },

  setCurrentUser(user) {
    set({ currentUser: user })
  },
}))

export default useStore
