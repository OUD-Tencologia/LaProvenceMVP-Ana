import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { formatMoney } from '../utils/formatters'
import { validateCPF, maskPhone, maskCPF } from '../utils/validators'
import { catalogoService } from '../services/catalogo.js'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'

function formatPriceSplit(valor) {
  const str = formatMoney(valor)
  const match = str.match(/^(R\$\s*[\d.]+),([\d]+)$/)
  if (!match) return { main: str, cents: '' }
  return { main: match[1].replace('R$', '').trim(), cents: `,${match[2]}` }
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const itemId = searchParams.get('itemId')
  const codigo = searchParams.get('codigo')

  const [item, setItem] = useState(null)
  const [lista, setLista] = useState(null)
  const [compraExistente, setCompraExistente] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  const [pgto, setPgto] = useState('Pix')
  const [parcelas, setParcelas] = useState(1)
  const [form, setForm] = useState({ nome: '', cpf: '', tel: '' })
  const [errors, setErrors] = useState({})
  const [globalErr, setGlobalErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!itemId || !codigo) { navigate('/', { replace: true }); return }
    async function load() {
      setLoading(true)
      try {
        const [cat, l] = await Promise.all([
          catalogoService.getById(itemId),
          listasService.getByCodigo(codigo),
        ])
        if (!cat || !l) { setLoadError(true); return }
        setItem(cat)
        setLista(l)

        const compras = await comprasService.getByLista(l.id)
        const existente = compras.find((c) => c.catalogo_id === itemId && c.status_pagamento !== 'Rejeitado')
        setCompraExistente(existente || null)
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [itemId, codigo, navigate])

  if (!itemId || !codigo) return null

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

  if (compraExistente) {
    return (
      <>
        <nav className="co-navbar">
          <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" /></Link>
        </nav>
        <div className="co-error-screen">
          <span className="label-caps" style={{ color: 'var(--ocre)' }}>Item já presenteado</span>
          <p style={{ color: 'var(--texto-suave)', marginTop: '0.6rem', fontSize: '0.88rem', lineHeight: 1.7 }}>
            Este item já foi presenteado. Volte à lista para escolher outro presente.
          </p>
          <Link to={`/lista?codigo=${codigo}`} className="btn btn-verde btn-sm" style={{ marginTop: '1.2rem' }}>Voltar à lista</Link>
        </div>
      </>
    )
  }

  const { main, cents } = formatPriceSplit(item.preco)
  const fmt = formatMoney(item.preco)

  function selectPgto(tipo) {
    setPgto(tipo)
    if (tipo !== 'Cartão') setParcelas(1)
  }

  async function confirmar() {
    const errs = {}
    setGlobalErr('')
    if (!form.nome.trim()) errs.nome = true
    if (!validateCPF(form.cpf)) errs.cpf = true
    if (!form.tel || form.tel.replace(/\D/g, '').length < 10) errs.tel = true
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const pgtoStr = pgto === 'Cartão' ? `Cartão ${parcelas}x` : 'Pix'
      await comprasService.create({
        listas_id: lista.id,
        catalogo_id: item.id,
        nome_convidado: form.nome.trim(),
        cpf: form.cpf,
        telefone: form.tel,
        valor_pago: String(item.preco),
        forma_pagamento: pgtoStr,
      })

      const parcelaTxt = pgto === 'Cartão'
        ? ` em ${parcelas}x de ${formatMoney(item.preco / parcelas)}`
        : ''
      const msg = encodeURIComponent(
        `Olá! Sou ${form.nome.trim()} e acabei de reservar o presente "${item.nome}" (${fmt}${parcelaTxt}) da lista de ${lista.nome_noivos}.\n\nForma de pagamento: ${pgtoStr}.\n\nCódigo da lista: ${lista.codigo}`
      )
      setSuccess({ waHref: `https://wa.me/5565996828577?text=${msg}` })
    } catch (e) {
      setGlobalErr(e.message || 'Erro ao registrar compra. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="co-success-overlay">
        <span className="script">Obrigado!</span>
        <h2>Presente registrado com sucesso</h2>
        <p>Seu presente foi registrado. Para finalizar o pagamento, nossa equipe entrará em contato com total segurança.</p>
        <div className="co-success-item-box">{item.nome} — {fmt}</div>
        <a href={success.waHref} target="_blank" rel="noreferrer" className="btn btn-verde" style={{ maxWidth: 340, width: '100%', marginBottom: '0.8rem' }}>
          Finalizar pelo WhatsApp
        </a>
        <Link to={`/lista?codigo=${codigo}`} className="btn btn-outline-dark btn-sm" style={{ maxWidth: 340, width: '100%' }}>
          Voltar à lista
        </Link>
      </div>
    )
  }

  return (
    <>
      <nav className="co-navbar">
        <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" /></Link>
      </nav>

      <div className="co-page">
        {/* Form column */}
        <div className="co-form-col">
          <div className="co-form-title">Informações do Presenteador</div>

          <input
            type="text"
            className="co-field"
            placeholder="Nome completo"
            autoComplete="name"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          {errors.nome && <div className="co-err-label show">Informe seu nome completo</div>}

          <div className="co-field-row co-field-row-wrap">
            <input
              type="text"
              className="co-field"
              placeholder="CPF: 000.000.000-00"
              maxLength={14}
              inputMode="numeric"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })}
            />
            <input
              type="text"
              className="co-field"
              placeholder="Telefone: (00) 00000-0000"
              autoComplete="tel"
              value={form.tel}
              onChange={(e) => setForm({ ...form, tel: maskPhone(e.target.value) })}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
            {errors.cpf && <div className="co-err-label show" style={{ flex: 1 }}>CPF inválido</div>}
            {errors.tel && <div className="co-err-label show" style={{ flex: 1 }}>Telefone inválido</div>}
          </div>

          <div className="co-form-title">Forma de Pagamento</div>

          <div className="co-tiles">
            <div className={`co-tile${pgto === 'Pix' ? ' selected' : ''}`} onClick={() => selectPgto('Pix')} onKeyDown={(e) => e.key === 'Enter' && selectPgto('Pix')} role="button" tabIndex={0}>Pix</div>
            <div className={`co-tile${pgto === 'Cartão' ? ' selected' : ''}`} onClick={() => selectPgto('Cartão')} onKeyDown={(e) => e.key === 'Enter' && selectPgto('Cartão')} role="button" tabIndex={0}>Cartão de Crédito</div>
          </div>

          <div className={`co-parcelas-box${pgto === 'Cartão' ? ' visible' : ''}`}>
            {[1, 2, 3].map((n) => {
              if (n > 1 && item.preco < 1000) return null
              return (
                <div key={n} className={`co-parcela-opt${parcelas === n ? ' selected' : ''}`} onClick={() => setParcelas(n)} onKeyDown={(e) => e.key === 'Enter' && setParcelas(n)} role="button" tabIndex={0}>
                  <input type="radio" name="parcela" readOnly checked={parcelas === n} />
                  <span className="co-parcela-label">{n}x</span>
                  <span className="co-parcela-value">{formatMoney(item.preco / n)} / parcela</span>
                  <span className="co-parcela-badge">sem juros</span>
                </div>
              )
            })}
          </div>

          {globalErr && <div className="co-global-err">{globalErr}</div>}

          <button type="button" className="co-submit-btn" onClick={confirmar} disabled={submitting}>
            {submitting ? 'Registrando...' : 'Confirmar Presente'}
            {!submitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /></svg>}
          </button>

          <div className="co-secure">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
            Transação segura · Dados protegidos
          </div>
        </div>

        {/* Summary column */}
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
              {item.imgs?.[0]
                ? <img src={item.imgs[0]} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🎁'}
            </div>
            <div className="co-product-info">
              <div className="co-product-name">{item.nome}</div>
              <div className="co-product-variant">{item.setor}{item.tamanho ? ` · ${item.tamanho}` : ''}</div>
              <div className="co-product-variant" style={{ marginTop: '0.2rem', color: 'var(--texto-suave)', fontSize: '0.65rem' }}>Lista de {lista.nome_noivos}</div>
            </div>
            <div className="co-product-price">{fmt}</div>
          </div>

          <div className="co-divider" />

          <div className="co-summary-line">
            <span>Subtotal</span>
            <span>{fmt}</span>
          </div>
          <div className="co-summary-line total">
            <span>Total</span>
            <span>{fmt}</span>
          </div>
        </div>
      </div>
    </>
  )
}
