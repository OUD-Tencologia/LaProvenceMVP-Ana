import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { formatMoney, maskMoney, parseMoney, numToMaskMoney } from '../utils/formatters'
import { validateCPF, maskPhone, maskCPF } from '../utils/validators'
import { catalogoService } from '../services/catalogo.js'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'
import { pagBankService } from '../services/pagbank.js'
import { getRecaptchaToken } from '../services/recaptcha.js'

function formatPriceSplit(valor) {
  const str = formatMoney(valor)
  const match = str.match(/^(R\$\s*[\d.]+),([\d]+)$/)
  if (!match) return { main: str, cents: '' }
  return { main: match[1].replace('R$', '').trim(), cents: `,${match[2]}` }
}

function maskCardNumber(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
}

function maskExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2)
  return d
}

function maskPostalCode(v) {
  const digits = v.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return digits
}

function safePaymentError(message) {
  const error = new Error(message)
  error.userSafe = true
  return error
}

function fmtCountdown(secs) {
  if (secs == null || secs < 0) return '00:00'
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const CREDIT_MIN_VALUE = 200
const INSTALLMENT_MIN_VALUE = 1000
const PAYMENT_ERROR_MESSAGE = 'Não foi possível concluir seu pagamento. Recarregue a página e tente novamente.'

function parseCreditValue(raw) {
  const value = Number(String(raw ?? '').replace(',', '.'))
  if (!Number.isFinite(value) || value < CREDIT_MIN_VALUE) return CREDIT_MIN_VALUE
  return Math.round(value * 100) / 100
}

function makeCreditItem() {
  return {
    id: null,
    nome: 'Cartão Presente',
    preco: CREDIT_MIN_VALUE,
    setor: 'Crédito para os noivos',
    tamanho: 'Valor livre',
    imgs: [],
    marca: '',
    isCartaoPresente: true,
  }
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const itemId = searchParams.get('itemId')
  const codigo = searchParams.get('codigo')
  const isCreditGift = searchParams.get('tipo') === 'credito' || searchParams.get('credito') === '1'

  // ── Data loading
  const [item, setItem] = useState(null)
  const [lista, setLista] = useState(null)
  const [loadError, setLoadError] = useState(null) // null | true | 'taken'
  const [loading, setLoading] = useState(true)

  // ── Step: 'form' | 'pix' | 'card' | 'processing' | 'success' | 'declined'
  const [step, setStep] = useState('form')

  // ── Guest info form
  const [form, setForm] = useState({ nome: '', email: '', cpf: '', tel: '' })
  const [pgto, setPgto] = useState('Pix')
  const [parcelas, setParcelas] = useState(1)
  const [giftCreditValue, setGiftCreditValue] = useState(() => parseCreditValue(searchParams.get('valor')))
  const [errors, setErrors] = useState({})
  const [globalErr, setGlobalErr] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Compra
  const [compraId, setCompraId] = useState(null)
  const [reservationExpiresAt, setReservationExpiresAt] = useState(null)
  const [reservationTimeLeft, setReservationTimeLeft] = useState(null)
  const reservationExpiredRef = useRef(false)

  // ── PIX
  const [pixInfo, setPixInfo] = useState(null) // { text, pngLink, expiresAt }
  const [pixTimeLeft, setPixTimeLeft] = useState(null)
  const [pixCopied, setPixCopied] = useState(false)
  const [pixCopyError, setPixCopyError] = useState(false)
  const [pixRetrying, setPixRetrying] = useState(false)
  const pixExpiredRef = useRef(false)

  // ── Card form
  const [cardForm, setCardForm] = useState({ number: '', holder: '', expiry: '', cvv: '' })
  const [billingAddress, setBillingAddress] = useState({
    postalCode: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    regionCode: '',
  })
  const [cardErrors, setCardErrors] = useState({})
  const [cardGlobalErr, setCardGlobalErr] = useState('')
  const [cardSubmitting, setCardSubmitting] = useState(false)

  // ── Load item + lista
  useEffect(() => {
    if (!codigo || (!isCreditGift && !itemId)) { navigate('/', { replace: true }); return }
    async function load() {
      setLoading(true)
      try {
        if (isCreditGift) {
          const l = await listasService.getByCodigo(codigo)
          if (!l) { setLoadError(true); return }
          setItem(makeCreditItem())
          setLista(l)
          setLoadError(null)
          return
        }

        const [cat, l] = await Promise.all([
          catalogoService.getById(itemId),
          listasService.getByCodigo(codigo),
        ])
        if (!cat || !l) { setLoadError(true); return }
        setItem(cat)
        setLista(l)
        setLoadError(null)
        const compras = await comprasService.getByLista(l.id)
        const existente = compras.find(c =>
          c.catalogo_id === itemId && !['Rejeitado', 'Cancelado'].includes(c.status_pagamento)
        )
        if (existente) setLoadError(existente.status_pagamento === 'Pendente' ? 'processing' : 'taken')
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [itemId, codigo, isCreditGift, navigate])

  useEffect(() => {
    if (isCreditGift && giftCreditValue <= INSTALLMENT_MIN_VALUE && parcelas > 1) setParcelas(1)
  }, [giftCreditValue, isCreditGift, parcelas])

  // ── PIX polling (3s, para quando pago ou expirado)
  useEffect(() => {
    if (step !== 'pix' || !compraId) return
    const interval = setInterval(async () => {
      if (pixExpiredRef.current) { clearInterval(interval); return }
      try {
        const { compra_status } = await pagBankService.getOrderStatus(compraId)
        if (compra_status === 'Aprovado') { clearInterval(interval); setStep('success') }
        if (compra_status === 'Rejeitado') {
          clearInterval(interval)
          pixExpiredRef.current = true
          setPixTimeLeft(0)
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [step, compraId])

  // ── PIX countdown (1s)
  useEffect(() => {
    if (step !== 'pix' || !pixInfo?.expiresAt) return
    pixExpiredRef.current = false
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(pixInfo.expiresAt) - Date.now()) / 1000))
      setPixTimeLeft(remaining)
      if (remaining === 0) pixExpiredRef.current = true
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [step, pixInfo])

  useEffect(() => {
    if (!reservationExpiresAt || (step !== 'card' && step !== 'processing')) return
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(reservationExpiresAt) - Date.now()) / 1000))
      setReservationTimeLeft(remaining)
      if (remaining === 0 && step === 'card' && !reservationExpiredRef.current) {
        reservationExpiredRef.current = true
        cancelCurrentAttempt().finally(() => {
          resetAttemptState()
          setGlobalErr('O tempo para finalizar este presente expirou. Inicie uma nova tentativa.')
          setStep('form')
        })
      }
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [step, reservationExpiresAt])

  if (!codigo || (!isCreditGift && !itemId)) return null

  // ── Loading
  if (loading) {
    return (
      <>
        <nav className="co-navbar">
          <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" /></Link>
        </nav>
        <div className="co-error-screen">
          <span className="label-caps">Carregando...</span>
        </div>
      </>
    )
  }

  // ── Item já presenteado
  if (loadError === 'taken' || loadError === 'processing') {
    const processing = loadError === 'processing'
    return (
      <>
        <nav className="co-navbar">
          <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" /></Link>
        </nav>
        <div className="co-error-screen">
          <span className="label-caps" style={{ color: 'var(--ocre)' }}>{processing ? 'Item em processamento' : 'Item presenteado'}</span>
          <p style={{ color: 'var(--texto-suave)', marginTop: '0.6rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
            {processing
              ? 'Outro convidado está finalizando este presente. Volte à lista para escolher outro item.'
              : 'Este item já foi presenteado. Volte à lista para escolher outro presente.'}
          </p>
          <Link to={`/lista?codigo=${codigo}`} className="btn btn-verde btn-sm" style={{ marginTop: '1.2rem' }}>Voltar à lista</Link>
        </div>
      </>
    )
  }

  // ── Erro de carregamento
  if (loadError || !item || !lista) {
    return (
      <>
        <nav className="co-navbar">
          <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" /></Link>
        </nav>
        <div className="co-error-screen">
          <span className="label-caps" style={{ color: 'var(--ocre)' }}>Item não disponível</span>
          <p style={{ color: 'var(--texto-suave)', marginTop: '0.6rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
            O item ou a lista solicitada não está mais disponível.
          </p>
          <button type="button" className="btn btn-verde btn-sm" style={{ marginTop: '1.2rem' }} onClick={() => navigate(-1)}>Voltar</button>
        </div>
      </>
    )
  }

  const checkoutItem = isCreditGift ? { ...item, preco: giftCreditValue } : item
  const rawCheckoutPrice = Number(checkoutItem.preco)
  const checkoutPrice = Number.isFinite(rawCheckoutPrice) ? rawCheckoutPrice : 0
  const { main, cents } = formatPriceSplit(checkoutPrice)
  const fmt = formatMoney(checkoutPrice)

  // ── Handlers ──

  function selectPgto(tipo) {
    setPgto(tipo)
    if (tipo !== 'Cartão') setParcelas(1)
  }

  async function confirmar() {
    const errs = {}
    setGlobalErr('')
    if (!form.nome.trim()) errs.nome = true
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = true
    if (!validateCPF(form.cpf)) errs.cpf = true
    if (!form.tel || form.tel.replace(/\D/g, '').length < 10) errs.tel = true
    if (isCreditGift && checkoutPrice < CREDIT_MIN_VALUE) errs.valor = true
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const pgtoStr = pgto === 'Cartão' ? `Cartão ${parcelas}x` : 'Pix'
      const checkoutRecaptchaToken = await getRecaptchaToken('checkout_start')
      const compra = await comprasService.create({
        listas_id: lista.id,
        catalogo_id: isCreditGift ? null : checkoutItem.id,
        nome_convidado: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.tel.replace(/\D/g, ''),
        valor_pago: checkoutPrice.toFixed(2),
        forma_pagamento: pgtoStr,
        recaptcha_token: checkoutRecaptchaToken,
      })
      setCompraId(compra.id)
      setReservationExpiresAt(compra.reserva_expira_em ?? null)
      reservationExpiredRef.current = false

      if (pgto === 'Pix') {
        try {
          const pixRecaptchaToken = await getRecaptchaToken('pagbank_pix_order')
          const order = await pagBankService.createPixOrder(compra.id, pixRecaptchaToken)
          const qr = order.qr_codes?.[0]
          if (!qr) throw new Error('QR Code não disponível. Tente novamente.')
          const pngLink = qr.links?.find(l => l.rel === 'QRCODE.PNG')?.href
          setPixInfo({ text: qr.text, pngLink, expiresAt: compra.reserva_expira_em ?? qr.expiration_date })
          setStep('pix')
        } catch (e) {
          pagBankService.cancelOrder(compra.id).catch(() => {})
          throw e
        }
      } else {
        setCardForm(f => ({ ...f, holder: form.nome.trim().toUpperCase() }))
        setStep('card')
      }
    } catch (e) {
      setCompraId(null)
      setGlobalErr(e.message || 'Erro ao processar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  async function pagarCartao() {
    const errs = {}
    setCardGlobalErr('')
    const cleanNum = cardForm.number.replace(/\s/g, '')
    const postalCode = billingAddress.postalCode.replace(/\D/g, '')
    if (cleanNum.length < 13) errs.number = 'Número do cartão inválido'
    if (!cardForm.holder.trim()) errs.holder = 'Informe o nome do titular'
    const [expM, expY] = cardForm.expiry.split('/')
    if (!expM || expM.length < 2 || !expY || expY.length < 2) errs.expiry = 'Data inválida'
    if (!cardForm.cvv || cardForm.cvv.length < 3) errs.cvv = 'CVV inválido'
    if (postalCode.length !== 8) errs.postalCode = 'CEP inválido'
    if (!billingAddress.street.trim()) errs.street = 'Informe o endereço'
    if (!billingAddress.number.trim()) errs.addressNumber = 'Informe o número'
    if (!billingAddress.city.trim()) errs.city = 'Informe a cidade'
    if (!/^[A-Za-z]{2}$/.test(billingAddress.regionCode.trim())) errs.regionCode = 'UF inválida'
    setCardErrors(errs)
    if (Object.keys(errs).length) return

    setCardSubmitting(true)
    try {
      const fullYear = expY.length === 2 ? `20${expY}` : expY
      const paymentPayload = {
        compra_id: compraId,
        installments: parcelas,
        card_holder_name: cardForm.holder.trim(),
      }

      const sdk = window.PagSeguro
      if (!sdk?.encryptCard || !sdk?.setUp || !sdk?.authenticate3DS) {
        throw safePaymentError('Não foi possível carregar a autenticação segura do cartão. Atualize a página e tente novamente.')
      }

      const publicKey = await pagBankService.getPublicKey()
      const enc = sdk.encryptCard({
        publicKey,
        holder: cardForm.holder.trim(),
        number: cleanNum,
        expMonth: expM,
        expYear: fullYear,
        securityCode: cardForm.cvv,
      })
      if (enc.hasErrors) {
        const firstErr = Object.values(enc.errors || {})[0]
        throw safePaymentError(firstErr?.message || 'Dados do cartão inválidos')
      }

      const sessionToken = await getRecaptchaToken('pagbank_card_3ds_session')
      const threeDsSession = await pagBankService.createThreeDsSession(compraId, sessionToken)
      sdk.setUp({
        session: threeDsSession.session,
        env: threeDsSession.environment,
      })

      let authentication
      try {
        const phone = form.tel.replace(/\D/g, '')
        authentication = await sdk.authenticate3DS({
          data: {
            customer: {
              name: form.nome.trim(),
              email: form.email.trim(),
              phones: [{
                country: '55',
                area: phone.slice(0, 2),
                number: phone.slice(2),
                type: 'MOBILE',
              }],
            },
            paymentMethod: {
              type: 'CREDIT_CARD',
              installments: parcelas,
              card: { encrypted: enc.encryptedCard },
            },
            amount: {
              value: Math.round(checkoutPrice * 100),
              currency: 'BRL',
            },
            billingAddress: {
              street: billingAddress.street.trim(),
              number: billingAddress.number.trim(),
              ...(billingAddress.complement.trim() && { complement: billingAddress.complement.trim() }),
              city: billingAddress.city.trim(),
              regionCode: billingAddress.regionCode.trim().toUpperCase(),
              country: 'BRA',
              postalCode,
            },
            dataOnly: false,
          },
        })
      } catch {
        throw safePaymentError('Não foi possível autenticar este cartão pelo 3DS. Tente outro cartão ou escolha Pix.')
      }

      if (authentication?.status === 'CHANGE_PAYMENT_METHOD') {
        throw safePaymentError('A autenticação foi recusada. Escolha Pix ou utilize outro cartão.')
      }
      if (authentication?.status === 'AUTH_NOT_SUPPORTED') {
        throw safePaymentError('Este cartão não permite autenticação 3DS. Escolha Pix ou utilize outro cartão.')
      }
      if (authentication?.status !== 'AUTH_FLOW_COMPLETED' || !authentication.id) {
        throw safePaymentError('A autenticação 3DS não foi concluída. Tente novamente ou escolha Pix.')
      }

      paymentPayload.card_encrypted = enc.encryptedCard
      paymentPayload.authentication_id = authentication.id
      paymentPayload.recaptcha_token = await getRecaptchaToken('pagbank_card_order')

      const order = await pagBankService.createCreditCardOrder(paymentPayload)

      const status = order.charges?.[0]?.status
      if (status === 'PAID' || status === 'AUTHORIZED') {
        setStep('success')
      } else if (status === 'DECLINED' || status === 'CANCELED') {
        setStep('declined')
      } else {
        // WAITING ou IN_ANALYSIS — aguarda webhook via polling
        setStep('processing')
        startPolling(compraId)
      }
    } catch (e) {
      await cancelCurrentAttempt()
      resetAttemptState()
      setStep('form')
      setGlobalErr(e.userSafe ? e.message : PAYMENT_ERROR_MESSAGE)
    } finally {
      setCardSubmitting(false)
    }
  }

  function startPolling(cId) {
    let attempts = 0
    const poll = async () => {
      attempts++
      try {
        const { compra_status } = await pagBankService.getOrderStatus(cId)
        if (compra_status === 'Aprovado') return setStep('success')
        if (compra_status === 'Rejeitado') return setStep('declined')
      } catch { /* ignore */ }
      if (attempts < 20) setTimeout(poll, 3000)
      else setStep('declined')
    }
    setTimeout(poll, 2000)
  }

  function resetAttemptState() {
    setCompraId(null)
    setPixInfo(null)
    setPixTimeLeft(null)
    setPixCopied(false)
    setPixCopyError(false)
    setReservationExpiresAt(null)
    setReservationTimeLeft(null)
    setCardForm({ number: '', holder: '', expiry: '', cvv: '' })
    setBillingAddress({ postalCode: '', street: '', number: '', complement: '', city: '', regionCode: '' })
    setCardErrors({})
    setCardGlobalErr('')
    pixExpiredRef.current = false
    reservationExpiredRef.current = false
  }

  async function cancelCurrentAttempt() {
    if (!compraId) return
    try {
      await pagBankService.cancelOrder(compraId)
    } catch { /* best effort */ }
  }

  async function retryExpiredPix() {
    setPixRetrying(true)
    await cancelCurrentAttempt()
    resetAttemptState()
    setGlobalErr('')
    setStep('form')
    setPixRetrying(false)
  }

  async function backToList() {
    await cancelCurrentAttempt()
    navigate(`/lista?codigo=${codigo}`)
  }

  async function retryDeclinedPayment() {
    await cancelCurrentAttempt()
    resetAttemptState()
    setGlobalErr('')
    setStep('form')
  }

  function copyPixFallback(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    textarea.setSelectionRange(0, text.length)

    let copied = false
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }

    document.body.removeChild(textarea)
    return copied
  }

  async function copyPix() {
    if (!pixInfo?.text) return
    setPixCopyError(false)

    let copied = false
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(pixInfo.text)
        copied = true
      } catch {
        copied = false
      }
    }

    if (!copied) copied = copyPixFallback(pixInfo.text)

    if (copied) {
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 2000)
      return
    }

    setPixCopyError(true)
  }

  // ── JSX compartilhado ──

  const navbar = (
    <nav className="co-navbar">
      <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" /></Link>
    </nav>
  )

  const summaryCol = (
    <div className="co-summary-col">
      <div className="co-summary-total-lbl">Valor do Presente</div>
      <div className="co-summary-total-amount">
        <sup>R$</sup> {main}<span className="cents">{cents}</span>
      </div>
      <div className="co-secure-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#27ae60"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
        Pagamento Seguro
      </div>
      <div className="co-divider" />
      <div className="co-summary-subtitle">Resumo do Pedido</div>
      <div className="co-product-row">
        <div className="co-product-thumb">
          {checkoutItem.imgs?.[0]
            ? <img src={checkoutItem.imgs[0]} alt={checkoutItem.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '🎁'}
        </div>
        <div className="co-product-info">
          <div className="co-product-name">{checkoutItem.nome}</div>
          <div className="co-product-variant">{checkoutItem.setor}{checkoutItem.tamanho ? ` · ${checkoutItem.tamanho}` : ''}</div>
          <div className="co-product-variant" style={{ marginTop: '0.2rem', color: 'var(--texto-suave)', fontSize: '0.65rem' }}>Lista de {lista.nome_noivos}</div>
        </div>
        <div className="co-product-price">{fmt}</div>
      </div>
      <div className="co-divider" />
      <div className="co-summary-line"><span>Subtotal</span><span>{fmt}</span></div>
      <div className="co-summary-line total"><span>Total</span><span>{fmt}</span></div>
    </div>
  )

  // ── Step: form ──
  if (step === 'form') {
    return (
      <>
        {navbar}
        <div className="co-page">
          <div className="co-form-col">
            {isCreditGift && (
              <>
                <div className="co-form-title">Valor do Crédito</div>
                <input
                  type="text"
                  className="co-field"
                  inputMode="numeric"
                  placeholder="R$ 200,00"
                  value={giftCreditValue ? numToMaskMoney(giftCreditValue) : ''}
                  onChange={e => {
                    setGiftCreditValue(parseMoney(maskMoney(e.target.value)))
                    setErrors(prev => {
                      if (!prev.valor) return prev
                      const next = { ...prev }
                      delete next.valor
                      return next
                    })
                  }}
                  onBlur={() => {
                    if (!giftCreditValue || giftCreditValue < CREDIT_MIN_VALUE) setGiftCreditValue(CREDIT_MIN_VALUE)
                  }}
                />
                {errors.valor && <div className="co-err-label show">Valor mínimo de {formatMoney(CREDIT_MIN_VALUE)}</div>}
              </>
            )}

            <div className="co-form-title">Informações do Presenteador</div>

            <input type="text" className="co-field" placeholder="Nome completo" autoComplete="name"
              value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            {errors.nome && <div className="co-err-label show">Informe seu nome completo</div>}

            <input type="email" className="co-field" placeholder="E-mail" autoComplete="email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="co-err-label show">E-mail inválido</div>}

            <div className="co-field-row co-field-row-wrap">
              <input type="text" className="co-field" placeholder="CPF: 000.000.000-00"
                maxLength={14} inputMode="numeric" value={form.cpf}
                onChange={e => setForm({ ...form, cpf: maskCPF(e.target.value) })} />
              <input type="text" className="co-field" placeholder="Telefone: (00) 00000-0000"
                autoComplete="tel" value={form.tel}
                onChange={e => setForm({ ...form, tel: maskPhone(e.target.value) })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
              {errors.cpf && <div className="co-err-label show" style={{ flex: 1 }}>CPF inválido</div>}
              {errors.tel && <div className="co-err-label show" style={{ flex: 1 }}>Telefone inválido</div>}
            </div>

            <div className="co-form-title">Forma de Pagamento</div>
            <div className="co-tiles">
              <div className={`co-tile${pgto === 'Pix' ? ' selected' : ''}`}
                onClick={() => selectPgto('Pix')} role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectPgto('Pix')}>Pix</div>
              <div className={`co-tile${pgto === 'Cartão' ? ' selected' : ''}`}
                onClick={() => selectPgto('Cartão')} role="button" tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && selectPgto('Cartão')}>Cartão de Crédito</div>
            </div>

            <div className={`co-parcelas-box${pgto === 'Cartão' ? ' visible' : ''}`}>
              {[1, 2, 3].map(n => {
                if (n > 1 && checkoutPrice <= INSTALLMENT_MIN_VALUE) return null
                return (
                  <div key={n} className={`co-parcela-opt${parcelas === n ? ' selected' : ''}`}
                    onClick={() => setParcelas(n)} role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setParcelas(n)}>
                    <input type="radio" name="parcela" readOnly checked={parcelas === n} />
                    <span className="co-parcela-label">{n}x</span>
                    <span className="co-parcela-value">{formatMoney(checkoutPrice / n)} / parcela</span>
                    <span className="co-parcela-badge">sem juros</span>
                  </div>
                )
              })}
              {checkoutPrice <= INSTALLMENT_MIN_VALUE && (
                <div className="co-parcelas-hint">
                  Parcelamento disponível apenas para valores acima de {formatMoney(INSTALLMENT_MIN_VALUE)}.
                </div>
              )}
            </div>

            {globalErr && <div className="co-global-err">{globalErr}</div>}

            <button type="button" className="co-submit-btn" onClick={confirmar} disabled={submitting}>
              {submitting ? 'Processando...' : 'Confirmar Presente'}
              {!submitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>}
            </button>

            <div className="co-secure">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
              Transação segura · Dados protegidos
            </div>

            <button type="button" className="co-pix-back-link co-link-button co-card-back-link" onClick={backToList}>
              Voltar à lista
            </button>
          </div>
          {summaryCol}
        </div>
      </>
    )
  }

  // ── Step: PIX ──
  if (step === 'pix') {
    const expired = pixTimeLeft === 0
    return (
      <>
        {navbar}
        <div className="co-pix-page">
          {!expired ? (
            <>
              <div className="co-pix-header">
                <h2>Pague com Pix</h2>
                <p>Escaneie o QR Code abaixo ou copie o código Pix no seu app bancário</p>
              </div>

              {pixInfo?.pngLink && (
                <img className="co-pix-qrcode" src={pixInfo.pngLink} alt="QR Code Pix"
                  onError={e => { e.currentTarget.style.display = 'none' }} />
              )}

              <label className="co-pix-code-label" htmlFor="pix-copy-code">Pix copia e cola</label>
              <textarea
                id="pix-copy-code"
                className="co-pix-code"
                value={pixInfo?.text ?? ''}
                readOnly
                onFocus={e => e.target.select()}
                aria-label="Código Pix copia e cola"
              />

              <button type="button" className={`co-pix-copy-btn${pixCopied ? ' copied' : ''}`} onClick={copyPix}>
                {pixCopied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    Código copiado!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.89 2-2V7c0-1.1-.89-2-2-2zm0 16H8V7h11v14z" /></svg>
                    Copiar código Pix
                  </>
                )}
              </button>
              {pixCopied && <div className="co-copy-feedback" role="status">Código Pix copiado com sucesso!</div>}
              {pixCopyError && (
                <div className="co-copy-feedback co-copy-feedback--error" role="alert">
                  Não foi possível copiar automaticamente. Selecione o código acima e copie manualmente.
                </div>
              )}

              <div className="co-pix-timer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>
                Sua reserva expira em <strong>{fmtCountdown(pixTimeLeft)}</strong>
              </div>

              <div className="co-pix-waiting">
                <div className="co-pix-spinner" />
                Aguardando pagamento...
              </div>
            </>
          ) : (
            <>
              <div className="co-pix-expired-icon">⏱</div>
              <h2>QR Code expirado</h2>
              <p>O tempo para pagamento expirou. Clique abaixo para gerar um novo código.</p>
              <button type="button" className="co-submit-btn" style={{ maxWidth: 320 }}
                onClick={retryExpiredPix} disabled={pixRetrying}>
                {pixRetrying ? 'Preparando...' : 'Tentar novamente'}
              </button>
            </>
          )}
          <button type="button" className="co-pix-back-link co-link-button" onClick={backToList}>
            Voltar à lista
          </button>
        </div>
      </>
    )
  }

  // ── Step: Cartão ──
  if (step === 'card') {
    return (
      <>
        {navbar}
        <div className="co-page">
          <div className="co-form-col">
            <div className="co-form-title">Dados do Cartão</div>
            {reservationTimeLeft != null && (
              <div className="co-reservation-alert" role="status">
                Este item está reservado para você por <strong>{fmtCountdown(reservationTimeLeft)}</strong>. Finalize o pagamento antes que volte à lista.
              </div>
            )}

            <input type="text" className="co-field" placeholder="Número do cartão"
              inputMode="numeric" maxLength={19} value={cardForm.number}
              onChange={e => setCardForm({ ...cardForm, number: maskCardNumber(e.target.value) })} />
            {cardErrors.number && <div className="co-err-label show">{cardErrors.number}</div>}

            <input type="text" className="co-field" placeholder="Nome do titular (como no cartão)"
              value={cardForm.holder}
              onChange={e => setCardForm({ ...cardForm, holder: e.target.value.toUpperCase() })} />
            {cardErrors.holder && <div className="co-err-label show">{cardErrors.holder}</div>}

            <div className="co-field-row co-field-row-wrap">
              <input type="text" className="co-field" placeholder="Validade: MM/AA"
                maxLength={5} inputMode="numeric" value={cardForm.expiry}
                onChange={e => setCardForm({ ...cardForm, expiry: maskExpiry(e.target.value) })} />
              <input type="text" className="co-field" placeholder="CVV"
                maxLength={4} inputMode="numeric" value={cardForm.cvv}
                onChange={e => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
              {cardErrors.expiry && <div className="co-err-label show" style={{ flex: 1 }}>{cardErrors.expiry}</div>}
              {cardErrors.cvv && <div className="co-err-label show" style={{ flex: 1 }}>{cardErrors.cvv}</div>}
            </div>

            <div className="co-form-title">Endereço de Cobrança</div>
            <div className="co-field-row co-field-row-wrap">
              <input type="text" className="co-field" placeholder="CEP"
                autoComplete="postal-code" maxLength={9} inputMode="numeric" value={billingAddress.postalCode}
                onChange={e => setBillingAddress({ ...billingAddress, postalCode: maskPostalCode(e.target.value) })} />
              <input type="text" className="co-field" placeholder="UF"
                autoComplete="address-level1" maxLength={2} value={billingAddress.regionCode}
                onChange={e => setBillingAddress({ ...billingAddress, regionCode: e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() })} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
              {cardErrors.postalCode && <div className="co-err-label show" style={{ flex: 1 }}>{cardErrors.postalCode}</div>}
              {cardErrors.regionCode && <div className="co-err-label show" style={{ flex: 1 }}>{cardErrors.regionCode}</div>}
            </div>
            <input type="text" className="co-field" placeholder="Endereço"
              autoComplete="address-line1" value={billingAddress.street}
              onChange={e => setBillingAddress({ ...billingAddress, street: e.target.value })} />
            {cardErrors.street && <div className="co-err-label show">{cardErrors.street}</div>}
            <div className="co-field-row co-field-row-wrap">
              <input type="text" className="co-field" placeholder="Número"
                value={billingAddress.number}
                onChange={e => setBillingAddress({ ...billingAddress, number: e.target.value })} />
              <input type="text" className="co-field" placeholder="Complemento (opcional)"
                autoComplete="address-line2" value={billingAddress.complement}
                onChange={e => setBillingAddress({ ...billingAddress, complement: e.target.value })} />
            </div>
            {cardErrors.addressNumber && <div className="co-err-label show">{cardErrors.addressNumber}</div>}
            <input type="text" className="co-field" placeholder="Cidade"
              autoComplete="address-level2" value={billingAddress.city}
              onChange={e => setBillingAddress({ ...billingAddress, city: e.target.value })} />
            {cardErrors.city && <div className="co-err-label show">{cardErrors.city}</div>}

            {cardGlobalErr && <div className="co-global-err">{cardGlobalErr}</div>}

            <button type="button" className="co-submit-btn" onClick={pagarCartao} disabled={cardSubmitting}>
              {cardSubmitting ? 'Processando...' : `Pagar ${fmt}`}
              {!cardSubmitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>}
            </button>

            <div className="co-secure">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
              Cartão criptografado · Protegido por 3DS
            </div>

            <button type="button" className="co-pix-back-link co-link-button co-card-back-link" onClick={backToList}>
              Voltar à lista
            </button>
          </div>
          {summaryCol}
        </div>
      </>
    )
  }

  // ── Step: Processing ──
  if (step === 'processing') {
    return (
      <div className="co-success-overlay">
        <div className="co-proc-spinner" />
        <h2 style={{ marginTop: '1.5rem', color: 'var(--verde)', fontWeight: 600 }}>Processando pagamento...</h2>
        <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Aguarde enquanto confirmamos seu pagamento.
          {reservationTimeLeft != null && <> Sua reserva expira em <strong>{fmtCountdown(reservationTimeLeft)}</strong>.</>}
        </p>
      </div>
    )
  }

  // ── Step: Success ──
  if (step === 'success') {
    return (
      <div className="co-success-overlay">
        <span className="script">Obrigado!</span>
        <h2>Pagamento confirmado!</h2>
        <p>Seu presente foi confirmado com sucesso. Os noivos ficarão muito felizes!</p>
        <div className="co-success-item-box">{checkoutItem.nome} — {fmt}</div>
        <Link to={`/lista?codigo=${codigo}`} className="btn btn-verde" style={{ maxWidth: 340, width: '100%' }}>
          Voltar à lista
        </Link>
      </div>
    )
  }

  // ── Step: Declined ──
  if (step === 'declined') {
    return (
      <div className="co-success-overlay">
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#ffeaea', border: '2.5px solid #c0392b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.2rem',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#c0392b">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </div>
        <h2 style={{ color: 'var(--ocre)' }}>Pagamento não aprovado</h2>
        <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 360, textAlign: 'center' }}>
          Não foi possível concluir seu pagamento. Recarregue a página e tente novamente.
        </p>
        <button type="button" className="btn btn-verde"
          style={{ maxWidth: 340, width: '100%', marginBottom: '0.8rem' }}
          onClick={retryDeclinedPayment}>
          Tentar novamente
        </button>
        <button type="button" className="btn btn-outline-dark btn-sm" style={{ maxWidth: 340, width: '100%' }} onClick={backToList}>
          Voltar à lista
        </button>
      </div>
    )
  }
}
