const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
const RECAPTCHA_TIMEOUT_MS = 12000

let scriptPromise = null

function recaptchaError() {
  return new Error('Nao foi possivel validar a seguranca do checkout. Atualize a pagina e tente novamente.')
}

function withTimeout(promise) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(recaptchaError()), RECAPTCHA_TIMEOUT_MS)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

function loadScript() {
  if (!SITE_KEY) return Promise.resolve()
  if (window.grecaptcha?.execute) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => {
      scriptPromise = null
      reject(recaptchaError())
    }
    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function getRecaptchaToken(action) {
  if (!SITE_KEY) return undefined

  await withTimeout(loadScript())

  return withTimeout(new Promise((resolve, reject) => {
    if (!window.grecaptcha?.ready || !window.grecaptcha?.execute) {
      reject(recaptchaError())
      return
    }

    window.grecaptcha.ready(() => {
      try {
        window.grecaptcha
          .execute(SITE_KEY, { action })
          .then(resolve)
          .catch(() => reject(recaptchaError()))
      } catch {
        reject(recaptchaError())
      }
    })
  }))
}
