const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

let scriptPromise = null

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
    script.onerror = () => reject(new Error('Nao foi possivel carregar a validacao de seguranca'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function getRecaptchaToken(action) {
  if (!SITE_KEY) return undefined

  await loadScript()

  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(SITE_KEY, { action })
        .then(resolve)
        .catch(() => reject(new Error('Nao foi possivel validar a seguranca do checkout')))
    })
  })
}
