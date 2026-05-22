const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3668'

export function getToken() {
  return localStorage.getItem('lp_token') || null
}

export function setToken(token) {
  if (token) localStorage.setItem('lp_token', token)
  else localStorage.removeItem('lp_token')
}

async function req(method, path, body, requiresAuth = true) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (requiresAuth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body !== undefined) options.body = JSON.stringify(body)

  const res = await fetch(BASE + path, options)

  let data = {}
  try { data = await res.json() } catch { /* empty body */ }

  if (!res.ok) {
    throw new Error(data.message || `Erro ${res.status}`)
  }

  return data
}

export const api = {
  get:  (path, auth = true)        => req('GET',    path, undefined, auth),
  post: (path, body, auth = true)  => req('POST',   path, body,      auth),
  put:  (path, body, auth = true)  => req('PUT',    path, body,      auth),
  del:  (path, auth = true)        => req('DELETE', path, undefined, auth),
}
