import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Modal from '../components/ui/Modal';
import ItemCarousel from '../components/ui/ItemCarousel';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { SkeletonStatsGrid, SkeletonGrid } from '../components/ui/Skeleton';
import useStore from '../store/useStore';
import { formatMoney, formatDate } from '../utils/formatters';

export default function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { currentUser, getListaByUser, atualizarListaItens, salvarMensagemLista, getComprasByLista, getComprasByItem, getItemById, marcarComprasVistas } = useStore();

  const [refresh, setRefresh] = useState(0);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [compraModal, setCompraModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, toast } = useToast();

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.role !== 'noivo') { navigate('/admin'); return; }
  }, [currentUser, navigate]);

  const lista = currentUser ? getListaByUser(currentUser.id) : null;

  useEffect(() => {
    if (lista) {
      setWelcomeMsg(lista.mensagem_boas_vindas || '');
      const compras = getComprasByLista(lista.id);
      const novas = compras.filter((c) => c.is_new_noivo);
      if (novas.length > 0) marcarComprasVistas('noivo', lista.id);
    }
  }, [lista?.id]);

  if (!currentUser || !lista) return null;

  const compras = getComprasByLista(lista.id);
  const totalItens = lista.itens.length;
  const comprados = lista.itens.filter((id) => {
    const c = getComprasByItem(lista.id, id);
    return c && (c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado');
  }).length;
  const pct = totalItens > 0 ? Math.round((comprados / totalItens) * 100) : 0;
  const diasRestantes = lista.data_casamento
    ? Math.max(0, Math.ceil((new Date(lista.data_casamento + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const valorTotal = compras.reduce((s, c) => {
    if (c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado') return s + Number(c.valor_pago);
    return s;
  }, 0);

  function getListaUrl() { return window.location.origin + '/lista?codigo=' + lista.codigo; }
  function copiarCodigo() { navigator.clipboard.writeText(lista.codigo).then(() => toast('Código copiado com sucesso!')); }
  function copiarLink() { navigator.clipboard.writeText(getListaUrl()).then(() => toast('Link copiado com sucesso!')).catch(() => toast('Erro ao copiar o link', 'error')); }
  function compartilharWhatsApp() {
    const url = getListaUrl();
    const msg = encodeURIComponent(`Oi! ${lista.nome_noivos} estão se casando e montaram a lista de presentes no La Provence.\n\nAcesse aqui: ${url}\n\nOu use o código: ${lista.codigo}`);
    window.open('https://wa.me/?text=' + msg, '_blank');
  }

  function removerItem(itemId) {
    const c = getComprasByItem(lista.id, itemId);
    if (c) { toast('Não é possível remover um item já presenteado.', 'error'); return; }
    atualizarListaItens(lista.id, lista.itens.filter((id) => id !== itemId));
    setRefresh((r) => r + 1);
    toast('Item removido da lista.');
  }

  function salvarMensagem() {
    salvarMensagemLista(lista.id, welcomeMsg);
    toast('Mensagem salva com sucesso!');
  }

  return (
    <div className="app-layout">
      <Toast toasts={toasts} />
      <Sidebar role="noivo" />
      <main className="main-content">
        <div className="page-header">
          <div className="page-header-text">
            <span className="label-caps">Bem-vindos</span>
            <h1>{lista.nome_noivos}</h1>
          </div>
          <Link to="/catalogo" className="btn btn-verde">Adicionar Itens</Link>
        </div>

        <div className="list-summary-card">
          <div className="label-caps" style={{ color: 'rgba(251,221,144,0.45)', marginBottom: '0.3rem' }}>Lista de Casamento</div>
          <div className="summary-noivos">{lista.nome_noivos}</div>
          {lista.data_casamento && <div className="summary-meta">Casamento em {formatDate(lista.data_casamento)}</div>}
          <div className="summary-code-row">
            <div className="summary-code" onClick={copiarCodigo} title="Clique para copiar">{lista.codigo}</div>
            {diasRestantes !== null && <span className="days-badge">{diasRestantes} dias</span>}
            <button onClick={copiarLink} className="btn btn-outline btn-sm">Copiar Link</button>
            <button onClick={compartilharWhatsApp} className="btn btn-outline btn-sm">WhatsApp</button>
          </div>
        </div>

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
          <button className="btn btn-verde btn-sm" onClick={salvarMensagem}>Salvar Mensagem</button>
        </div>

        <div className="card">
          <div className="section-card-header">
            <h3 className="section-card-title">Itens da Lista</h3>
            <Link to="/catalogo" className="btn btn-outline-dark btn-sm">Adicionar Itens</Link>
          </div>
          {totalItens === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>Nenhum item na lista ainda. Explore o catálogo e adicione os presentes que desejam.</p>
              <Link to="/catalogo" className="btn btn-verde btn-sm">Ver Catálogo</Link>
            </div>
          ) : (
            <div className="dashboard-items-grid">
              {lista.itens.map((itemId) => {
                const item = getItemById(itemId);
                if (!item) return null;
                const compra = getComprasByItem(lista.id, itemId);
                const presenteado = compra && (compra.status_pagamento === 'Aprovado' || compra.status_pagamento === 'Confirmado');
                return (
                  <div key={itemId} className="dashboard-item-card" style={{ opacity: presenteado ? 0.65 : 1 }}>
                    <div className="item-card-status-bar">
                      <span>{item.setor}</span>
                      <span className="item-status-dot-label">
                        <span className={`item-status-dot ${presenteado ? 'dot-purchased' : 'dot-available'}`}></span>
                        {presenteado ? 'Presenteado' : 'Disponível'}
                      </span>
                    </div>
                    <ItemCarousel item={item} context="dash" />
                    <div className="dashboard-item-body">
                      <div className="dashboard-item-name">{item.nome}</div>
                      <div className="dashboard-item-size">{item.tamanho}</div>
                      <div className="dashboard-item-price">{formatMoney(item.preco)}</div>
                      {presenteado
                        ? <button className="btn btn-outline-dark btn-sm" style={{ width: '100%' }} onClick={() => setCompraModal({ compra, item })}>Ver Detalhes</button>
                        : <button className="btn btn-sm btn-rejeitar" style={{ width: '100%' }} onClick={() => removerItem(itemId)}>Remover</button>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Modal open={!!compraModal} onClose={() => setCompraModal(null)} title="Detalhe do Presente"
        footer={<button className="btn btn-outline-dark btn-sm" onClick={() => setCompraModal(null)}>Fechar</button>}
      >
        {compraModal && (
          <>
            <div className="label-caps" style={{ marginBottom: '0.5rem' }}>Item Presenteado</div>
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
  );
}
