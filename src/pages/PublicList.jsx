import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import Modal from '../components/ui/Modal'
import ItemCarousel from '../components/ui/ItemCarousel'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { formatMoney, formatDate } from '../utils/formatters'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'

const SETOR_ORDER = ['Mesa posta', 'Prataria', 'Adornos', 'Aromas', 'Mobiliário', 'Vasos', 'Complementos']

export default function PublicList() {
  const [searchParams] = useSearchParams()
  const codigo = searchParams.get('codigo')
  const navigate = useNavigate()
  const { toasts, toast } = useToast()

  const [lista, setLista] = useState(null)
  const [listaItens, setListaItens] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [setor, setSetor] = useState('')
  const [sort, setSort] = useState('padrao')
  const [detailItem, setDetailItem] = useState(null)

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

  function abrirCompra(catalogoId) {
    const compra = compras.find((c) => c.catalogo_id === catalogoId)
    if (compra && compra.status_pagamento !== 'Rejeitado') {
      toast('Este item já foi presenteado por outra pessoa.', 'error')
      return
    }
    navigate(`/checkout?itemId=${catalogoId}&codigo=${codigo}`)
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
            <>
              <span className="label-caps">Carregando...</span>
            </>
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
                  <div className="preco" style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>A partir de R$ 600,00</div>
                  <a
                    href={`https://wa.me/5565996828577?text=${encodeURIComponent(`Olá! Gostaria de presentear os noivos ${lista.nome_noivos} com um cartão presente. Código da lista: ${lista.codigo}`)}`}
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
              const isPresenteado = compra && compra.status_pagamento !== 'Rejeitado'
              return (
                <div key={item.id} className={`item-card${isPresenteado ? ' purchased' : ''}`} style={isPendente ? { opacity: 0.7, filter: 'grayscale(0.6)' } : {}}>
                  {isPresenteado && (
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
                    {!isPresenteado
                      ? <button type="button" className="btn btn-verde btn-sm" style={{ marginTop: 'auto' }} onClick={() => setDetailItem({ item, listaItem })}>Presentear</button>
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
              {!compras.find((c) => c.catalogo_id === detailItem.item.id && c.status_pagamento !== 'Rejeitado')
                ? <button type="button" className="btn btn-verde btn-sm" onClick={() => { setDetailItem(null); abrirCompra(detailItem.item.id) }}>Presentear</button>
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
    </>
  )
}
