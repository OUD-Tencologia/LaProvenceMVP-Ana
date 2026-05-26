import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import useStore from '../store/useStore';
import { listasService } from '../services/listas.js';
import { formatDate } from '../utils/formatters';

function loadStoryStorage(uid) { try { return JSON.parse(localStorage.getItem(`story_${uid}`) || '{}'); } catch { return {}; } }
function saveStoryStorage(uid, updates) { try { localStorage.setItem(`story_${uid}`, JSON.stringify({ ...loadStoryStorage(uid), ...updates })); } catch {} }

const TEMPLATES = [
  { bg: '#00300D', fg: '#FBDD90', accent: '#EBAB0A', pattern: 'verde' },
  { bg: '#F5EDD8', fg: '#00300D', accent: '#EBAB0A', pattern: 'bege' },
];

function drawWrappedText(ctx, text, x, startY, maxWidth, lineHeight) {
  const explicitLines = text.split('\n');
  const lines = [];
  for (const explicitLine of explicitLines) {
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

export default function Story() {
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const canvasRef = useRef(null);
  const brandLogoRef = useRef(null);
  const brandLoadedRef = useRef(false);
  const photoImgRef = useRef(null);

  // Refs to avoid stale closure in async callbacks (logo onload)
  const nomeRef = useRef('');
  const dataRef = useRef('');
  const codigoRef = useRef('');
  const tplIdxRef = useRef(0);

  const [tplIdx, setTplIdx] = useState(0);
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [codigo, setCodigo] = useState('');
  const [photoSrc, setPhotoSrc] = useState(null);
  const [igHint, setIgHint] = useState(false);


  // Sync refs on every render so async callbacks always read current values
  nomeRef.current = nome;
  dataRef.current = data;
  codigoRef.current = codigo;
  tplIdxRef.current = tplIdx;

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return; }
    if (currentUser.role !== 'noivo' && currentUser.role !== 'gestor') { navigate('/auth'); return; }

    const saved = loadStoryStorage(currentUser.id);
    if (saved.tplIdx !== undefined) { setTplIdx(saved.tplIdx); tplIdxRef.current = saved.tplIdx; }

    if (currentUser.role === 'noivo') {
      listasService.getByUser(currentUser.id).then((lista) => {
        if (!lista) return;
        setNome(saved.nome !== undefined ? saved.nome : (lista.nome_noivos || ''));
        setCodigo(lista.codigo || '');
        if (lista.data_casamento) {
          const d = new Date(lista.data_casamento + 'T00:00:00');
          setData(d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
        }
        const photoToLoad = saved.photoSrc || lista.foto_casal;
        if (photoToLoad) {
          const img = new Image();
          img.onload = () => { photoImgRef.current = img; setPhotoSrc(photoToLoad); };
          img.src = photoToLoad;
        }
      }).catch(() => {});
    } else {
      if (saved.nome) setNome(saved.nome);
      if (saved.photoSrc) {
        const img = new Image();
        img.onload = () => { photoImgRef.current = img; setPhotoSrc(saved.photoSrc); };
        img.src = saved.photoSrc;
      }
    }

    // Pre-load brand logo — uses refs inside renderStory, so no stale closure issue
    const logoImg = new Image();
    logoImg.onload = () => { brandLoadedRef.current = true; brandLogoRef.current = logoImg; renderStory(); };
    logoImg.src = 'assets/img/LaProvenceDecor-Logo.png';
  }, [currentUser]);

  useEffect(() => { renderStory(); }, [tplIdx, nome, data, codigo, photoSrc]);

  useEffect(() => { if (currentUser) saveStoryStorage(currentUser.id, { tplIdx }); }, [tplIdx, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const t = setTimeout(() => saveStoryStorage(currentUser.id, { nome }), 400);
    return () => clearTimeout(t);
  }, [nome, currentUser]);

  function renderStory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1920;
    const tpl = TEMPLATES[tplIdxRef.current];
    const rawNome = nomeRef.current || 'Seus Nomes'
    const displayNome = rawNome.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    const displayData = dataRef.current || 'Data do Casamento';

    ctx.fillStyle = tpl.bg;
    ctx.fillRect(0, 0, W, H);

    // Ornamental borders
    ctx.strokeStyle = tpl.accent;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.35;
    ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.globalAlpha = 0.15;
    ctx.strokeRect(80, 80, W - 160, H - 160);
    ctx.globalAlpha = 1;

    ctx.fillStyle = tpl.accent;
    ctx.fillRect(W / 2 - 120, 200, 240, 2);

    // Photo circle
    const cx = W / 2, cy = 480, r = 215;
    if (photoImgRef.current) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const img = photoImgRef.current;
      const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
      const sw = img.width * scale, sh = img.height * scale;
      ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh);
      ctx.restore();
      ctx.strokeStyle = tpl.accent;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = tpl.accent;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = tpl.accent;
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Brand logo
    if (brandLoadedRef.current && brandLogoRef.current) {
      const logoW = 400;
      const logoH = Math.round(brandLogoRef.current.height * (logoW / brandLogoRef.current.width));
      ctx.drawImage(brandLogoRef.current, W / 2 - logoW / 2, 820, logoW, logoH);
    } else {
      ctx.fillStyle = tpl.accent;
      ctx.font = '500 56px "Great Vibes", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('La Provence Decor', W / 2, 900);
    }

    // Divider
    ctx.fillStyle = tpl.accent;
    ctx.fillRect(W / 2 - 90, 1030, 180, 2);

    // Couple name
    ctx.fillStyle = tpl.fg;
    ctx.font = '300 94px "Great Vibes", cursive';
    ctx.textAlign = 'center';
    const nomeLineH = 110;
    const nomeBaseY = 1160;
    const nomeLines = drawWrappedText(ctx, displayNome, W / 2, nomeBaseY, 880, nomeLineH);
    const afterNomeY = nomeBaseY + (nomeLines - 1) * nomeLineH;

    // Date
    ctx.fillStyle = tpl.fg;
    ctx.globalAlpha = 0.7;
    ctx.font = '400 34px Montserrat, sans-serif';
    ctx.fillText(displayData, W / 2, afterNomeY + 140);
    ctx.globalAlpha = 1;

    // Bottom divider
    ctx.fillStyle = tpl.accent;
    ctx.fillRect(W / 2 - 80, afterNomeY + 190, 160, 2);

    // Code
    if (codigoRef.current) {
      ctx.fillStyle = tpl.fg;
      ctx.globalAlpha = 0.5;
      ctx.font = '600 26px Montserrat, sans-serif';
      ctx.fillText('ACESSE COM O CÓDIGO', W / 2, afterNomeY + 270);
      ctx.globalAlpha = 1;
      ctx.fillStyle = tpl.bg === '#00300D' ? '#C4781A' : '#00300D';
      ctx.fillRect(W / 2 - 250, afterNomeY + 295, 500, 90);
      ctx.fillStyle = tpl.bg === '#00300D' ? '#FFFFFF' : '#FBDD90';
      ctx.font = 'bold 56px Montserrat, sans-serif';
      ctx.fillText(codigoRef.current, W / 2, afterNomeY + 360);
    }

    // URL hint
    ctx.fillStyle = tpl.fg;
    ctx.globalAlpha = 0.35;
    ctx.font = '300 26px Montserrat, sans-serif';
    ctx.globalAlpha = 1;
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => { photoImgRef.current = img; setPhotoSrc(ev.target.result); };
      img.src = ev.target.result;
      if (currentUser) saveStoryStorage(currentUser.id, { photoSrc: ev.target.result });
    };
    reader.readAsDataURL(file);
  }

  function downloadStory() {
    renderStory();
    const link = document.createElement('a');
    link.download = 'story-laprovence.png';
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
    link.download = 'story-laprovence.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isMobile) setTimeout(() => { window.location.href = 'instagram://story-camera'; }, 600);
    setIgHint(true);
    setTimeout(() => setIgHint(false), 8000);
  }

  if (!currentUser) return null;

  return (
    <div className="app-layout">
      <Sidebar role={currentUser.role === 'gestor' ? 'gestor' : 'noivo'} />
      <div className="story-layout">

        {/* Controls */}
        <div>
          <div className="page-header" style={{ marginBottom: '2rem' }}>
            <div className="page-header-text">
              <span className="label-caps">Compartilhe com estilo</span>
              <h1>Story para Instagram</h1>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="label-caps" style={{ marginBottom: '1rem' }}>Escolha o Template</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Provence Verde', 'Campestre Bege'].map((label, i) => (
                <button key={i} className={`btn btn-sm ${tplIdx === i ? 'btn-verde' : 'btn-outline-dark'}`} style={{ flex: 1 }} onClick={() => setTplIdx(i)}>{label}</button>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="label-caps" style={{ marginBottom: '1rem' }}>Foto dos Noivos</div>
            <label htmlFor="photo-input" style={{ cursor: 'pointer', display: 'block' }}>
              {photoSrc ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '0.9rem 1rem', background: 'rgba(0,48,13,0.04)', border: '1px solid rgba(0,48,13,0.15)', borderRadius: 4 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--ouro)', flexShrink: 0 }}>
                    <img src={photoSrc} alt="Foto dos noivos" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--verde)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Foto carregada</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', lineHeight: 1.4 }}>Aparece em recorte circular no story.<br />Clique para alterar.</div>
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ouro)', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                    Alterar
                  </div>
                </div>
              ) : (
                <div style={{ border: '2px dashed rgba(0,48,13,0.2)', borderRadius: 4, padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(0,48,13,0.02)' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(235,171,10,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.9rem' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--ouro)' }}>
                      <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--verde)', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Clique para adicionar foto</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', lineHeight: 1.5 }}>JPG ou PNG · Será exibida em recorte circular no story</div>
                </div>
              )}
            </label>
            <input type="file" id="photo-input" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="label-caps" style={{ marginBottom: '1rem' }}>Personalizar</div>
            <div className="form-group">
              <label>Nome dos Noivos</label>
              <textarea placeholder="Ex: Ana &amp; Lucas" value={nome} onChange={(e) => setNome(e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Data do Casamento
                <span style={{ fontSize: '0.6rem', background: 'rgba(0,48,13,0.08)', color: 'var(--verde)', padding: '0.15rem 0.5rem', borderRadius: 2, letterSpacing: '0.06em' }}>preenchido automaticamente</span>
              </label>
              <input type="text" readOnly value={data} style={{ background: 'var(--bege)', cursor: 'default', color: 'var(--texto-suave)' }} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Código da Lista
                <span style={{ fontSize: '0.6rem', background: 'rgba(0,48,13,0.08)', color: 'var(--verde)', padding: '0.15rem 0.5rem', borderRadius: 2, letterSpacing: '0.06em' }}>preenchido automaticamente</span>
              </label>
              <input type="text" readOnly value={codigo} style={{ background: 'var(--bege)', cursor: 'default', color: 'var(--texto-suave)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <button className="btn btn-verde" style={{ width: '100%' }} onClick={downloadStory}>Baixar Story (1080×1920px)</button>
            <button className="btn" style={{ width: '100%', background: 'var(--bege)', color: 'var(--verde)', border: '1.5px solid var(--ouro)', gap: '0.6rem' }} onClick={compartilharInstagram}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              Compartilhar no Instagram
            </button>
          </div>
          {igHint && (
            <p style={{ fontSize: '0.7rem', color: 'var(--texto-suave)', fontWeight: 300, lineHeight: 1.6, textAlign: 'center', marginTop: '0.5rem', background: 'rgba(131,58,180,0.07)', border: '1px solid rgba(131,58,180,0.18)', borderRadius: 4, padding: '0.7rem 1rem' }}>
              Imagem baixada! Abra o Instagram, vá em <strong>Câmera do Stories</strong> e selecione a imagem da sua galeria.
            </p>
          )}
        </div>

        {/* Canvas preview */}
        <div className="story-canvas-wrap">
          <div className="label-caps" style={{ color: 'var(--texto-suave)', marginBottom: '0.5rem' }}>Preview</div>
          <canvas ref={canvasRef} width={1080} height={1920} style={{ width: '100%', maxWidth: 360, height: 'auto', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,48,13,0.3)', display: 'block' }} />
          <p style={{ fontSize: '0.72rem', color: 'var(--texto-suave)', fontWeight: 300, textAlign: 'center' }}>Preview em escala reduzida · Baixe para ver em resolução completa (1080×1920px)</p>
        </div>
      </div>
    </div>
  );
}
