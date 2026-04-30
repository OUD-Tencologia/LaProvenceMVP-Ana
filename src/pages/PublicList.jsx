import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Modal from '../components/ui/Modal'
import ItemCarousel from '../components/ui/ItemCarousel'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { formatMoney, formatDate } from '../utils/formatters'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'

const SETOR_ORDER = ['Mesa posta', 'Prataria', 'Adornos', 'Aromas', 'Mobiliário', 'Vasos', 'Complementos']
const WA_NUMBER = '5565996828577'

function maskCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3}\.\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3}\.\d{3}\.\d{3})(\d)/, '$1-$2')
}
function maskPhone(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\(\d{2}\) \d{4,5})(\d{4})$/, '$1-$2')
}

export default function PublicList() {
  const [searchParams] = useSearchParams()
  const codigo = searchParams.get('codigo')
  const { toasts, toast } = useToast()

  const [lista, setLista] = useState(null)
  const [listaItens, setListaItens] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [setor, setSetor] = useState('')
  const [sort, setSort] = useState('padrao')
  const [detailItem, setDetailItem] = useState(null)

  // Gift flow
  const [giftModal, setGiftModal] = useState(null) // { item, listaItem }
  const [guestData, setGuestData] = useState({ nome: '', cpf: '', telefone: '', formaPagamento: '' })
  const [guestErrors, setGuestErrors] = useState({})
  const [confirmModal, setConfirmModal] = useState(null) // { items, guestNome, formaPagamento }
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!codigo) { setLoading(false); return }
    async function load() {
      setLoading(true)
      try {
        const l = await listasService.getByCodigo(codigo)
        if (!l?.id) { setNotFound(true); setLoading(false); return }
        setLista(l)
        document.title = `${l.nome_noivos.replace(/\s*&\s*/g, ' e ')} — Lista de Casamento — La Provence`

        const [itens, comprasData] = await Promise.all([
          listasService.getItens(l.id, false),
          comprasService.getByLista(l.id).catch(() => []),
        ])
        setListaItens(itens)
        setCompras(comprasData)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [codigo])

  if (!codigo || notFound) {
    return (
      <div>
        <nav className="public-navbar">
          <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 150 }} /></Link>
        </nav>
        <div className="public-hero">
          <div className="public-hero-content">
            <span className="label-caps">Lista não encontrada</span>
            <span className="script">Código inválido</span>
            <p>Verifique o link ou o código recebido dos noivos.</p>
            <Link to="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>Voltar ao início</Link>
          </div>
        </div>
      </div>
    )
  }

  const itensBase = listaItens.map((li) => li.catalogo).filter(Boolean)

  const setores = [...new Set(itensBase.map((i) => i.setor).filter(Boolean))].sort((a, b) => {
    const ia = SETOR_ORDER.indexOf(a), ib = SETOR_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

  let itens = setor ? itensBase.filter((i) => i.setor === setor) : itensBase
  if (sort === 'menor') itens = [...itens].sort((a, b) => a.preco - b.preco)
  else if (sort === 'maior') itens = [...itens].sort((a, b) => b.preco - a.preco)
  else if (sort === 'az') itens = [...itens].sort((a, b) => a.nome.localeCompare(b.nome))

  const total = listaItens.length
  const presenteados = compras.filter((c) => c.status_pagamento !== 'Rejeitado').length

  // ── Gift modal helpers ─────────────────────────────────
  function isPresenteado(catalogoId) {
    const c = compras.find((c) => c.catalogo_id === catalogoId)
    return c && c.status_pagamento !== 'Rejeitado'
  }

  function abrirGiftModal(item, listaItem) {
    if (!item) return
    if (isPresenteado(item.id)) {
      toast('Este item já foi presenteado por outra pessoa.', 'error')
      return
    }
    setDetailItem(null)
    setGuestErrors({})
    setGiftModal({ item, listaItem: listaItem ?? listaItens.find((li) => li.catalogo_id === item.id) })
  }

  function validarGuest() {
    const errs = {}
    if (!guestData.nome.trim()) errs.nome = 'Informe seu nome completo'
    if (!guestData.cpf.replace(/\D/g, '') || guestData.cpf.replace(/\D/g, '').length < 11) errs.cpf = 'CPF inválido'
    if (!guestData.telefone.trim()) errs.telefone = 'Informe seu telefone'
    if (!guestData.formaPagamento) errs.formaPagamento = 'Selecione a forma de pagamento'
    setGuestErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function confirmarPresente() {
    if (!validarGuest()) return
    const item = giftModal.item

    setConfirmando(true)
    try {
      await comprasService.create({
        listas_id: lista.id,
        catalogo_id: item.id,
        nome_convidado: guestData.nome,
        cpf: guestData.cpf.replace(/\D/g, ''),
        telefone: guestData.telefone,
        valor_pago: String(Number(item.preco)),
        forma_pagamento: guestData.formaPagamento,
        status_pagamento: 'Pendente',
        is_new_gestor: true,
      })
    } catch {
      // item continuará sendo tentado pelo gestor via WhatsApp
    }
    try {
      const novasCompras = await comprasService.getByLista(lista.id)
      setCompras(novasCompras)
    } catch { /* manter estado atual */ }

    setConfirmando(false)
    setGiftModal(null)
    setConfirmModal({ items: [item], guestNome: guestData.nome, formaPagamento: guestData.formaPagamento })
  }

  function abrirWhatsApp() {
    if (!confirmModal) return
    const totalValor = confirmModal.items.reduce((s, i) => s + Number(i.preco), 0)
    const itensText = confirmModal.items.map((i) => `• ${i.nome} — ${formatMoney(i.preco)}`).join('\n')
    const msg = encodeURIComponent(
      `Olá! Gostaria de confirmar o presente para os noivos *${lista.nome_noivos}*. 🎁\n\n` +
      `*Meus dados:*\nNome: ${confirmModal.guestNome}\nForma de pagamento: ${confirmModal.formaPagamento}\n\n` +
      `*${confirmModal.items.length > 1 ? 'Itens escolhidos' : 'Item escolhido'}:*\n${itensText}\n\n` +
      `*Total: ${formatMoney(totalValor)}*\n\nCódigo da lista: ${lista.codigo}`
    )
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
    setConfirmModal(null)
  }

  return (
    <>
      <Toast toasts={toasts} />

      <nav className="public-navbar">
        <Link to="/"><img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 150 }} /></Link>
      </nav>

      <div className="public-hero">
        <div className="public-hero-content">
          {!lista ? (
            <span className="label-caps">Carregando...</span>
          ) : (
            <>
              <span className="label-caps">Você está na lista de</span>
              <span className="script" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', lineHeight: 1.15, display: 'block', margin: '0.5rem 0', overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '100%' }}>
                {lista.nome_noivos.replace(/\s*&\s*/g, ' e ')}
              </span>
              {lista.data_casamento && <p>Casamento em {formatDate(lista.data_casamento)}</p>}
              <div className="public-code">Código: {lista.codigo}</div>
              {lista.mensagem_boas_vindas && (
                <div style={{ display: 'block', marginTop: '1.5rem', fontSize: '0.95rem', color: 'rgba(251,221,144,0.85)', maxWidth: 600, margin: '1.5rem auto 0', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{lista.mensagem_boas_vindas}"
                </div>
              )}
            </>
          )}
        </div>
      </div>


      {lista && (
        <div className="public-catalog">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--verde)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Escolha um presente</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--texto-suave)' }}>{presenteados} de {total} presentes escolhidos</div>
          </div>

          <div className="legend">
            <div className="legend-item"><span className="item-status-dot dot-available"></span> Disponível</div>
            <div className="legend-item"><span className="item-status-dot dot-purchased"></span> Já presenteado</div>
          </div>

          <div className="public-filter-row">
            <div className="public-filters">
              <button type="button" className={`public-filter${setor === '' ? ' active' : ''}`} onClick={() => setSetor('')}>Todos</button>
              {setores.map((s) => (
                <button type="button" key={s} className={`public-filter${setor === s ? ' active' : ''}`} onClick={() => setSetor(s)}>{s}</button>
              ))}
            </div>
            <select className="sort-select public-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="padrao">Padrão</option>
              <option value="menor">Menor Preço</option>
              <option value="maior">Maior Preço</option>
              <option value="az">A - Z</option>
            </select>
          </div>

          {loading ? <SkeletonGrid count={8} /> : null}

          <div className="catalog-grid catalog-grid-large" style={loading ? { display: 'none' } : {}}>
            {setor === '' && (
              <div className="item-card" style={{ border: '2px solid var(--ouro)' }}>
                <div style={{ background: 'var(--verde)', height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ouro-claro)', textAlign: 'center', padding: '1rem' }}>
                  <div className="script" style={{ fontSize: '2.8rem', lineHeight: 1 }}>Cartão Presente</div>
                  <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.5rem' }}>La Provence Decor</div>
                </div>
                <div className="item-card-body">
                  <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--texto-suave)', marginBottom: '0.3rem' }}>Valor Livre</div>
                  <h4>Presentear com Crédito</h4>
                  <div className="tamanho">Os noivos escolhem o presente</div>
                  <div className="preco" style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>A partir de R$ 200,00</div>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Olá! Gostaria de presentear os noivos ${lista.nome_noivos} com um cartão presente. Código da lista: ${lista.codigo}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-verde btn-sm"
                    style={{ marginTop: 'auto', display: 'block', textAlign: 'center' }}
                  >Presentear</a>
                </div>
              </div>
            )}

            {itens.map((item) => {
              const listaItem = listaItens.find((li) => li.catalogo_id === item.id)
              const compra = compras.find((c) => c.catalogo_id === item.id)
              const isPendente = compra && compra.status_pagamento === 'Pendente'
              const isPresent = compra && compra.status_pagamento !== 'Rejeitado'
              return (
                <div key={item.id} className={`item-card${isPresent ? ' purchased' : ''}`} style={isPendente ? { opacity: 0.7, filter: 'grayscale(0.6)' } : {}}>
                  {isPresent && (
                    <div className="purchased-overlay" style={isPendente ? { background: 'rgba(107,107,107,0.7)' } : {}}>
                      <span className="purchased-stamp" style={isPendente ? { color: '#fff', borderColor: '#fff' } : {}}>{isPendente ? 'Em andamento' : 'Presenteado'}</span>
                    </div>
                  )}
                  <div style={{ cursor: 'pointer' }} onClick={() => setDetailItem({ item, listaItem })}>
                    <ItemCarousel item={item} context="pub" />
                  </div>
                  <div className="item-card-body">
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--texto-suave)', marginBottom: '0.3rem' }}>{item.marca || ''}</div>
                    <h4 style={{ cursor: 'pointer' }} onClick={() => setDetailItem({ item, listaItem })}>{item.nome}</h4>
                    <div className="tamanho">{item.tamanho}</div>
                    <div className="preco">{formatMoney(item.preco)}</div>
                    {!isPresent
                      ? <button type="button" className="btn btn-verde btn-sm" style={{ marginTop: 'auto' }} onClick={() => abrirGiftModal(item, listaItem)}>
                          Presentear
                        </button>
                      : <span style={{ fontSize: '0.72rem', color: 'var(--texto-suave)' }}>{isPendente ? 'Em processamento' : 'Já foi presenteado'}</span>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Item detail modal */}
      {detailItem && (
        <Modal
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          title="Detalhes do Presente"
          maxWidth="600px"
          footer={
            <>
              <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setDetailItem(null)}>Fechar</button>
              {!isPresenteado(detailItem.item.id)
                ? <button type="button" className="btn btn-verde btn-sm" onClick={() => abrirGiftModal(detailItem.item, detailItem.listaItem)}>Presentear</button>
                : <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', padding: '0.5rem' }}>Já presenteado</span>
              }
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
              <ItemCarousel item={detailItem.item} context="detalhe" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--texto-suave)', marginBottom: '0.3rem' }}>
                {detailItem.item.setor}{detailItem.item.marca ? ` · ${detailItem.item.marca}` : ''}
              </div>
              <h4 style={{ fontSize: '1.4rem', color: 'var(--verde)', marginBottom: '0.5rem' }}>{detailItem.item.nome}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', marginBottom: '1rem' }}>{detailItem.item.tamanho} | Qtd: {detailItem.item.quantidade || 1}</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--texto)', marginBottom: '1rem' }}>{detailItem.item.descricao || 'Sem descrição detalhada.'}</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ouro)' }}>{formatMoney(detailItem.item.preco)}</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Gift modal */}
      {giftModal && (
        <Modal
          open={!!giftModal}
          onClose={() => setGiftModal(null)}
          title="Presentear este item"
          maxWidth="480px"
          footer={
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <button type="button" className="btn btn-outline-dark btn-sm" style={{ flex: 1 }} onClick={() => setGiftModal(null)}>
                CANCELAR
              </button>
              <button type="button" className="btn btn-verde btn-sm" style={{ flex: 1 }} onClick={confirmarPresente} disabled={confirmando}>
                {confirmando ? 'REGISTRANDO...' : 'CONFIRMAR PRESENTE'}
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

            {/* Item info */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--verde)', marginBottom: '0.3rem' }}>{giftModal.item.nome}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--texto-suave)' }}>Defina o valor com o qual deseja presentear os noivos:</div>
            </div>

            {/* Price box */}
            <div style={{ background: 'var(--bege-suave)', border: '1px solid rgba(0,48,13,0.1)', borderRadius: 4, padding: '1rem 1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--verde)' }}>{formatMoney(giftModal.item.preco)}</div>
            </div>

            {/* Guest form */}
            <div>
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label htmlFor="guest-nome" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.62rem' }}>Seu Nome Completo</label>
                <input id="guest-nome" type="text" placeholder="Nome completo" value={guestData.nome}
                  onChange={(e) => setGuestData({ ...guestData, nome: e.target.value })} />
                {guestErrors.nome && <span className="form-error show">{guestErrors.nome}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="guest-cpf" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.62rem' }}>CPF</label>
                  <input id="guest-cpf" type="text" placeholder="000.000.000-00" value={guestData.cpf}
                    onChange={(e) => setGuestData({ ...guestData, cpf: maskCPF(e.target.value) })} />
                  {guestErrors.cpf && <span className="form-error show">{guestErrors.cpf}</span>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="guest-tel" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.62rem' }}>Telefone</label>
                  <input id="guest-tel" type="text" placeholder="(00) 00000-0000" value={guestData.telefone}
                    onChange={(e) => setGuestData({ ...guestData, telefone: maskPhone(e.target.value) })} />
                  {guestErrors.telefone && <span className="form-error show">{guestErrors.telefone}</span>}
                </div>
              </div>

              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--texto-suave)', marginBottom: '0.5rem', width: '100%' }}>
                  Forma de Pagamento
                </legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {['Pix', 'Cartão'].map((op) => (
                    <button type="button" key={op}
                      className={`payment-option${guestData.formaPagamento === op ? ' selected' : ''}`}
                      onClick={() => setGuestData({ ...guestData, formaPagamento: op })}>
                      {op}
                    </button>
                  ))}
                </div>
                {guestErrors.formaPagamento && <span className="form-error show">{guestErrors.formaPagamento}</span>}
              </fieldset>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', lineHeight: 1.6, textAlign: 'center', margin: 0 }}>
              Ao confirmar, nossa equipe entrará em contato para finalizar o pagamento com segurança.
            </p>
          </div>
        </Modal>
      )}
      {/* Modal confirmação presente */}
      {confirmModal && (
        <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} maxWidth="420px">
          <div className="confirm-present-modal">
            <div className="script confirm-present-title">Quase lá!</div>
            <h3 className="confirm-present-subtitle">Estamos finalizando seu presente</h3>
            <p className="confirm-present-desc">
              Para garantir a segurança da transação, o pagamento é concluído diretamente com nossa equipe.
            </p>
            <div className="confirm-present-box">
              <div className="label-caps" style={{ color: 'var(--ouro)', marginBottom: '0.5rem' }}>
                {confirmModal.items.length > 1 ? 'Itens Escolhidos' : 'Item Escolhido'}
              </div>
              {confirmModal.items.map((item) => (
                <div key={item.id} className="confirm-present-item">{item.nome}</div>
              ))}
            </div>
            <button type="button" className="btn btn-verde confirm-present-wa" onClick={abrirWhatsApp}>
              ENTRAR EM CONTATO VIA WHATSAPP
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
