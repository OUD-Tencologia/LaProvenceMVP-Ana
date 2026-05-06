import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Modal from '../components/ui/Modal'
import ItemCarousel from '../components/ui/ItemCarousel'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { SkeletonGrid } from '../components/ui/Skeleton'
import useStore from '../store/useStore'
import { formatMoney } from '../utils/formatters'
import { catalogoService } from '../services/catalogo.js'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'
import { SETOR_DISPLAY } from '../services/auth.js'

const SETORES = Object.values(SETOR_DISPLAY)

export default function Catalog() {
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const { toasts, toast } = useToast()

  const [catalogo, setCatalogo] = useState([])
  const [lista, setLista] = useState(null)
  const [listaItens, setListaItens] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('padrao')
  const [setor, setSetor] = useState('')
  const [page, setPage] = useState(1)
  const [detailItem, setDetailItem] = useState(null)
  const [toggling, setToggling] = useState(null)

  const ITEMS_PER_PAGE = 16

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return }
    if (currentUser.role !== 'noivo') { navigate('/admin'); return }
  }, [currentUser, navigate])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'noivo') return
    async function load() {
      setLoading(true)
      try {
        const cat = await catalogoService.getAll({ limit: 500 })
        setCatalogo(cat.filter((i) => i.status === 'Ativo'))

        let l = null
        try { l = await listasService.getByUser(currentUser.id) } catch (e) {
          console.warn('[Catalog] getByUser failed:', e?.message)
        }
        setLista(l)

        if (l) {
          const [itens, comprasData] = await Promise.all([
            listasService.getItens(l.id),
            comprasService.getByLista(l.id).catch(() => []),
          ])
          setListaItens(itens)
          setCompras(comprasData)
        }
      } catch (e) {
        toast(e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUser?.id])

  if (!currentUser) return null

  async function toggleItem(catalogoId) {
    if (!lista) {
      toast('Volte ao painel para criar sua lista primeiro.', 'error')
      return
    }
    if (toggling) return
    setToggling(catalogoId)
    try {
      const listaItem = listaItens.find((li) => li.catalogo_id === catalogoId)
      if (listaItem) {
        const compra = compras.find((c) => c.catalogo_id === catalogoId)
        if (compra) { toast('Este item já foi presenteado e não pode ser removido.', 'error'); return }
        await listasService.removeItem(listaItem.id)
        setListaItens((prev) => prev.filter((li) => li.id !== listaItem.id))
        toast('Item removido da lista.')
      } else {
        const newLi = await listasService.addItem(lista.id, catalogoId)
        const catalogoItem = catalogo.find((c) => c.id === catalogoId)
        setListaItens((prev) => [...prev, { ...newLi, catalogo: catalogoItem, catalogo_id: catalogoId }])
        toast('Item adicionado à lista!')
      }
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setToggling(null)
    }
  }

  let filtered = [...catalogo]
  if (setor) filtered = filtered.filter((i) => i.setor === setor)
  if (search) filtered = filtered.filter((i) =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    (i.descricao || '').toLowerCase().includes(search.toLowerCase()) ||
    i.setor.toLowerCase().includes(search.toLowerCase())
  )
  if (sort === 'menor') filtered.sort((a, b) => a.preco - b.preco)
  else if (sort === 'maior') filtered.sort((a, b) => b.preco - a.preco)
  else if (sort === 'az') filtered.sort((a, b) => a.nome.localeCompare(b.nome))
  else if (sort === 'novo') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  else if (sort === 'velho') filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const listaItensComCatalogo = listaItens
    .map((li) => li.catalogo ?? catalogo.find((c) => c.id === li.catalogo_id))
    .filter(Boolean)
  const listaTotal = listaItensComCatalogo.reduce((s, i) => s + (i.preco || 0), 0)

  return (
    <div className="app-layout">
      <Toast toasts={toasts} />
      <Sidebar role="noivo" />

      <main className="main-content">
        <div className="page-header">
          <div className="page-header-text"><h1>Catálogo de Presentes</h1></div>
          <div className="search-bar">
            <input type="text" placeholder="Buscar item..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
            <button type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
            </button>
          </div>
          <select className="sort-select catalog-sort-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}>
            <option value="padrao">Ordenar por Padrão</option>
            <option value="menor">Menor Preço</option>
            <option value="maior">Maior Preço</option>
            <option value="az">A - Z</option>
            <option value="novo">Mais Novos</option>
            <option value="velho">Mais Antigos</option>
          </select>
        </div>

        <div className="catalog-layout-2col">
          <div>
            <div className="cat-filter-bar">
              <button type="button" className={`cat-filter${setor === '' ? ' active' : ''}`} onClick={() => { setSetor(''); setPage(1) }}>Todos</button>
              {SETORES.map((s) => (
                <button type="button" key={s} className={`cat-filter${setor === s ? ' active' : ''}`} onClick={() => { setSetor(s); setPage(1) }}>{s}</button>
              ))}
            </div>

            <select className="cat-filter-select" value={setor} onChange={(e) => { setSetor(e.target.value); setPage(1) }}>
              <option value="">Todas as categorias</option>
              {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {loading ? <SkeletonGrid count={16} /> : filtered.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1', padding: '3rem' }}>
                <span className="script">Hmm...</span>
                <p>Nenhum item encontrado para esta busca ou filtro.</p>
              </div>
            ) : (
              <>
                <div className="catalog-grid catalog-grid-large">
                  {paginated.map((item) => {
                    const inList = listaItens.some((li) => li.catalogo_id === item.id)
                    return (
                      <div key={item.id} className="item-card" style={inList ? { outline: '2px solid var(--ouro)' } : {}}>
                        <div style={{ cursor: 'pointer' }} onClick={() => setDetailItem(item)}>
                          <ItemCarousel item={item} context="cat" />
                        </div>
                        <div className="item-card-body">
                          <div className="catalog-item-brand">{item.marca || ''}</div>
                          <h4 style={{ cursor: 'pointer' }} onClick={() => setDetailItem(item)}>{item.nome}</h4>
                          <div className="tamanho">{item.tamanho}</div>
                          <div className="preco">{formatMoney(item.preco)}</div>
                          <div className="estoque">{item.estoque} em estoque</div>
                          <button
                            type="button"
                            className={`btn btn-sm${inList ? '' : ' btn-verde'}`}
                            style={inList ? { background: 'rgba(0,48,13,0.08)', color: 'var(--verde)' } : {}}
                            disabled={toggling === item.id || (!inList && item.estoque === 0)}
                            onClick={() => toggleItem(item.id)}
                          >{inList ? 'Remover' : item.estoque === 0 ? 'Indisponível' : 'Adicionar'}</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="catalog-pagination">
                    <button
                      type="button"
                      className="catalog-pagination__btn"
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >&#8592;</button>
                    <span className="catalog-pagination__info">
                      {safePage} de {totalPages}
                    </span>
                    <button
                      type="button"
                      className="catalog-pagination__btn"
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >&#8594;</button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mini-cart">
            <div className="mini-cart-header">
              <h4>Minha Lista</h4>
              <span className="mini-cart-count">{listaItens.length} item{listaItens.length !== 1 ? 's' : ''}</span>
            </div>
            {listaItens.length === 0 ? (
              <div className="mini-cart-empty">
                <span className="script">Lista vazia</span>
                <p>Adicione itens do catálogo para começar sua lista dos sonhos.</p>
              </div>
            ) : (
              <>
                <div className="mini-cart-items">
                  {listaItensComCatalogo.map((item) => {
                    const li = listaItens.find((li) => li.catalogo_id === item.id)
                    return (
                      <div key={item.id} className="mini-cart-item">
                        <div className="mini-cart-item-info">
                          <div className="mini-cart-item-name" title={item.nome}>{item.nome}</div>
                          <div className="mini-cart-item-setor">{item.setor}</div>
                          <div className="mini-cart-item-price">{formatMoney(item.preco)}</div>
                        </div>
                        <button
                          type="button"
                          className="mini-cart-remove"
                          onClick={() => li && toggleItem(item.id)}
                          title="Remover"
                        >&#215;</button>
                      </div>
                    )
                  })}
                </div>
                <div className="mini-cart-footer">
                  <div className="mini-cart-total-row">
                    <span className="mini-cart-total-label">Total estimado</span>
                    <span className="mini-cart-total-value">{formatMoney(listaTotal)}</span>
                  </div>
                  <Link to="/dashboard" className="btn btn-verde btn-sm" style={{ width: '100%', textAlign: 'center' }}>Ver Lista Completa</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {detailItem && (
        <Modal
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          title="Detalhes do Item"
          maxWidth="600px"
          footer={
            <>
              <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setDetailItem(null)}>Fechar</button>
              <button
                type="button"
                className={`btn btn-sm${listaItens.some((li) => li.catalogo_id === detailItem.id) ? '' : ' btn-verde'}`}
                style={listaItens.some((li) => li.catalogo_id === detailItem.id) ? { background: 'rgba(0,48,13,0.08)', color: 'var(--verde)' } : {}}
                disabled={toggling === detailItem.id || (!listaItens.some((li) => li.catalogo_id === detailItem.id) && detailItem.estoque === 0)}
                onClick={() => { toggleItem(detailItem.id); setDetailItem(null) }}
              >{listaItens.some((li) => li.catalogo_id === detailItem.id) ? 'Remover' : detailItem.estoque === 0 ? 'Indisponível' : 'Adicionar'}</button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
              <ItemCarousel item={detailItem} context="detalhe" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--texto-suave)', marginBottom: '0.3rem' }}>{detailItem.setor}{detailItem.marca ? ` · ${detailItem.marca}` : ''}</div>
              <h4 style={{ fontSize: '1.4rem', color: 'var(--verde)', marginBottom: '0.5rem' }}>{detailItem.nome}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', marginBottom: '1rem' }}>{detailItem.tamanho} | Qtd: {detailItem.quantidade || 1}</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--texto)', marginBottom: '1rem' }}>{detailItem.descricao || 'Sem descrição detalhada.'}</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ouro)' }}>{formatMoney(detailItem.preco)}</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
