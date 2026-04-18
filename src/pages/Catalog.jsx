import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Modal from '../components/ui/Modal';
import ItemCarousel from '../components/ui/ItemCarousel';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { SkeletonGrid } from '../components/ui/Skeleton';
import useStore from '../store/useStore';
import { formatMoney } from '../utils/formatters';
import { SETORES } from '../data/seed';

export default function Catalog() {
  const navigate = useNavigate();
  const { currentUser, getCatalogo, getListaByUser, criarLista, atualizarListaItens, getComprasByItem } = useStore();
  const { toasts, toast } = useToast();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('padrao');
  const [setor, setSetor] = useState('');
  const [detailItem, setDetailItem] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 500); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.role !== 'noivo') { navigate('/admin'); }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const lista = getListaByUser(currentUser.id);
  const catalogo = getCatalogo().filter((i) => i.status === 'Ativo');

  function toggleItem(itemId) {
    let l = lista;
    if (!l) l = criarLista(currentUser.id, currentUser.nome, '', '', []);
    const inList = l.itens.includes(itemId);
    if (inList) {
      const compra = getComprasByItem(l.id, itemId);
      if (compra) { toast('Este item já foi presenteado e não pode ser removido.', 'error'); return; }
      toast('Item removido da lista.');
    } else {
      toast('Item adicionado à lista!');
    }
    atualizarListaItens(l.id, inList ? l.itens.filter((id) => id !== itemId) : [...l.itens, itemId]);
    setRefresh((r) => r + 1);
  }

  let filtered = [...catalogo];
  if (setor) filtered = filtered.filter((i) => i.setor === setor);
  if (search) filtered = filtered.filter((i) => i.nome.toLowerCase().includes(search.toLowerCase()) || i.descricao.toLowerCase().includes(search.toLowerCase()) || i.setor.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'menor') filtered.sort((a, b) => a.preco - b.preco);
  else if (sort === 'maior') filtered.sort((a, b) => b.preco - a.preco);
  else if (sort === 'az') filtered.sort((a, b) => a.nome.localeCompare(b.nome));

  const listaAtualizada = getListaByUser(currentUser.id);
  const listaItens = listaAtualizada ? listaAtualizada.itens.map((id) => catalogo.find((c) => c.id === id)).filter(Boolean) : [];
  const listaTotal = listaItens.reduce((s, i) => s + i.preco, 0);

  return (
    <div className="app-layout">
      <Toast toasts={toasts} />
      <Sidebar role="noivo" />

      <main className="main-content">
        <div className="page-header">
          <div className="page-header-text"><h1>Catálogo de Presentes</h1></div>
          <div className="search-bar">
            <input type="text" placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg></button>
          </div>
          <select className="sort-select catalog-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="padrao">Ordenar por Padrão</option>
            <option value="menor">Menor Preço</option>
            <option value="maior">Maior Preço</option>
            <option value="az">A - Z</option>
          </select>
        </div>

        <div className="catalog-layout" style={{ gridTemplateColumns: '1fr 300px' }}>
          <div>
            <div className="cat-filter-bar">
              <button className={`cat-filter${setor === '' ? ' active' : ''}`} onClick={() => setSetor('')}>Todos</button>
              {SETORES.map((s) => (
                <button key={s} className={`cat-filter${setor === s ? ' active' : ''}`} onClick={() => setSetor(s)}>{s}</button>
              ))}
            </div>

            <select className="cat-filter-select" value={setor} onChange={(e) => setSetor(e.target.value)}>
              <option value="">Todas as categorias</option>
              {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {loading ? <SkeletonGrid count={9} /> : filtered.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1', padding: '3rem' }}>
                <span className="script">Hmm...</span>
                <p>Nenhum item encontrado para esta busca ou filtro.</p>
              </div>
            ) : (
              <div className="catalog-grid catalog-grid-large">
                {filtered.map((item) => {
                  const inList = listaAtualizada?.itens.includes(item.id);
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
                          className={`btn btn-sm${inList ? '' : ' btn-verde'}`}
                          style={inList ? { background: 'rgba(0,48,13,0.08)', color: 'var(--verde)' } : {}}
                          onClick={() => toggleItem(item.id)}
                        >{inList ? 'Remover' : 'Adicionar'}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                  {listaItens.map((item) => (
                    <div key={item.id} className="mini-cart-item">
                      <div className="mini-cart-item-info">
                        <div className="mini-cart-item-name" title={item.nome}>{item.nome}</div>
                        <div className="mini-cart-item-setor">{item.setor}</div>
                        <div className="mini-cart-item-price">{formatMoney(item.preco)}</div>
                      </div>
                      <button className="mini-cart-remove" onClick={() => toggleItem(item.id)} title="Remover">&#215;</button>
                    </div>
                  ))}
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
              <button className="btn btn-outline-dark btn-sm" onClick={() => setDetailItem(null)}>Fechar</button>
              <button
                className={`btn btn-sm${listaAtualizada?.itens.includes(detailItem.id) ? '' : ' btn-verde'}`}
                style={listaAtualizada?.itens.includes(detailItem.id) ? { background: 'rgba(0,48,13,0.08)', color: 'var(--verde)' } : {}}
                onClick={() => { toggleItem(detailItem.id); setDetailItem(null); }}
              >{listaAtualizada?.itens.includes(detailItem.id) ? 'Remover' : 'Adicionar'}</button>
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
  );
}
