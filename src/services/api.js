const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3668'

async function req(method, path, body, requiresAuth = true, customHeaders = {}) {
  const headers = { ...customHeaders }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (requiresAuth && !['GET', 'HEAD'].includes(method)) {
    headers['X-CSRF-Protection'] = '1'
  }

  const options = { method, headers, credentials: 'include' }
  if (body !== undefined) options.body = JSON.stringify(body)

  const res = await fetch(BASE + path, options)

  let data = {}
  try { data = await res.json() } catch { /* empty body */ }

  if (!res.ok) {
    const details = Array.isArray(data.details)
      ? data.details
        .map((detail) => [detail.path, detail.message].filter(Boolean).join(': '))
        .filter(Boolean)
        .join('; ')
      : ''
    throw new Error(details ? `${data.message || `Erro ${res.status}`}: ${details}` : data.message || `Erro ${res.status}`)
  }

  return data
}

export const api = {
  get:  (path, auth = true, headers)       => req('GET',    path, undefined, auth, headers),
  post: (path, body, auth = true, headers) => req('POST',   path, body,      auth, headers),
  put:  (path, body, auth = true, headers) => req('PUT',    path, body,      auth, headers),
  del:  (path, auth = true, headers)       => req('DELETE', path, undefined, auth, headers),
}
