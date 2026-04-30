import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Modal from '../components/ui/Modal'
import Toast from '../components/ui/Toast'
import InfoRow from '../components/ui/InfoRow'
import StatusBadge from '../components/ui/StatusBadge'
import { useToast } from '../hooks/useToast'
import useStore from '../store/useStore'
import { formatMoney, formatDate, maskMoney, parseMoney, numToMaskMoney } from '../utils/formatters'
import { catalogoService } from '../services/catalogo.js'
import { listasService } from '../services/listas.js'
import { comprasService } from '../services/compras.js'
import { premontadasService } from '../services/premontadas.js'
import { SETOR_DISPLAY } from '../services/auth.js'

const SETORES = Object.values(SETOR_DISPLAY)

/* ─── helpers ─── */
const STORY_TEMPLATES = [
  { bg: '#00300D', fg: '#FBDD90', accent: '#EBAB0A' },
  { bg: '#F5EDD8', fg: '#00300D', accent: '#EBAB0A' },
]

function drawWrappedText(ctx, text, x, startY, maxWidth, lineHeight) {
  const lines = []
  for (const explicitLine of text.split('\n')) {
    const words = explicitLine.split(' ')
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word }
      else { current = test }
    }
    if (current) lines.push(current)
    else if (explicitLine === '') lines.push('')
  }
  lines.forEach((line, i) => { ctx.fillText(line, x, startY + i * lineHeight) })
  return lines.length
}

/* ─── StoryModal ─── */
function StoryModal({ lista, open, onClose }) {
  const canvasRef = useRef(null)
  const brandLogoRef = useRef(null)
  const brandLoadedRef = useRef(false)
  const photoImgRef = useRef(null)
  const tplIdxRef = useRef(0)
  const listaRef = useRef(lista)
  listaRef.current = lista

  const [tplIdx, setTplIdx] = useState(0)
  const [photoSrc, setPhotoSrc] = useState(null)
  const [igHint, setIgHint] = useState(false)
  tplIdxRef.current = tplIdx

  useEffect(() => {
    if (!open) { setPhotoSrc(null); photoImgRef.current = null; setTplIdx(0); setIgHint(false); return }
    if (!brandLoadedRef.current) {
      const logoImg = new Image()
      logoImg.onload = () => { brandLoadedRef.current = true; brandLogoRef.current = logoImg; renderStory() }
      logoImg.src = 'assets/img/LaProvenceDecor-Logo.png'
    }
    if (lista?.foto_casal) {
      const img = new Image()
      img.onload = () => { photoImgRef.current = img; setPhotoSrc(lista.foto_casal) }
      img.src = lista.foto_casal
    } else {
      photoImgRef.current = null
      setPhotoSrc(null)
    }
  }, [open, lista])

  useEffect(() => { if (open) setTimeout(() => renderStory(), 0) }, [tplIdx, photoSrc, open])

  function renderStory() {
    const canvas = canvasRef.current
    const l = listaRef.current
    if (!canvas || !l) return
    const ctx = canvas.getContext('2d')
    const W = 1080, H = 1920
    const tpl = STORY_TEMPLATES[tplIdxRef.current]
    const displayNome = l.nome_noivos || 'Seus Nomes'
    const displayData = l.data_casamento
      ? new Date(`${l.data_casamento}T00:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Data do Casamento'

    ctx.fillStyle = tpl.bg; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = tpl.accent; ctx.lineWidth = 3
    ctx.globalAlpha = 0.35; ctx.strokeRect(60, 60, W - 120, H - 120)
    ctx.globalAlpha = 0.15; ctx.strokeRect(80, 80, W - 160, H - 160)
    ctx.globalAlpha = 1; ctx.fillStyle = tpl.accent; ctx.fillRect(W / 2 - 120, 200, 240, 2)

    const cx = W / 2, cy = 480, r = 215
    if (photoImgRef.current) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip()
      const img = photoImgRef.current
      const scale = Math.max((r * 2) / img.width, (r * 2) / img.height)
      const sw = img.width * scale, sh = img.height * scale
      ctx.drawImage(img, cx - sw / 2, cy - sh / 2, sw, sh); ctx.restore()
      ctx.strokeStyle = tpl.accent; ctx.lineWidth = 8
      ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2); ctx.stroke()
    } else {
      ctx.fillStyle = tpl.accent; ctx.globalAlpha = 0.15
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1; ctx.strokeStyle = tpl.accent; ctx.lineWidth = 4; ctx.globalAlpha = 0.4
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1
    }
    if (brandLoadedRef.current && brandLogoRef.current) {
      const logoW = 400
      const logoH = Math.round(brandLogoRef.current.height * (logoW / brandLogoRef.current.width))
      ctx.drawImage(brandLogoRef.current, W / 2 - logoW / 2, 820, logoW, logoH)
    } else {
      ctx.fillStyle = tpl.accent; ctx.font = '500 56px "Great Vibes", cursive'
      ctx.textAlign = 'center'; ctx.fillText('La Provence Decor', W / 2, 900)
    }
    ctx.fillStyle = tpl.accent; ctx.fillRect(W / 2 - 90, 1030, 180, 2)
    ctx.fillStyle = tpl.fg; ctx.font = '300 94px "Great Vibes", cursive'; ctx.textAlign = 'center'
    const nomeLineH = 110, nomeBaseY = 1160
    const nomeLines = drawWrappedText(ctx, displayNome, W / 2, nomeBaseY, 880, nomeLineH)
    const afterNomeY = nomeBaseY + (nomeLines - 1) * nomeLineH
    ctx.fillStyle = tpl.fg; ctx.globalAlpha = 0.7; ctx.font = '400 34px Montserrat, sans-serif'
    ctx.fillText(displayData, W / 2, afterNomeY + 140)
    ctx.globalAlpha = 1; ctx.fillStyle = tpl.accent; ctx.fillRect(W / 2 - 80, afterNomeY + 190, 160, 2)
    if (l.codigo) {
      ctx.fillStyle = tpl.fg; ctx.globalAlpha = 0.5; ctx.font = '600 26px Montserrat, sans-serif'
      ctx.fillText('ACESSE COM O CÓDIGO', W / 2, afterNomeY + 270)
      ctx.globalAlpha = 1
      ctx.fillStyle = tpl.bg === '#00300D' ? '#C4781A' : '#00300D'
      ctx.fillRect(W / 2 - 250, afterNomeY + 295, 500, 90)
      ctx.fillStyle = tpl.bg === '#00300D' ? '#FFFFFF' : '#FBDD90'
      ctx.font = 'bold 56px Montserrat, sans-serif'; ctx.fillText(l.codigo, W / 2, afterNomeY + 360)
    }
    ctx.fillStyle = tpl.fg; ctx.globalAlpha = 0.35; ctx.font = '300 26px Montserrat, sans-serif'; ctx.globalAlpha = 1
  }

  function handlePhoto(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => { photoImgRef.current = img; setPhotoSrc(ev.target.result) }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function downloadStory() {
    renderStory()
    const link = document.createElement('a')
    link.download = `story-${lista?.codigo || 'laprovence'}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  async function compartilharInstagram() {
    renderStory()
    const canvas = canvasRef.current
    if (typeof navigator.canShare === 'function') {
      try {
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
        const file = new File([blob], 'story-laprovence.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Story La Provence Decor' }); return }
      } catch (e) { if (e.name === 'AbortError') return }
    }
    const link = document.createElement('a')
    link.download = `story-${lista?.codigo || 'laprovence'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isMobile) setTimeout(() => { window.location.href = 'instagram://story-camera' }, 600)
    setIgHint(true)
    setTimeout(() => setIgHint(false), 8000)
  }

  const IG_SVG = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>

  return (
    <Modal open={open} onClose={onClose} title={lista ? `Story — ${lista.nome_noivos}` : 'Story'} maxWidth="820px"
      footer={
        <>
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={onClose}>Fechar</button>
          <div className="story-template-btns">
            <button type="button" className="btn btn-sm btn-story-ig" onClick={compartilharInstagram}>
              {IG_SVG} Compartilhar no Instagram
            </button>
            <button type="button" className="btn btn-verde" onClick={downloadStory}>Baixar (1080×1920px)</button>
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
                  <button type="button" key={i} className={`btn btn-sm ${tplIdx === i ? 'btn-verde' : 'btn-outline-dark'}`} style={{ flex: 1 }} onClick={() => setTplIdx(i)}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.2rem' }}>
              <div className="label-caps" style={{ marginBottom: '0.7rem' }}>Foto do Casal</div>
              <label htmlFor="story-photo-upload" className="story-photo-upload">
                {photoSrc ? (
                  <div className="story-photo-loaded">
                    <div className="story-photo-loaded__thumb"><img src={photoSrc} alt="Foto do casal" /></div>
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
            <canvas ref={canvasRef} width={1080} height={1920}
              style={{ width: '100%', maxWidth: 190, height: 'auto', borderRadius: 6, boxShadow: '0 12px 32px rgba(0,48,13,0.25)', display: 'block', margin: '0 auto' }}
            />
            <p className="story-canvas-hint">Preview reduzido · baixe para 1080×1920px</p>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ─── Admin page ─── */
export default function Admin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'listas'

  const { currentUser } = useStore()
  const { toasts, toast } = useToast()

  const [listas, setListas] = useState([])
  const [catalogo, setCatalogo] = useState([])
  const [premontadas, setPremontadas] = useState([])
  const [todasCompras, setTodasCompras] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [catSearch, setCatSearch] = useState('')
  const [catSetor, setCatSetor] = useState('')

  const [modalData, setModalData] = useState(null) // { lista, compras, listaItens }
  const [selectedPending, setSelectedPending] = useState(null) // { item, compra }
  const [compraDetalheModal, setCompraDetalheModal] = useState(null)
  const [archiveConfirmModal, setArchiveConfirmModal] = useState(null)
  const [casalInfoModal, setCasalInfoModal] = useState(null)
  const [listaStoryModal, setListaStoryModal] = useState(null)
  const [itemModal, setItemModal] = useState(null)
  const [pmModal, setPmModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [newGiftsAlert, setNewGiftsAlert] = useState(null) // { count, firstLista }

  useEffect(() => {
    if (!currentUser) { navigate('/auth'); return }
    if (currentUser.role !== 'gestor') { navigate('/dashboard'); return }
  }, [currentUser, navigate])

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'gestor') return
    async function load() {
      setLoading(true)
      try {
        const [l, c, p] = await Promise.all([
          listasService.getAll(),
          catalogoService.getAll(),
          premontadasService.getAll(),
        ])
        const ativas = l.filter((li) => li.status === 'Ativa')
        setListas(ativas)
        setCatalogo(c)
        setPremontadas(p)
        // carrega compras de todas as listas ativas em paralelo para os stats
        if (ativas.length > 0) {
          const allComprasArr = await Promise.all(ativas.map((li) => comprasService.getByLista(li.id).catch(() => [])))
          const flat = allComprasArr.flat()
          setTodasCompras(flat)

          // Detecta novos presentes desde a última visita
          const lastSeen = Number(localStorage.getItem('lp_gestor_last_seen') || '0')
          const novas = flat.filter((c) => c.status_pagamento === 'Pendente' && new Date(c.data_compra).getTime() > lastSeen)
          if (novas.length > 0) {
            const primeiraLista = ativas.find((li) => novas.some((c) => c.listas_id === li.id || c.lista_id === li.id))
            setNewGiftsAlert({ count: novas.length, firstLista: primeiraLista })
          }
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

  const totalArrecadado = todasCompras
    .filter((c) => c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado')
    .reduce((s, c) => s + Number(c.valor_pago), 0)
  const pendentes = todasCompras.filter((c) => c.status_pagamento === 'Pendente').length

  const filteredListas = listas.filter((l) =>
    !search || l.nome_noivos.toLowerCase().includes(search.toLowerCase()) || l.codigo.toLowerCase().includes(search.toLowerCase())
  )

  let filteredCat = catalogo
  if (catSetor) filteredCat = filteredCat.filter((i) => i.setor === catSetor)
  if (catSearch) filteredCat = filteredCat.filter((i) => i.nome.toLowerCase().includes(catSearch.toLowerCase()))

  async function openListaModal(lista) {
    try {
      const [compras, listaItens] = await Promise.all([
        comprasService.getByLista(lista.id).catch(() => []),
        listasService.getItens(lista.id),
      ])
      setModalData({ lista, compras, listaItens })
      setSelectedPending(null)
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  function closeListaModal() {
    setModalData(null)
    setCompraDetalheModal(null)
    setSelectedPending(null)
  }

  function downloadCSV() {
    if (!modalData) return
    const rows = [
      ['Item', 'Convidado', 'Telefone', 'Valor', 'Pagamento', 'Status', 'Data'],
      ...modalData.compras.map((c) => {
        const li = modalData.listaItens.find((li) => li.catalogo_id === c.catalogo_id)
        return [
          li?.catalogo?.nome || c.catalogo_id,
          c.nome_convidado,
          c.telefone || '',
          formatMoney(c.valor_pago),
          c.forma_pagamento,
          c.status_pagamento,
          new Date(c.data_compra).toLocaleString('pt-BR'),
        ]
      }),
    ]
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lista-${modalData.lista.codigo}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleAprovar(compraId) {
    try {
      await comprasService.aprovar(compraId)
      setModalData((prev) => ({
        ...prev,
        compras: prev.compras.map((c) => c.id === compraId ? { ...c, status_pagamento: 'Aprovado' } : c),
      }))
      setTodasCompras((prev) => prev.map((c) => c.id === compraId ? { ...c, status_pagamento: 'Aprovado' } : c))
      setSelectedPending(null)
      toast('Pagamento aprovado!')
    } catch (e) { toast(e.message, 'error') }
  }

  async function handleRejeitar(compraId) {
    try {
      await comprasService.rejeitar(compraId)
      setModalData((prev) => ({
        ...prev,
        compras: prev.compras.map((c) => c.id === compraId ? { ...c, status_pagamento: 'Rejeitado' } : c),
      }))
      setTodasCompras((prev) => prev.map((c) => c.id === compraId ? { ...c, status_pagamento: 'Rejeitado' } : c))
      setSelectedPending(null)
      toast('Compra cancelada.')
    } catch (e) { toast(e.message, 'error') }
  }

  async function handleArquivar() {
    try {
      await listasService.update(archiveConfirmModal.id, { status: 'Arquivada' })
      setListas((prev) => prev.filter((l) => l.id !== archiveConfirmModal.id))
      setArchiveConfirmModal(null)
      setModalData(null)
      toast('Lista arquivada.')
    } catch (e) { toast(e.message, 'error') }
  }

  async function handleToggleStatus(item) {
    const newStatus = item.status === 'Ativo' ? 'Inativo' : 'Ativo'
    try {
      await catalogoService.update(item.id, { status: newStatus })
      setCatalogo((prev) => prev.map((c) => c.id === item.id ? { ...c, status: newStatus } : c))
      toast(newStatus === 'Ativo' ? 'Item ativado.' : 'Item inativado.')
    } catch (e) { toast(e.message, 'error') }
  }

  async function handleSalvarItem() {
    if (!itemModal?.nome || !itemModal?.preco) { toast('Preencha nome e preço.', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        nome: itemModal.nome,
        tamanho: itemModal.tamanho || '',
        setor: itemModal.setor || 'Mesa posta',
        preco: String(parseMoney(itemModal.preco) || 0),
        estoque: Number.parseInt(itemModal.estoque) || 0,
        quantidade: Number.parseInt(itemModal.quantidade) || 1,
        descricao: itemModal.descricao || '',
        marca: itemModal.marca || '',
        status: itemModal.status || 'Ativo',
      }
      let saved
      if (itemModal.id) {
        saved = await catalogoService.update(itemModal.id, payload)
        const oldImages = itemModal.catalogo_images ?? []
        await Promise.all(oldImages.map((img) => catalogoService.deleteImage(img.id)))
      } else {
        saved = await catalogoService.create(payload)
      }
      const newImgs = (itemModal.imgs ?? []).filter((u) => u && !u.startsWith('data:'))
      await Promise.all(newImgs.map((url, idx) => catalogoService.addImage(saved.id, url, idx)))
      const updated = await catalogoService.getAll()
      setCatalogo(updated)
      setItemModal(null)
      toast('Item salvo!')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSalvarPremontada() {
    if (!pmModal) return
    if (!pmModal.nome?.trim()) { toast('Informe o nome da lista.', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        nome: pmModal.nome,
        descricao: pmModal.descricao || undefined,
        badge: pmModal.badge || undefined,
        img: pmModal.img || undefined,
        popular: !!pmModal.popular,
      }
      let saved
      if (pmModal.id) {
        saved = await premontadasService.update(pmModal.id, payload)
        await premontadasService.syncItens(pmModal.id, pmModal.selectedItens, pmModal.itens || [])
        setPremontadas((prev) => prev.map((p) =>
          p.id === saved.id ? { ...saved, itens: pmModal.selectedItens, selectedItens: pmModal.selectedItens } : p
        ))
      } else {
        saved = await premontadasService.create(payload)
        await Promise.all(pmModal.selectedItens.map((id) => premontadasService.addItem(saved.id, id)))
        setPremontadas((prev) => [...prev, { ...saved, itens: pmModal.selectedItens, selectedItens: pmModal.selectedItens }])
      }
      setPmModal(null)
      toast('Lista pré-montada salva!')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const SEARCH_SVG = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>

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
                  <button type="button">{SEARCH_SVG}</button>
                </div>
              </div>

              {loading ? <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>Carregando...</p> : (
                <div className="lists-grid">
                  {filteredListas.length === 0 && <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem' }}>Nenhuma lista encontrada.</p>}
                  {filteredListas.map((lista) => {
                    const comprasLista = todasCompras.filter((c) => c.listas_id === lista.id || c.lista_id === lista.id)
                    const aprovadas = comprasLista.filter((c) => c.status_pagamento === 'Aprovado' || c.status_pagamento === 'Confirmado')
                    const pend = comprasLista.filter((c) => c.status_pagamento === 'Pendente')
                    const itensCount = lista.lista_itens?.length ?? 0
                    return (
                      <div key={lista.id} className="list-card">
                        {lista.foto_casal && <div className="list-card-photo" style={{ backgroundImage: `url(${lista.foto_casal})` }} />}
                        <div className="list-card-body">
                          <div className="list-card-code">#{lista.codigo}</div>
                          <div className="list-card-name">{lista.nome_noivos}</div>
                          {lista.data_casamento && <div className="list-card-date">Casamento: {formatDate(lista.data_casamento)}</div>}
                          <div className="chips-row">
                            <span className="chip chip--default">{itensCount} itens</span>
                            <span className="chip chip--green">{aprovadas.length} aprovados</span>
                            {pend.length > 0 && <span className="chip chip--yellow">{pend.length} pendente{pend.length > 1 ? 's' : ''}</span>}
                          </div>
                          <div className="list-card-actions">
                            <button type="button" className="btn btn-outline-dark btn-sm" style={{ flex: 1 }} onClick={() => openListaModal(lista)}>Ver Detalhes</button>
                            <button type="button" className="btn btn-sm btn-story-ig" title="Gerar Story Instagram" onClick={() => setListaStoryModal(lista)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB CATÁLOGO ── */}
        {tab === 'catalogo' && (
          <>
            <div className="page-header">
              <div className="page-header-text"><span className="label-caps">Gestão de Produtos</span><h1>Catálogo de Itens</h1></div>
              <button type="button" className="btn btn-verde"
                onClick={() => setItemModal({ nome: '', tamanho: '', setor: 'Mesa posta', preco: '', estoque: '', quantidade: 1, descricao: '', marca: '', imgs: [], status: 'Ativo' })}>
                Adicionar Item
              </button>
            </div>

            <div className="admin-filter-row">
              <div className="search-bar" style={{ maxWidth: 320, flexShrink: 0 }}>
                <input type="text" placeholder="Buscar item..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                <button type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                </button>
              </div>
              <div className="cat-filter-bar" style={{ flex: 1, marginBottom: 0, minWidth: 0 }}>
                <button type="button" className={`cat-filter${catSetor === '' ? ' active' : ''}`} onClick={() => setCatSetor('')}>Todos</button>
                {SETORES.map((s) => <button type="button" key={s} className={`cat-filter${catSetor === s ? ' active' : ''}`} onClick={() => setCatSetor(s)}>{s}</button>)}
              </div>
              <select className="cat-filter-select" value={catSetor} onChange={(e) => setCatSetor(e.target.value)}>
                <option value="">Todas as categorias</option>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
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
                          {item.imgs?.[0] && <img src={item.imgs[0]} alt={item.nome} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 3 }} onError={(e) => { e.target.style.display = 'none' }} />}
                        </td>
                        <td className="table-item-name">{item.nome}</td>
                        <td className="table-item-small">{item.setor}</td>
                        <td className="table-item-small">{item.tamanho}</td>
                        <td className="table-item-price">{formatMoney(item.preco)}</td>
                        <td className="table-item-qty">{item.estoque}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setItemModal({ ...item, preco: numToMaskMoney(item.preco) })}>Editar</button>
                            <button
                              type="button"
                              className={`btn btn-sm btn-toggle-${item.status === 'Ativo' ? 'inativar' : 'ativar'}`}
                              onClick={() => handleToggleStatus(item)}
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
              <button type="button" className="btn btn-verde btn-sm"
                onClick={() => setPmModal({ nome: '', badge: '', img: '', popular: false, selectedItens: [] })}>
                + Nova Pré-montada
              </button>
            </div>
            <p style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--texto-suave)' }}>
              {premontadas.filter((p) => p.popular).length}/3 listas marcadas como destaque no cadastro
            </p>
            <div className="lists-grid">
              {premontadas.map((pm) => (
                <div key={pm.id} className="list-card">
                  {pm.img && <div className="list-card-photo" style={{ backgroundImage: `url(${pm.img})` }} />}
                  <div className="pm-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {pm.badge && <div className="label-caps pm-card-badge">{pm.badge}</div>}
                      {pm.popular && <div className="label-caps" style={{ color: 'var(--verde)', fontSize: '0.6rem' }}>★ Destaque</div>}
                    </div>
                    <div className="pm-card-name">{pm.nome}</div>
                    <div className="pm-card-count">{(pm.itens || []).length} itens</div>
                    <button type="button" className="btn btn-outline-dark btn-sm"
                      onClick={() => setPmModal({ ...pm, selectedItens: [...(pm.itens || [])] })}>Editar</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── MODAL DETALHE DA LISTA ── */}
      <Modal
        open={!!modalData}
        onClose={closeListaModal}
        title={modalData ? `${modalData.lista.nome_noivos} — ${modalData.lista.codigo}` : ''}
        maxWidth="860px"
        footer={
          modalData ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm btn-archive" onClick={() => setArchiveConfirmModal(modalData.lista)}>Arquivar Lista</button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={closeListaModal}>Fechar</button>
                <button type="button" className="btn btn-verde btn-sm" onClick={downloadCSV}>Baixar Extrato (CSV)</button>
              </div>
            </div>
          ) : null
        }
      >
        {modalData && (
          <>
            {/* Stats row */}
            <div className="gestor-modal-stats">
              <div>
                <div className="gestor-modal-stat-label">Código</div>
                <div className="gestor-modal-stat-value">{modalData.lista.codigo}</div>
              </div>
              <div>
                <div className="gestor-modal-stat-label">Casamento</div>
                <div className="gestor-modal-stat-value">{modalData.lista.data_casamento ? formatDate(modalData.lista.data_casamento) : '—'}</div>
              </div>
              <div>
                <div className="gestor-modal-stat-label">Itens na Lista</div>
                <div className="gestor-modal-stat-value">{modalData.listaItens.length}</div>
              </div>
              <div>
                <div className="gestor-modal-stat-label">Total Presenteado</div>
                <div className="gestor-modal-stat-value" style={{ color: 'var(--ouro)' }}>
                  {formatMoney(modalData.compras.filter((c) => c.status_pagamento !== 'Rejeitado').reduce((s, c) => s + Number(c.valor_pago), 0))}
                </div>
              </div>
            </div>

            {/* Actions row */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-sm btn-outline-dark btn-sm-icon"
                onClick={() => setCasalInfoModal({ lista: modalData.lista, user: modalData.lista.user ?? null })}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                Dados do Casal
              </button>
              <button type="button" className="btn btn-sm btn-story-ig"
                onClick={() => { closeListaModal(); setListaStoryModal(modalData.lista) }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                Gerar Story
              </button>
              <Link to={`/lista?codigo=${modalData.lista.codigo}`} target="_blank" className="btn btn-sm btn-outline-dark">
                Ver Lista Pública →
              </Link>
            </div>

            {/* Items section */}
            <div className="gestor-modal-section-title">
              Itens da Lista ({modalData.listaItens.length})
            </div>

            {modalData.listaItens.length === 0 && (
              <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem', marginBottom: '1rem' }}>Nenhum item na lista ainda.</p>
            )}

            <div className="gestor-modal-items-grid">
              {modalData.listaItens.map((li) => {
                const item = li.catalogo
                if (!item) return null
                const compra = modalData.compras.find((c) => c.catalogo_id === li.catalogo_id)
                const isPendente = compra?.status_pagamento === 'Pendente'
                const isAprovado = compra && (compra.status_pagamento === 'Aprovado' || compra.status_pagamento === 'Confirmado')
                const isSelected = selectedPending?.compra?.id === compra?.id
                return (
                  <button
                    type="button"
                    key={li.id}
                    className={`gestor-item-card${isPendente ? ' gestor-item-card--pending' : ''}${isAprovado ? ' gestor-item-card--approved' : ''}${isSelected ? ' gestor-item-card--selected' : ''}`}
                    onClick={() => isPendente && setSelectedPending(isSelected ? null : { item, compra })}
                    style={{ cursor: isPendente ? 'pointer' : 'default' }}
                  >
                    {isAprovado && <div className="gestor-item-stamp">Presenteado</div>}
                    <div className="gestor-item-card-name">{item.nome}</div>
                    <div className="gestor-item-card-sub">{item.setor || item.tamanho || ''}</div>
                    <div className="gestor-item-card-price">{formatMoney(item.preco)}</div>
                    {isPendente && <div className="gestor-item-card-status">AGUARDANDO PGTO</div>}
                  </button>
                )
              })}
            </div>

            {/* Inline purchase detail */}
            {selectedPending && (
              <div className="gestor-compra-detail">
                <div className="gestor-compra-detail-title">
                  Detalhe da Compra — {selectedPending.item.nome.toUpperCase()}
                </div>
                <div className="gestor-compra-detail-grid">
                  <div>
                    <span className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--texto-suave)' }}>Convidado</span>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{selectedPending.compra.nome_convidado}</div>
                  </div>
                  <div>
                    <span className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--texto-suave)' }}>Telefone</span>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{selectedPending.compra.telefone || '—'}</div>
                  </div>
                  <div>
                    <span className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--texto-suave)' }}>Valor</span>
                    <div style={{ fontWeight: 700, color: 'var(--ouro)', marginTop: '0.2rem' }}>{formatMoney(selectedPending.compra.valor_pago)}</div>
                  </div>
                  <div>
                    <span className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--texto-suave)' }}>Pagamento</span>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{selectedPending.compra.forma_pagamento}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="label-caps" style={{ fontSize: '0.6rem', color: 'var(--texto-suave)' }}>Data</span>
                    <div style={{ fontWeight: 600, marginTop: '0.2rem' }}>{new Date(selectedPending.compra.data_compra).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                <div className="gestor-compra-detail-actions">
                  <button type="button" className="btn btn-verde" style={{ flex: 1 }} onClick={() => handleAprovar(selectedPending.compra.id)}>APROVAR</button>
                  <button type="button" className="btn btn-sm btn-rejeitar" style={{ flex: 1 }} onClick={() => handleRejeitar(selectedPending.compra.id)}>CANCELAR COMPRA</button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

      {/* ── MODAL DADOS DO CASAL ── */}
      <Modal open={!!casalInfoModal} onClose={() => setCasalInfoModal(null)} title="Informações do Casal" maxWidth="440px"
        footer={<button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setCasalInfoModal(null)}>Fechar</button>}
      >
        {casalInfoModal && (
          <div>
            <div className="modal-info-header modal-info-header--sm">
              {casalInfoModal.lista.foto_casal && (
                <img src={casalInfoModal.lista.foto_casal} alt="Foto do casal" className="couple-avatar couple-avatar--sm" />
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
                <InfoRow label="Nome Completo">{casalInfoModal.user.nome ?? [casalInfoModal.user.nome_noiva, casalInfoModal.user.nome_noivo].filter(Boolean).join(' & ')}</InfoRow>
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
      <Modal open={!!compraDetalheModal} onClose={() => setCompraDetalheModal(null)} title="Detalhes do Presente" maxWidth="460px"
        footer={<button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setCompraDetalheModal(null)}>Fechar</button>}
      >
        {compraDetalheModal && (
          <div>
            <div className="modal-info-header modal-info-header--sm">
              {compraDetalheModal.item.imgs?.[0] && (
                <img src={compraDetalheModal.item.imgs[0]} alt={compraDetalheModal.item.nome}
                  style={{ width: 58, height: 58, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }}
                  onError={(e) => { e.target.style.display = 'none' }} />
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
      <Modal open={!!archiveConfirmModal} onClose={() => setArchiveConfirmModal(null)} title="Arquivar Lista" maxWidth="420px"
        footer={
          <>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setArchiveConfirmModal(null)}>Cancelar</button>
            <button type="button" className="btn btn-sm btn-confirm-archive" onClick={handleArquivar}>Sim, Arquivar Lista</button>
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

      {/* ── MODAL ALERTA NOVO PRESENTE ── */}
      <Modal open={!!newGiftsAlert} onClose={() => { localStorage.setItem('lp_gestor_last_seen', String(Date.now())); setNewGiftsAlert(null) }} maxWidth="360px">
        <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--verde)', marginBottom: '0.75rem' }}>
            Novo presente comprado!
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Que alegria! Foram registrados <strong>{newGiftsAlert?.count}</strong> novo(s) presente(s) desde a sua última visita.
          </p>
          <button type="button" className="btn btn-verde" style={{ width: '100%', padding: '0.85rem', fontSize: '0.78rem', letterSpacing: '0.1em' }}
            onClick={() => {
              localStorage.setItem('lp_gestor_last_seen', String(Date.now()))
              const firstLista = newGiftsAlert?.firstLista
              setNewGiftsAlert(null)
              if (firstLista) openListaModal(firstLista)
            }}>
            VER PRESENTES
          </button>
        </div>
      </Modal>

      {/* ── MODAL STORY ── */}
      <StoryModal lista={listaStoryModal} open={!!listaStoryModal} onClose={() => setListaStoryModal(null)} />

      {/* ── MODAL ITEM CRUD ── */}
      <Modal open={!!itemModal} onClose={() => setItemModal(null)} title={itemModal?.id ? 'Editar Item' : 'Novo Item'} maxWidth="580px"
        footer={
          <>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setItemModal(null)}>Cancelar</button>
            <button type="button" className="btn btn-verde" onClick={handleSalvarItem} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Item'}
            </button>
          </>
        }
      >
        {itemModal && (
          <div className="item-form-grid">
            <div className="form-group full">
              <label htmlFor="if-nome">Nome do Item</label>
              <input id="if-nome" type="text" placeholder="Ex: Jogo de Panelas" value={itemModal.nome}
                onChange={(e) => setItemModal({ ...itemModal, nome: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="if-tamanho">Tamanho / Dimensões</label>
              <input id="if-tamanho" type="text" placeholder="Ex: 7 peças" value={itemModal.tamanho}
                onChange={(e) => setItemModal({ ...itemModal, tamanho: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="if-setor">Setor</label>
              <select id="if-setor" value={itemModal.setor} onChange={(e) => setItemModal({ ...itemModal, setor: e.target.value })}>
                {SETORES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="if-preco">Preço (R$)</label>
              <input id="if-preco" type="text" inputMode="numeric" placeholder="R$ 0,00" value={itemModal.preco || ''}
                onChange={(e) => setItemModal({ ...itemModal, preco: maskMoney(e.target.value) })} />
            </div>
            <div className="form-group">
              <label htmlFor="if-estoque">Estoque</label>
              <input id="if-estoque" type="number" placeholder="0" min="0" value={itemModal.estoque}
                onChange={(e) => setItemModal({ ...itemModal, estoque: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="if-qtd">Quantidade por kit</label>
              <input id="if-qtd" type="number" placeholder="1" min="1" value={itemModal.quantidade}
                onChange={(e) => setItemModal({ ...itemModal, quantidade: e.target.value })} />
            </div>
            <div className="form-group full">
              <label>Imagens <span style={{ fontWeight: 400, color: 'var(--texto-suave)' }}>(URLs)</span></label>
              {(itemModal.imgs?.length ? itemModal.imgs : ['']).map((url, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {url && !url.startsWith('data:') && (
                    <img src={url} alt="preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(0,48,13,0.15)', flexShrink: 0 }}
                      onError={(e) => { e.target.style.display = 'none' }} />
                  )}
                  <input type="text" placeholder={`URL da imagem ${idx + 1}`} value={url}
                    style={{ flex: 1 }}
                    onChange={(e) => {
                      const imgs = [...(itemModal.imgs?.length ? itemModal.imgs : [''])]
                      imgs[idx] = e.target.value
                      setItemModal({ ...itemModal, imgs })
                    }} />
                  <button type="button" onClick={() => {
                    const imgs = (itemModal.imgs?.length ? itemModal.imgs : ['']).filter((_, i) => i !== idx)
                    setItemModal({ ...itemModal, imgs: imgs.length ? imgs : [''] })
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--texto-suave)', fontSize: '1.1rem', padding: '0 0.25rem', flexShrink: 0 }} aria-label="Remover imagem">✕</button>
                </div>
              ))}
              <button type="button" onClick={() => setItemModal({ ...itemModal, imgs: [...(itemModal.imgs || []), ''] })}
                style={{ fontSize: '0.8rem', color: 'var(--verde)', background: 'none', border: '1px dashed var(--verde)', borderRadius: 4, padding: '0.3rem 0.75rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                + Adicionar imagem
              </button>
            </div>
            <div className="form-group full">
              <label htmlFor="if-desc">Descrição</label>
              <textarea id="if-desc" placeholder="Descrição detalhada do item..." value={itemModal.descricao}
                onChange={(e) => setItemModal({ ...itemModal, descricao: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── MODAL PRÉ-MONTADA ── */}
      <Modal open={!!pmModal} onClose={() => setPmModal(null)}
        title={pmModal ? (pmModal.id ? `Editar: ${pmModal.nome}` : 'Nova Pré-montada') : ''}
        maxWidth="660px"
        footer={
          <>
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => setPmModal(null)}>Cancelar</button>
            <button type="button" className="btn btn-verde" onClick={handleSalvarPremontada} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </>
        }
      >
        {pmModal && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="pm-nome">Nome</label>
                <input id="pm-nome" type="text" placeholder="Ex: Clássica" value={pmModal.nome}
                  onChange={(e) => setPmModal({ ...pmModal, nome: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="pm-badge">Badge <span style={{ fontWeight: 400, color: 'var(--texto-suave)' }}>(opcional)</span></label>
                <input id="pm-badge" type="text" placeholder="Ex: Mais Popular" value={pmModal.badge || ''}
                  onChange={(e) => setPmModal({ ...pmModal, badge: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
                <label htmlFor="pm-img">URL da Imagem <span style={{ fontWeight: 400, color: 'var(--texto-suave)' }}>(opcional)</span></label>
                <input id="pm-img" type="text" placeholder="https://..." value={pmModal.img || ''}
                  onChange={(e) => setPmModal({ ...pmModal, img: e.target.value })} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={!!pmModal.popular} style={{ width: 'auto' }}
                onChange={(e) => {
                  const novasPopulares = premontadas.filter((p) => p.popular && p.id !== pmModal.id).length
                  if (e.target.checked && novasPopulares >= 3) {
                    toast('Máximo de 3 listas em destaque no cadastro.', 'error')
                    return
                  }
                  setPmModal({ ...pmModal, popular: e.target.checked })
                }} />
              Exibir no cadastro como destaque <span style={{ color: 'var(--texto-suave)' }}>({premontadas.filter((p) => p.popular && p.id !== pmModal.id).length + (pmModal.popular ? 1 : 0)}/3)</span>
            </label>
            <div className="pm-modal-hint">Selecione os itens que farão parte desta lista pré-montada:</div>
            <div className="pm-items-grid">
              {catalogo.filter((i) => i.status === 'Ativo').map((item) => {
                const checked = pmModal.selectedItens.includes(item.id)
                return (
                  <label key={item.id} className={`pm-item-label${checked ? ' checked' : ''}`}>
                    <input type="checkbox" checked={checked} onChange={() => {
                      const itens = checked
                        ? pmModal.selectedItens.filter((id) => id !== item.id)
                        : [...pmModal.selectedItens, item.id]
                      setPmModal({ ...pmModal, selectedItens: itens })
                    }} style={{ width: 'auto', flexShrink: 0 }} />
                    <span className="pm-item-name">{item.nome}</span>
                  </label>
                )
              })}
            </div>
            <div className="pm-modal-count">{pmModal.selectedItens.length} itens selecionados</div>
          </>
        )}
      </Modal>
    </div>
  )
}
