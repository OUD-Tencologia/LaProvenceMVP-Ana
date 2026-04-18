import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import InfoRow from '../components/ui/InfoRow';
import StatusBadge from '../components/ui/StatusBadge';
import { useToast } from '../hooks/useToast';
import useStore from '../store/useStore';
import { formatMoney, formatDate } from '../utils/formatters';
import { SETORES } from '../data/seed';

/* ─── helpers ─── */
const STORY_TEMPLATES = [
  { bg: '#00300D', fg: '#FBDD90', accent: '#EBAB0A' },
  { bg: '#F5EDD8', fg: '#00300D', accent: '#EBAB0A' },
];

function drawWrappedText(ctx, text, x, startY, maxWidth, lineHeight) {
  const lines = [];
  for (const explicitLine of text.split('\n')) {
    const words = explicitLine.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word; }
      else { current = test; }
    }
    if (current) lines.push(current);
    else if (explicitLine === '') lines.push('');
  }
  lines.forEach((line, i) => ctx.fillText(line, x, startY + i * lineHeight));
  return lines.length;
}

/* ─── StoryModal ─── */
function StoryModal({ lista, open, onClose }) {
  const canvasRef = useRef(null);
  const brandLogoRef = useRef(null);
  const brandLoadedRef = useRef(false);
  const photoImgRef = useRef(null);
  const tplIdxRef = useRef(0);
  const listaRef = useRef(lista);
  listaRef.current = lista;

  const [tplIdx, setTplIdx] = useState(0);
  const [photoSrc, setPhotoSrc] = useState(null);
  const [igHint, setIgHint] = useState(false);
  tplIdxRef.current = tplIdx;

  useEffect(() => {
    if (!open) { setPhotoSrc(null); photoImgRef.current = null; setTplIdx(0); setIgHint(false); return; }
    if (!brandLoadedRef.current) {
      const logoImg = new Image();
      logoImg.onload = () => { brandLoadedRef.current = true; brandLogoRef.current = logoImg; renderStory(); };
      logoImg.src = 'assets/img/LaProvenceDecor-Logo.png';
    }
    if (lista?.foto_casal) {
      const img = new Image();
      img.onload = () => { photoImgRef.current = img; setPhotoSrc(lista.foto_casal); };
      img.src = lista.foto_casal;
    } else {
      photoImgRef.current = null;
      setPhotoSrc(null);
    }
  }, [open, lista]);

  useEffect(() => { if (open) setTimeout(() => renderStory(), 0); }, [tplIdx, photoSrc, open]);

  function renderStory() {
    const canvas = canvasRef.current;
    const l = listaRef.current;
    if (!canvas || !l) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1920;
    const tpl = STORY_TEMPLATES[tplIdxRef.current];
    const displayNome = l.nome_noivos || 'Seus Nomes';
    const displayData = l.data_casamento
      ? new Date(l.data_casamento + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Data do Casamento';

    ctx.fillStyle = tpl.bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = tpl.accent; ctx.lineWidth = 3;
    ctx.globalAlpha = 0.35; ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.globalAlpha = 0.15; ctx.strokeRect(80, 80, W - 160, H - 160);
    ctx.globalAlpha = 1; ctx.fillStyle = tpl.accent; ctx.fillRect(W / 2 - 120, 200, 240, 2);

    const cx = W / 2, cy = 480, r = 215;
    if (photoImgRef.current) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      const img = photoImgRef.current;
      const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh); ctx.restore();
      ctx.strokeStyle = tpl.accent; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.fillStyle = tpl.accent; ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1; ctx.strokeStyle = tpl.accent; ctx.lineWidth = 4; ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    }
    if (brandLoadedRef.current && brandLogoRef.current) {
      const logoW = 400;
      const logoH = Math.round(brandLogoRef.current.height * (logoW / brandLogoRef.current.width));
      ctx.drawImage(brandLogoRef.current, W / 2 - logoW / 2, 820, logoW, logoH);
    } else {
      ctx.fillStyle = tpl.accent; ctx.font = '500 56px "Great Vibes", cursive';
      ctx.textAlign = 'center'; ctx.fillText('La Provence Decor', W / 2, 900);
    }
    ctx.fillStyle = tpl.accent; ctx.fillRect(W / 2 - 90, 1030, 180, 2);
    ctx.fillStyle = tpl.fg; ctx.font = '300 94px "Great Vibes", cursive'; ctx.textAlign = 'center';
    const nomeLineH = 110, nomeBaseY = 1160;
    const nomeLines = drawWrappedText(ctx, displayNome, W / 2, nomeBaseY, 880, nomeLineH);
    const afterNomeY = nomeBaseY + (nomeLines - 1) * nomeLineH;
    ctx.fillStyle = tpl.fg; ctx.globalAlpha = 0.7; ctx.font = '400 34px Montserrat, sans-serif';
    ctx.fillText(displayData, W / 2, afterNomeY + 140);
    ctx.globalAlpha = 1; ctx.fillStyle = tpl.accent; ctx.fillRect(W / 2 - 80, afterNomeY + 190, 160, 2);
    if (l.codigo) {
      ctx.fillStyle = tpl.fg; ctx.globalAlpha = 0.5; ctx.font = '600 26px Montserrat, sans-serif';
      ctx.fillText('ACESSE COM O CÓDIGO', W / 2, afterNomeY + 270);
      ctx.globalAlpha = 1;
      ctx.fillStyle = tpl.bg === '#00300D' ? '#C4781A' : '#00300D';
      ctx.fillRect(W / 2 - 250, afterNomeY + 295, 500, 90);
      ctx.fillStyle = tpl.bg === '#00300D' ? '#FFFFFF' : '#FBDD90';
      ctx.font = 'bold 56px Montserrat, sans-serif'; ctx.fillText(l.codigo, W / 2, afterNomeY + 360);
    }
    ctx.fillStyle = tpl.fg; ctx.globalAlpha = 0.35; ctx.font = '300 26px Montserrat, sans-serif'; ctx.globalAlpha = 1;
  }

  function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => { photoImgRef.current = img; setPhotoSrc(ev.target.result); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function downloadStory() {
    renderStory();
    const link = document.createElement('a');
    link.download = `story-${lista?.codigo || 'laprovence'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  }

  async function compartilharInstagram() {
    renderStory();
    const canvas = canvasRef.current;
    if (typeof navigator.canShare === 'function') {
      try {
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const file = new File([blob], 'story-laprovence.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Story La Provence Decor' }); return; }
      } catch (e) { if (e.name === 'AbortError') return; }
    }
    const link = document.createElement('a');
    link.download = `story-${lista?.codigo || 'laprovence'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) setTimeout(() => { window.location.href = 'instagram://story-camera'; }, 600);
    setIgHint(true);
    setTimeout(() => setIgHint(false), 8000);
  }

  const IG_SVG = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lista ? `Story — ${lista.nome_noivos}` : 'Story'}
      maxWidth="820px"
      footer={
        <>
          <button className="btn btn-outline-dark btn-sm" onClick={onClose}>Fechar</button>
          <div className="story-template-btns">
            <button className="btn btn-sm btn-story-ig" onClick={compartilharInstagram}>
              {IG_SVG} Compartilhar no Instagram
            </button>
            <button className="btn btn-verde" onClick={downloadStory}>Baixar (1080×1920px)</button>
          </div>
        </>
      }
    >
      {lista && (
        <div className="story-modal-grid">
          <div>
            <div className="story-template-row">
              <div className="label-caps" style={{ marginBottom: '0.7rem' }}>Template</div>
              <div className="story-template-btns">
                {['Provence Verde', 'Campestre Bege'].map((label, i) => (
                  <button key={i} className={`btn btn-sm ${tplIdx === i ? 'btn-verde' : 'btn-outline-dark'}`} style={{ flex: 1 }} onClick={() => setTplIdx(i)}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <div className="label-caps" style={{ marginBottom: '0.7rem' }}>Foto do Casal</div>
              <label htmlFor="story-photo-upload" className="story-photo-upload">
                {photoSrc ? (
                  <div className="story-photo-loaded">
                    <div className="story-photo-loaded__thumb">
                      <img src={photoSrc} alt="" />
                    </div>
                    <div className="story-photo-loaded__info">
                      <div className="story-photo-loaded__title">Foto carregada</div>
                      <div className="story-photo-loaded__hint">Clique para alterar</div>
                    </div>
                    <span className="story-photo-loaded__action">Alterar</span>
                  </div>
                ) : (
                  <div className="story-photo-empty">
                    <div className="story-photo-empty__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--ouro)' }}><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" /></svg>
                    </div>
                    <div className="story-photo-empty__title">Clique para adicionar foto</div>
                    <div className="story-photo-empty__hint">JPG, PNG · Recorte circular</div>
                  </div>
                )}
              </label>
              <input type="file" id="story-photo-upload" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </div>

            <div className="story-data-block">
              {[
                { label: 'Noivos', value: lista.nome_noivos },
                lista.data_casamento ? { label: 'Casamento', value: formatDate(lista.data_casamento) } : null,
                { label: 'Código', value: `#${lista.codigo}`, highlight: true },
              ].filter(Boolean).map(({ label, value, highlight }) => (
                <div key={label} className="story-data-row">
                  <span className="story-data-row__label">{label}</span>
                  <span className={`story-data-row__value${highlight ? ' story-data-row__value--highlight' : ''}`}>{value}</span>
                </div>
              ))}
            </div>

            {igHint && <p className="story-ig-hint">Imagem baixada! Abra o Instagram → <strong>Câmera do Stories</strong> → selecione na galeria.</p>}
          </div>

          <div className="story-canvas-preview">
            <div className="label-caps story-canvas-label">Preview</div>
            <canvas
              ref={canvasRef}
              width={1080}
              height={1920}
              style={{ width: '100%', maxWidth: 190, height: 'auto', borderRadius: 6, boxShadow: '0 12px 32px rgba(0,48,13,0.25)', display: 'block', margin: '0 auto' }}
            />
            <p className="story-canvas-hint">Preview reduzido · baixe para 1080×1920px</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ─── Admin page ─── */
export default function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'listas';

  const {
    currentUser, getListas, getCatalogo, getComprasByLista, getItemById,
    aprovarCompra, rejeitarCompra, salvarItem, inativarItem, getPremontadas, salvarPremontada,
    arquivarLista, getUserById,
  } = useStore();
  const { toasts, toast } = useToast();

  const [search, setSearch] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [catSetor, setCatSetor] = useState('');
  const [listaModal, setListaModal] = useState(null);
  const [listaModalTab, setListaModalTab] = useState('itens');
  const [compraDetalheModal, setCompraDetalheModal] = useState(null);
  const [archiveConfirmModal, setArchiveConfirmModal] = useState(null);
  const [casalInfoModal, setCasalInfoModal] = useState(null);
  const [listaStoryModal, setListaStoryModal] = useState(null);
  const [itemModal, setItemModal] = useState(null);
  const [pmModal, setPmModal] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.role !== 'gestor') { navigate('/dashboard'); }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const listas = getListas().filter((l) => l.status === 'Ativa');
  const catalogo = getCatalogo();
  const premontadas = getPremontadas();

  const todasCompras = listas.flatMap((l) => getComprasByLista(l.id));
  const totalArrecadado = todasCompras.filter((c) => c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado').reduce((s, c) => s + Number(c.valor_pago), 0);
  const pendentes = todasCompras.filter((c) => c.status_pagamento === 'Pendente').length;

  const filteredListas = listas.filter((l) => !search || l.nome_noivos.toLowerCase().includes(search.toLowerCase()) || l.codigo.toLowerCase().includes(search.toLowerCase()));

  let filteredCat = catalogo;
  if (catSetor) filteredCat = filteredCat.filter((i) => i.setor === catSetor);
  if (catSearch) filteredCat = filteredCat.filter((i) => i.nome.toLowerCase().includes(catSearch.toLowerCase()));

  function handleAprovar(compraId) {
    aprovarCompra(compraId);
    setRefresh((r) => r + 1);
    toast('Pagamento aprovado!');
    if (listaModal) setListaModal({ ...listaModal, compras: getComprasByLista(listaModal.lista.id) });
  }

  function handleRejeitar(compraId) {
    rejeitarCompra(compraId);
    setRefresh((r) => r + 1);
    toast('Compra rejeitada.');
    if (listaModal) setListaModal({ ...listaModal, compras: getComprasByLista(listaModal.lista.id) });
  }

  function handleArquivar() {
    arquivarLista(archiveConfirmModal.id);
    setArchiveConfirmModal(null);
    setListaModal(null);
    setCompraDetalheModal(null);
    setRefresh((r) => r + 1);
    toast('Lista arquivada.');
  }

  function handleSalvarItem() {
    if (!itemModal?.nome || !itemModal?.preco) { toast('Preencha nome e preço.', 'error'); return; }
    salvarItem({
      id: itemModal.id || null,
      nome: itemModal.nome,
      tamanho: itemModal.tamanho || '',
      setor: itemModal.setor || 'Mesa posta',
      preco: parseFloat(itemModal.preco) || 0,
      estoque: parseInt(itemModal.estoque) || 0,
      quantidade: parseInt(itemModal.quantidade) || 1,
      descricao: itemModal.descricao || '',
      marca: itemModal.marca || '',
      imgs: itemModal.imgs || [],
      status: itemModal.status || 'Ativo',
    });
    setItemModal(null);
    setRefresh((r) => r + 1);
    toast('Item salvo!');
  }

  function handleItemImgUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let { width, height } = img;
        if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
        else if (height > MAX) { width *= MAX / height; height = MAX; }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const b64 = canvas.toDataURL('image/jpeg', 0.7);
        setItemModal((m) => ({ ...m, imgs: [b64, ...(m.imgs || []).filter((x) => !x.startsWith('data:'))] }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleSalvarPremontada() {
    if (!pmModal) return;
    salvarPremontada({ id: pmModal.id, nome: pmModal.nome, descricao: pmModal.descricao, badge: pmModal.badge, img: pmModal.img, itens: pmModal.selectedItens, popular: pmModal.popular });
    setPmModal(null);
    setRefresh((r) => r + 1);
    toast('Lista pré-montada salva!');
  }

  function openListaModal(lista) {
    setListaModal({ lista, compras: getComprasByLista(lista.id) });
    setListaModalTab('itens');
  }

  function closeListaModal() {
    setListaModal(null);
    setCompraDetalheModal(null);
  }

  function openCasalInfo(lista) {
    const user = getUserById(lista.user_id);
    setCasalInfoModal({ lista, user });
  }

  const SEARCH_SVG = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>;

  return (
    <div className="app-layout">
      <Toast toasts={toasts} />
      <Sidebar role="gestor" />

      <main className="main-content">

        {/* ── TAB LISTAS ── */}
        {tab === 'listas' && (
          <>
            <div className="page-header">
              <div className="page-header-text">
                <span className="label-caps">Visão geral</span>
                <h1>Listas de Casamento</h1>
              </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card"><span className="label-caps">Listas Ativas</span><div className="value">{listas.length}</div></div>
              <div className="stat-card"><span className="label-caps">Total Compras</span><div className="value">{todasCompras.length}</div></div>
              <div className="stat-card"><span className="label-caps">Pendentes</span><div className="value">{pendentes}</div></div>
              <div className="stat-card"><span className="label-caps">Total Arrecadado</span><div className="value" style={{ fontSize: '1.2rem' }}>{formatMoney(totalArrecadado)}</div></div>
            </div>

            <div className="card">
              <div className="section-card-header">
                <h3 className="section-card-title">Todas as Listas</h3>
                <div className="search-bar" style={{ maxWidth: 260 }}>
                  <input type="text" placeholder="Buscar noivos..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  <button>{SEARCH_SVG}</button>
                </div>
              </div>

              <div className="lists-grid">
                {filteredListas.length === 0 && <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>Nenhuma lista encontrada.</p>}
                {filteredListas.map((lista) => {
                  const compras = getComprasByLista(lista.id);
                  const aprovadas = compras.filter((c) => c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado');
                  const pend = compras.filter((c) => c.status_pagamento === 'Pendente');
                  return (
                    <div key={lista.id} className="list-card">
                      {lista.foto_casal && <div className="list-card-photo" style={{ backgroundImage: `url(${lista.foto_casal})` }} />}
                      <div className="list-card-body">
                        <div className="list-card-code">#{lista.codigo}</div>
                        <div className="list-card-name">{lista.nome_noivos}</div>
                        {lista.data_casamento && <div className="list-card-date">Casamento: {formatDate(lista.data_casamento)}</div>}
                        <div className="chips-row">
                          <span className="chip chip--default">{lista.itens.length} itens</span>
                          <span className="chip chip--green">{aprovadas.length} aprovados</span>
                          {pend.length > 0 && <span className="chip chip--yellow">{pend.length} pendente{pend.length > 1 ? 's' : ''}</span>}
                        </div>
                        <div className="list-card-actions">
                          <button className="btn btn-outline-dark btn-sm" style={{ flex: 1 }} onClick={() => openListaModal(lista)}>Ver Detalhes</button>
                          <button
                            className="btn btn-sm btn-story-ig"
                            title="Gerar Story Instagram"
                            onClick={() => setListaStoryModal(lista)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── TAB CATÁLOGO ── */}
        {tab === 'catalogo' && (
          <>
            <div className="page-header">
              <div className="page-header-text"><span className="label-caps">Gestão de Produtos</span><h1>Catálogo de Itens</h1></div>
              <button className="btn btn-verde" onClick={() => setItemModal({ nome: '', tamanho: '', setor: 'Mesa posta', preco: '', estoque: '', quantidade: 1, descricao: '', marca: '', imgs: [], status: 'Ativo' })}>Adicionar Item</button>
            </div>

            <div className="admin-filter-row">
              <div className="search-bar" style={{ maxWidth: 320, flexShrink: 0 }}>
                <input type="text" placeholder="Buscar item..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                <button><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg></button>
              </div>
              <div className="cat-filter-bar" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                <button className={`cat-filter${catSetor === '' ? ' active' : ''}`} onClick={() => setCatSetor('')}>Todos</button>
                {SETORES.map((s) => <button key={s} className={`cat-filter${catSetor === s ? ' active' : ''}`} onClick={() => setCatSetor(s)}>{s}</button>)}
              </div>
            </div>

            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 52 }}></th>
                      <th>Nome</th><th>Setor</th><th>Tamanho</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCat.map((item) => (
                      <tr key={item.id} style={{ opacity: item.status === 'Inativo' ? 0.5 : 1 }}>
                        <td>
                          {item.imgs?.[0] && <img src={item.imgs[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { e.target.style.display = 'none'; }} />}
                        </td>
                        <td className="table-item-name">{item.nome}</td>
                        <td className="table-item-small">{item.setor}</td>
                        <td className="table-item-small">{item.tamanho}</td>
                        <td className="table-item-price">{formatMoney(item.preco)}</td>
                        <td className="table-item-qty">{item.estoque}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button className="btn btn-outline-dark btn-sm" onClick={() => setItemModal({ ...item })}>Editar</button>
                            <button
                              className={`btn btn-sm btn-toggle-${item.status === 'Ativo' ? 'inativar' : 'ativar'}`}
                              onClick={() => { inativarItem(item.id); setRefresh((r) => r + 1); toast(item.status === 'Ativo' ? 'Item inativado.' : 'Item ativado.'); }}
                            >{item.status === 'Ativo' ? 'Inativar' : 'Ativar'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── TAB PRÉ-MONTADAS ── */}
        {tab === 'premontadas' && (
          <>
            <div className="page-header">
              <div className="page-header-text"><span className="label-caps">Templates</span><h1>Listas Pré-montadas</h1></div>
            </div>
            <div className="lists-grid">
              {premontadas.map((pm) => (
                <div key={pm.id} className="list-card">
                  {pm.img && <div className="list-card-photo" style={{ backgroundImage: `url(${pm.img})` }} />}
                  <div className="pm-card-body">
                    <div className="label-caps pm-card-badge">{pm.badge}</div>
                    <div className="pm-card-name">{pm.nome}</div>
                    <div className="pm-card-count">{pm.itens.length} itens</div>
                    <button className="btn btn-outline-dark btn-sm" onClick={() => setPmModal({ ...pm, selectedItens: [...(pm.itens || [])] })}>Editar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── MODAL DETALHE DA LISTA ── */}
      <Modal
        open={!!listaModal}
        onClose={closeListaModal}
        title={listaModal ? `${listaModal.lista.nome_noivos} — #${listaModal.lista.codigo}` : ''}
        maxWidth="900px"
        footer={
          listaModal ? (
            <>
              <button className="btn btn-sm btn-archive" onClick={() => setArchiveConfirmModal(listaModal.lista)}>
                Arquivar Lista
              </button>
              <button className="btn btn-outline-dark btn-sm" onClick={closeListaModal}>Fechar</button>
            </>
          ) : null
        }
      >
        {listaModal && (
          <>
            <div className="modal-info-header">
              {listaModal.lista.foto_casal && (
                <img src={listaModal.lista.foto_casal} alt="" className="couple-avatar couple-avatar--lg" />
              )}
              <div className="modal-info-header__meta">
                <div className="modal-info-header__name">{listaModal.lista.nome_noivos}</div>
                {listaModal.lista.data_casamento && (
                  <div className="modal-info-header__sub">Casamento em {formatDate(listaModal.lista.data_casamento)}</div>
                )}
                <div className="modal-info-header__links">
                  <span style={{ color: 'var(--texto-suave)' }}>Código: <strong style={{ color: 'var(--ouro)' }}>#{listaModal.lista.codigo}</strong></span>
                  <Link to={`/lista?codigo=${listaModal.lista.codigo}`} target="_blank" style={{ color: 'var(--verde)', fontWeight: 600 }}>
                    Ver Lista Pública →
                  </Link>
                </div>
                <div className="modal-info-header__actions">
                  <button className="btn btn-sm btn-outline-dark btn-sm-icon" onClick={() => openCasalInfo(listaModal.lista)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                    Dados do Casal
                  </button>
                  <button className="btn btn-sm btn-story-ig" onClick={() => { closeListaModal(); setListaStoryModal(listaModal.lista); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                    Gerar Story
                  </button>
                </div>
                {listaModal.lista.mensagem_boas_vindas && (
                  <div className="modal-info-header__quote">"{listaModal.lista.mensagem_boas_vindas}"</div>
                )}
              </div>
              <div className="modal-stats">
                <div>
                  <div className="modal-stat__value" style={{ color: 'var(--verde)' }}>{listaModal.lista.itens.length}</div>
                  <div className="modal-stat__label">Itens</div>
                </div>
                <div>
                  <div className="modal-stat__value" style={{ color: '#27ae60' }}>
                    {listaModal.compras.filter((c) => c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado').length}
                  </div>
                  <div className="modal-stat__label">Aprovados</div>
                </div>
                {listaModal.compras.filter((c) => c.status_pagamento === 'Pendente').length > 0 && (
                  <div>
                    <div className="modal-stat__value" style={{ color: '#f39c12' }}>
                      {listaModal.compras.filter((c) => c.status_pagamento === 'Pendente').length}
                    </div>
                    <div className="modal-stat__label">Pendentes</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-tabs">
              {[
                { key: 'itens', label: `Itens (${listaModal.lista.itens.length})` },
                { key: 'compras', label: `Compras (${listaModal.compras.length})` },
              ].map(({ key, label }) => (
                <button key={key} className={`modal-tab-btn${listaModalTab === key ? ' active' : ''}`} onClick={() => setListaModalTab(key)}>
                  {label}
                </button>
              ))}
            </div>

            {listaModalTab === 'itens' && (
              <div className="modal-items-grid">
                {listaModal.lista.itens.length === 0 && (
                  <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem', gridColumn: '1/-1' }}>Nenhum item na lista.</p>
                )}
                {listaModal.lista.itens.map((itemId) => {
                  const item = getItemById(itemId);
                  if (!item) return null;
                  const compra = listaModal.compras.find((c) => c.item_id === itemId);
                  return (
                    <div
                      key={itemId}
                      onClick={() => compra && setCompraDetalheModal({ item, compra })}
                      title={compra ? 'Clique para ver quem comprou' : ''}
                      className={`item-thumb item-thumb--${compra ? 'purchased' : 'available'}`}
                    >
                      {item.imgs?.[0] ? (
                        <img src={item.imgs[0]} alt="" className="item-thumb__img" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="item-thumb__placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.2 }}><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                        </div>
                      )}
                      <div className="item-thumb__body">
                        <div className="item-thumb__name">{item.nome}</div>
                        <div className="item-thumb__price">{formatMoney(item.preco)}</div>
                        <span className={`status-badge status-badge--${compra ? 'purchased' : 'available'}`}>
                          {compra ? '✓ Presenteado' : 'Disponível'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {listaModalTab === 'compras' && (
              listaModal.compras.length === 0 ? (
                <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>Nenhuma compra registrada.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Item</th><th>Convidado</th><th>Valor</th><th>Pagamento</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                      {listaModal.compras.map((compra) => {
                        const item = getItemById(compra.item_id);
                        return (
                          <tr key={compra.id}>
                            <td className="table-item-name">{item?.nome || compra.item_id}</td>
                            <td style={{ fontSize: '0.8rem' }}>{compra.nome_convidado}</td>
                            <td className="table-item-price">{formatMoney(compra.valor_pago)}</td>
                            <td className="table-item-small">{compra.forma_pagamento}</td>
                            <td><StatusBadge status={compra.status_pagamento} /></td>
                            <td>
                              {compra.status_pagamento === 'Pendente' && (
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  <button className="btn btn-sm btn-aprovar" onClick={() => handleAprovar(compra.id)}>Aprovar</button>
                                  <button className="btn btn-sm btn-rejeitar" onClick={() => handleRejeitar(compra.id)}>Rejeitar</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </Modal>

      {/* ── MODAL DADOS DO CASAL ── */}
      <Modal
        open={!!casalInfoModal}
        onClose={() => setCasalInfoModal(null)}
        title="Informações do Casal"
        maxWidth="440px"
        footer={<button className="btn btn-outline-dark btn-sm" onClick={() => setCasalInfoModal(null)}>Fechar</button>}
      >
        {casalInfoModal && (
          <div>
            <div className="modal-info-header modal-info-header--sm">
              {casalInfoModal.lista.foto_casal && (
                <img src={casalInfoModal.lista.foto_casal} alt="" className="couple-avatar couple-avatar--sm" />
              )}
              <div>
                <div className="modal-info-header__name modal-info-header__name--sm">{casalInfoModal.lista.nome_noivos}</div>
                {casalInfoModal.lista.data_casamento && (
                  <div className="modal-info-header__sub modal-info-header__sub--sm">
                    Casamento em {formatDate(casalInfoModal.lista.data_casamento)}
                  </div>
                )}
              </div>
            </div>

            <div className="info-section-title">Dados de Contato</div>

            {casalInfoModal.user ? (
              <>
                <InfoRow label="Nome Completo">{casalInfoModal.user.nome}</InfoRow>
                <InfoRow label="E-mail">{casalInfoModal.user.email}</InfoRow>
                <InfoRow label="Telefone">{casalInfoModal.user.telefone || casalInfoModal.lista.telefone || '—'}</InfoRow>
              </>
            ) : (
              <InfoRow label="Telefone">{casalInfoModal.lista.telefone || '—'}</InfoRow>
            )}
          </div>
        )}
      </Modal>

      {/* ── MODAL DETALHES DA COMPRA ── */}
      <Modal
        open={!!compraDetalheModal}
        onClose={() => setCompraDetalheModal(null)}
        title="Detalhes do Presente"
        maxWidth="460px"
        footer={<button className="btn btn-outline-dark btn-sm" onClick={() => setCompraDetalheModal(null)}>Fechar</button>}
      >
        {compraDetalheModal && (
          <div>
            <div className="modal-info-header modal-info-header--sm">
              {compraDetalheModal.item.imgs?.[0] && (
                <img src={compraDetalheModal.item.imgs[0]} alt="" style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              <div className="modal-info-header__meta">
                <div className="modal-info-header__name" style={{ fontSize: '0.9rem' }}>{compraDetalheModal.item.nome}</div>
                <div className="modal-info-header__sub modal-info-header__sub--sm">
                  {compraDetalheModal.item.setor}{compraDetalheModal.item.tamanho ? ` · ${compraDetalheModal.item.tamanho}` : ''}
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--ouro)', fontSize: '1.05rem', flexShrink: 0 }}>{formatMoney(compraDetalheModal.compra.valor_pago)}</div>
            </div>
            <div className="info-section-title">Informações do Presenteador</div>
            <InfoRow label="Nome Completo">{compraDetalheModal.compra.nome_convidado}</InfoRow>
            <InfoRow label="CPF">{compraDetalheModal.compra.cpf}</InfoRow>
            <InfoRow label="Telefone">{compraDetalheModal.compra.telefone}</InfoRow>
            <InfoRow label="Forma de Pagamento">{compraDetalheModal.compra.forma_pagamento}</InfoRow>
            <InfoRow label="Status">{compraDetalheModal.compra.status_pagamento}</InfoRow>
            <InfoRow label="Data da Compra">
              {new Date(compraDetalheModal.compra.data_compra).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </InfoRow>
          </div>
        )}
      </Modal>

      {/* ── MODAL CONFIRMAR ARQUIVAMENTO ── */}
      <Modal
        open={!!archiveConfirmModal}
        onClose={() => setArchiveConfirmModal(null)}
        title="Arquivar Lista"
        maxWidth="420px"
        footer={
          <>
            <button className="btn btn-outline-dark btn-sm" onClick={() => setArchiveConfirmModal(null)}>Cancelar</button>
            <button className="btn btn-sm btn-confirm-archive" onClick={handleArquivar}>Sim, Arquivar Lista</button>
          </>
        }
      >
        {archiveConfirmModal && (
          <div className="archive-confirm">
            <div className="archive-confirm__icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#c0392b"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
            </div>
            <p className="archive-confirm__subtitle">Deseja arquivar a lista de</p>
            <p className="archive-confirm__name">{archiveConfirmModal.nome_noivos}?</p>
            <p className="archive-confirm__warning">A lista será inativada e não ficará mais visível ao público. Esta ação pode ser revertida manualmente.</p>
          </div>
        )}
      </Modal>

      {/* ── MODAL STORY ── */}
      <StoryModal lista={listaStoryModal} open={!!listaStoryModal} onClose={() => setListaStoryModal(null)} />

      {/* ── MODAL ITEM CRUD ── */}
      <Modal open={!!itemModal} onClose={() => setItemModal(null)} title={itemModal?.id ? 'Editar Item' : 'Novo Item'} maxWidth="580px"
        footer={
          <>
            <button className="btn btn-outline-dark btn-sm" onClick={() => setItemModal(null)}>Cancelar</button>
            <button className="btn btn-verde" onClick={handleSalvarItem}>Salvar Item</button>
          </>
        }
      >
        {itemModal && (
          <div className="item-form-grid">
            <div className="form-group full">
              <label>Nome do Item</label>
              <input type="text" placeholder="Ex: Jogo de Panelas" value={itemModal.nome} onChange={(e) => setItemModal({ ...itemModal, nome: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Tamanho / Dimensões</label>
              <input type="text" placeholder="Ex: 7 peças" value={itemModal.tamanho} onChange={(e) => setItemModal({ ...itemModal, tamanho: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Setor</label>
              <select value={itemModal.setor} onChange={(e) => setItemModal({ ...itemModal, setor: e.target.value })}>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Preço (R$)</label>
              <input type="number" placeholder="0.00" min="0" step="0.01" value={itemModal.preco} onChange={(e) => setItemModal({ ...itemModal, preco: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Estoque</label>
              <input type="number" placeholder="0" min="0" value={itemModal.estoque} onChange={(e) => setItemModal({ ...itemModal, estoque: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Quantidade por kit</label>
              <input type="number" placeholder="1" min="1" value={itemModal.quantidade} onChange={(e) => setItemModal({ ...itemModal, quantidade: e.target.value })} />
            </div>
            <div className="form-group full">
              <label>Foto do Produto</label>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="text" placeholder="Cole a URL da imagem" style={{ flex: 1 }} value={itemModal.imgs?.[0] || ''} onChange={(e) => setItemModal({ ...itemModal, imgs: e.target.value ? [e.target.value] : [] })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <label htmlFor="item-img-upload" className="btn-upload-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" /></svg>
                  Enviar Imagem
                </label>
                <input type="file" id="item-img-upload" accept="image/*" style={{ display: 'none' }} onChange={handleItemImgUpload} />
                {itemModal.imgs?.[0] && <img src={itemModal.imgs[0]} alt="preview" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(0,48,13,0.15)' }} onError={(e) => { e.target.style.display = 'none'; }} />}
              </div>
            </div>
            <div className="form-group full">
              <label>Descrição</label>
              <textarea placeholder="Descrição detalhada do item..." value={itemModal.descricao} onChange={(e) => setItemModal({ ...itemModal, descricao: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL PRÉ-MONTADA ── */}
      <Modal open={!!pmModal} onClose={() => setPmModal(null)} title={pmModal ? `Editar: ${pmModal.nome}` : ''} maxWidth="660px"
        footer={
          <>
            <button className="btn btn-outline-dark btn-sm" onClick={() => setPmModal(null)}>Cancelar</button>
            <button className="btn btn-verde" onClick={handleSalvarPremontada}>Salvar</button>
          </>
        }
      >
        {pmModal && (
          <>
            <div className="pm-modal-hint">Selecione os itens que farão parte desta lista pré-montada:</div>
            <div className="pm-items-grid">
              {catalogo.filter((i) => i.status === 'Ativo').map((item) => {
                const checked = pmModal.selectedItens.includes(item.id);
                return (
                  <label key={item.id} className={`pm-item-label${checked ? ' checked' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => {
                      const itens = checked ? pmModal.selectedItens.filter((id) => id !== item.id) : [...pmModal.selectedItens, item.id];
                      setPmModal({ ...pmModal, selectedItens: itens });
                    }} style={{ width: 'auto', flexShrink: 0 }} />
                    <span className="pm-item-name">{item.nome}</span>
                  </label>
                );
              })}
            </div>
            <div className="pm-modal-count">{pmModal.selectedItens.length} itens selecionados</div>
          </>
        )}
      </Modal>
    </div>
  );
}
