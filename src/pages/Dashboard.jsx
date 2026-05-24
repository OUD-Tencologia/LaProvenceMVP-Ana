import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Modal from '../components/ui/Modal'
import ItemCarousel from '../components/ui/ItemCarousel'
import Toast from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { SkeletonStatsGrid, SkeletonGrid } from '../components/ui/Skeleton'
import useStore from '../store/useStore'
import { formatMoney, formatDate } from '../utils/formatters'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const { toasts, toast } = useToast()

  const [lista, setLista] = useState(null)
  const [listaItens, setListaItens] = useState([])
  const [compras, setCompras] = useState([])
  const [loading, setLoading] = useState(true)
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [savingMsg, setSavingMsg] = useState(false)
  const [compraModal, setCompraModal] = useState(null)


  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return }
    if (currentUser.role !== 'noivo') { navigate('/admin'); return }
  }, [currentUser, navigate])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'noivo') return
    async function load() {
      setLoading(true)
      try {
        let l = null
        try {
          l = await listasService.getByUser(currentUser.id)
        } catch { /* usuário sem lista ainda */ }

        if (!l) { setLoading(false); return }
        setLista(l)
        setWelcomeMsg(l.mensagem_boas_vindas || '')

        const [itens, comprasData] = await Promise.all([
          listasService.getItens(l.id),
          comprasService.getByLista(l.id).catch(() => []),
        ])
        setListaItens(itens)
        setCompras(comprasData)
      } catch (e) {
        toast(e.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUser?.id])

  if (!currentUser) return null

  function getActiveCompra(catalogoId) {
    return compras.find((c) =>
      c.catalogo_id === catalogoId && !['Rejeitado', 'Cancelado'].includes(c.status_pagamento)
    )
  }

  // Stats
  const totalItens = listaItens.length
  const comprados = listaItens.filter((li) => {
    const c = getActiveCompra(li.catalogo_id)
    return c && (c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado')
  }).length
  const pct = totalItens > 0 ? Math.round((comprados / totalItens) * 100) : 0
  const diasRestantes = lista?.data_casamento
    ? Math.max(0, Math.ceil((new Date(lista.data_casamento + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)))
    : null
  const valorTotal = compras.reduce((s, c) => {
    if (c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado') return s + Number(c.valor_pago)
    return s
  }, 0)

  function getListaUrl() { return window.location.origin + '/lista?codigo=' + lista?.codigo }

  function copyText(text, msg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => toast(msg)).catch(() => copyFallback(text, msg))
    } else {
      copyFallback(text, msg)
    }
  }
  function copyFallback(text, msg) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(ta)
    ta.focus(); ta.select()
    try { document.execCommand('copy'); toast(msg) } catch { toast('Não foi possível copiar. Copie manualmente.', 'error') }
    document.body.removeChild(ta)
  }
  function copiarCodigo() { copyText(lista.codigo, 'Código copiado!') }
  function copiarLink() { copyText(getListaUrl(), 'Link copiado!') }
  function compartilharWhatsApp() {
    const url = getListaUrl()
    const msg = encodeURIComponent(`Oi! ${lista.nome_noivos} estão se casando e montaram a lista de presentes no La Provence.\n\nAcesse aqui: ${url}\n\nOu use o código: ${lista.codigo}`)
    window.open('https://wa.me/?text=' + msg, '_blank')
  }

  async function removerItem(listaItemId, catalogoId) {
    const compra = getActiveCompra(catalogoId)
    if (compra) { toast('Não é possível remover um item já presenteado.', 'error'); return }
    try {
      await listasService.removeItem(listaItemId)
      setListaItens((prev) => prev.filter((li) => li.id !== listaItemId))
      toast('Item removido da lista.')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  async function salvarMensagem() {
    if (!lista) return
    setSavingMsg(true)
    try {
      await listasService.update(lista.id, { mensagem_boas_vindas: welcomeMsg })
      toast('Mensagem salva com sucesso!')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSavingMsg(false)
    }
  }


  return (
    <div className="app-layout">
      <Toast toasts={toasts} />
      <Sidebar role="noivo" />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-text">
            <span className="label-caps">Bem-vindos</span>
            <h1>{lista?.nome_noivos ?? '...'}</h1>
          </div>
          <Link to="/catalogo" className="btn btn-verde">Adicionar Itens</Link>
        </div>

        {lista && (
          <div className="list-summary-card">
            <div className="label-caps" style={{ color: 'rgba(251,221,144,0.45)', marginBottom: '0.3rem' }}>Lista de Casamento</div>
            <div className="summary-noivos">{lista.nome_noivos}</div>
            {lista.data_casamento && <div className="summary-meta">Casamento em {formatDate(lista.data_casamento)}</div>}
            <div className="summary-code-row">
              <div className="summary-code" onClick={copiarCodigo} title="Clique para copiar" style={{ cursor: 'pointer' }}>{lista.codigo}</div>
              {diasRestantes !== null && <span className="days-badge">{diasRestantes} dias</span>}
              <button type="button" onClick={copiarLink} className="btn btn-outline btn-sm">Copiar Link</button>
              <button type="button" onClick={compartilharWhatsApp} className="btn btn-outline btn-sm">WhatsApp</button>
            </div>
          </div>
        )}

        {loading ? <SkeletonStatsGrid count={4} /> : null}
        <div className="stats-grid" style={{ marginBottom: '2rem', display: loading ? 'none' : undefined }}>
          <div className="stat-card"><span className="label-caps">Itens na Lista</span><div className="value">{totalItens}</div><div className="sub">presentes escolhidos</div></div>
          <div className="stat-card"><span className="label-caps">Presenteados</span><div className="value">{comprados}</div><div className="sub">{pct}% da lista</div></div>
          <div className="stat-card"><span className="label-caps">A presentear</span><div className="value">{totalItens - comprados}</div><div className="sub">ainda disponíveis</div></div>
          <div className="stat-card"><span className="label-caps">Total recebido</span><div className="value" style={{ fontSize: '1.4rem' }}>{formatMoney(valorTotal)}</div><div className="sub">em presentes</div></div>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="section-card-header">
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--verde)' }}>Progresso da Lista</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--texto-suave)' }}>{comprados} de {totalItens} presentes</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
          </div>
          {pct >= 80 && pct < 100 && <div className="progress-hint" style={{ color: 'var(--ouro)' }}>✨ Faltam poucos presentes para completar a lista!</div>}
          {pct === 100 && totalItens > 0 && <div className="progress-hint" style={{ color: '#27ae60' }}>🎉 Lista completada com sucesso!</div>}
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 className="section-card-title" style={{ marginBottom: '0.5rem' }}>Mensagem aos Convidados</h3>
          <p className="welcome-msg-label">Escreva uma mensagem especial que aparecerá no topo da sua lista pública para todos os convidados.</p>
          <textarea
            className="welcome-msg-textarea"
            value={welcomeMsg}
            onChange={(e) => setWelcomeMsg(e.target.value)}
            placeholder="Ex: Queridos amigos e familiares, estamos muito felizes em compartilhar este momento com vocês..."
          />
          <button type="button" className="btn btn-verde btn-sm" onClick={salvarMensagem} disabled={savingMsg}>
            {savingMsg ? 'Salvando...' : 'Salvar Mensagem'}
          </button>
        </div>

        <div className="card">
          <div className="section-card-header">
            <h3 className="section-card-title">Itens da Lista</h3>
            <Link to="/catalogo" className="btn btn-outline-dark btn-sm">Adicionar Itens</Link>
          </div>
          {loading ? <SkeletonGrid count={6} /> : totalItens === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>Nenhum item na lista ainda. Explore o catálogo e adicione os presentes que desejam.</p>
              <Link to="/catalogo" className="btn btn-verde btn-sm">Ver Catálogo</Link>
            </div>
          ) : (
            <div className="dashboard-items-grid">
              {listaItens.map((li) => {
                const item = li.catalogo
                if (!item) return null
                const compra = getActiveCompra(li.catalogo_id)
                const presenteado = compra && (compra.status_pagamento === 'Aprovado' || compra.status_pagamento === 'Confirmado')
                const emProcessamento = compra?.status_pagamento === 'Pendente'
                const bloqueado = presenteado || emProcessamento
                return (
                  <div key={li.id} className="dashboard-item-card" style={{ opacity: bloqueado ? 0.65 : 1 }}>
                    <div className="item-card-status-bar">
                      <span>{item.setor}</span>
                      <span className="item-status-dot-label">
                        <span className={`item-status-dot ${emProcessamento ? 'dot-processing' : presenteado ? 'dot-purchased' : 'dot-available'}`}></span>
                        {emProcessamento ? 'Em processamento' : presenteado ? 'Presenteado' : 'Disponível'}
                      </span>
                    </div>
                    <ItemCarousel item={item} context="dash" />
                    <div className="dashboard-item-body">
                      <div className="dashboard-item-name">{item.nome}</div>
                      <div className="dashboard-item-size">{item.tamanho}</div>
                      <div className="dashboard-item-price">{formatMoney(item.preco)}</div>
                      {bloqueado
                        ? <button type="button" className="btn btn-outline-dark btn-sm" style={{ width: '100%' }} onClick={() => setCompraModal({ compra, item })}>Ver Detalhes</button>
                        : <button type="button" className="btn btn-sm btn-rejeitar" style={{ width: '100%' }} onClick={() => removerItem(li.id, li.catalogo_id)}>Remover</button>
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Modal open={!!compraModal} onClose={() => setCompraModal(null)} title="Detalhe do Presente"
        footer={<button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setCompraModal(null)}>Fechar</button>}
      >
        {compraModal && (
          <>
            <div className="label-caps" style={{ marginBottom: '0.5rem' }}>
              {compraModal.compra.status_pagamento === 'Pendente' ? 'Item em processamento' : 'Item Presenteado'}
            </div>
            <h4 style={{ fontSize: '1.1rem', color: 'var(--verde)', marginBottom: '1.5rem' }}>{compraModal.item.nome}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.2rem' }}>Convidado</div><div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{compraModal.compra.nome_convidado}</div></div>
              <div><div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.2rem' }}>Telefone</div><div style={{ fontSize: '0.9rem' }}>{compraModal.compra.telefone || '—'}</div></div>
              <div><div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.2rem' }}>Valor</div><div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ouro)' }}>{formatMoney(compraModal.compra.valor_pago)}</div></div>
              <div><div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.2rem' }}>Forma de Pagamento</div><div style={{ fontSize: '0.9rem' }}>{compraModal.compra.forma_pagamento}</div></div>
              <div style={{ gridColumn: '1/-1' }}><div className="label-caps" style={{ fontSize: '0.6rem', marginBottom: '0.2rem' }}>Data da compra</div><div style={{ fontSize: '0.9rem' }}>{new Date(compraModal.compra.data_compra).toLocaleString('pt-BR')}</div></div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
