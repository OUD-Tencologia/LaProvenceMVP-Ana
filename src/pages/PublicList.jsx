import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import ItemCarousel from '../components/ui/ItemCarousel';
import Toast from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import { SkeletonGrid } from '../components/ui/Skeleton';
import useStore from '../store/useStore';
import { formatMoney, formatDate } from '../utils/formatters';
import { validateCPF, maskPhone, maskCPF, maskCurrency } from '../utils/validators';
import { SETORES } from '../data/seed';

const SETOR_ORDER = ['Mesa posta', 'Prataria', 'Adornos', 'Aromas', 'Mobiliário', 'Vasos', 'Complementos'];

export default function PublicList() {
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get('codigo');
  const navigate = useNavigate();

  const { getListaByCodigo, getCatalogo, getComprasByLista, getComprasByItem, registrarCompra, atualizarListaItens, getListas, salvarItem, getItemById } = useStore();

  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);
  const { toasts, toast } = useToast();

  const [setor, setSetor] = useState('');
  const [sort, setSort] = useState('padrao');
  const [compraModal, setCompraModal] = useState(false);
  const [waModal, setWaModal] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [isVale, setIsVale] = useState(false);
  const [pagamento, setPagamento] = useState('Pix');
  const [refresh, setRefresh] = useState(0);

  const [form, setForm] = useState({ nome: '', cpf: '', tel: '' });
  const [valeValor, setValeValor] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const lista = codigo ? getListaByCodigo(codigo) : null;
  const catalogo = getCatalogo();
  const compras = lista ? getComprasByLista(lista.id) : [];

  useEffect(() => {
    if (lista) {
      document.title = `${lista.nome_noivos.replace(/\s*&\s*/g, ' e ')} — Lista de Casamento — La Provence`;
    }
  }, [lista?.id]);

  if (!codigo) {
    return (
      <div>
        <nav className="public-navbar">
          <Link to="/"><img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 150 }} /></Link>
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
    );
  }

  // Build setor list from itens
  const itensBase = lista
    ? lista.itens.map((id) => catalogo.find((c) => c.id === id)).filter(Boolean)
    : [];

  const setores = [...new Set(itensBase.map((i) => i.setor).filter(Boolean))].sort((a, b) => {
    const ia = SETOR_ORDER.indexOf(a), ib = SETOR_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  let itens = setor ? itensBase.filter((i) => i.setor === setor) : itensBase;
  if (sort === 'menor') itens = [...itens].sort((a, b) => a.preco - b.preco);
  else if (sort === 'maior') itens = [...itens].sort((a, b) => b.preco - a.preco);
  else if (sort === 'az') itens = [...itens].sort((a, b) => a.nome.localeCompare(b.nome));

  const total = lista?.itens.length ?? 0;
  const presenteados = compras.length;

  function abrirCompra(itemId) {
    const compra = getComprasByItem(lista.id, itemId);
    if (compra) { toast('Este item acabou de ser presenteado por outra pessoa.', 'error'); setRefresh(r => r + 1); return; }
    navigate(`/checkout?itemId=${itemId}&codigo=${codigo}`);
  }

  function abrirCompraVale() {
    setCurrentItemId('vale');
    setIsVale(true);
    setForm({ nome: '', cpf: '', tel: '' });
    setValeValor('');
    setPagamento('Pix');
    setFormErrors({});
    setCompraModal(true);
  }

  function confirmarCompra() {
    const errs = {};
    if (!form.nome) errs.nome = true;
    if (!validateCPF(form.cpf)) errs.cpf = true;
    if (!form.tel || form.tel.replace(/\D/g, '').length < 10) errs.tel = true;
    setFormErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      if (isVale) {
        const val = parseInt(valeValor.replace(/\D/g, ''), 10) || 0;
        if (isNaN(val) || val < 600) { setFormErrors({ geral: 'O valor mínimo para o vale-presente é R$ 600,00.' }); return; }

        const newItemId = 'vale_' + Date.now();
        salvarItem({ id: newItemId, nome: 'Cartão Vale-Presente', marca: `De: ${form.nome}`, tamanho: 'Crédito Flexível', quantidade: 1, descricao: `Cartão presente no valor de ${formatMoney(val)} dado por ${form.nome}`, preco: val, setor: 'Vale-Presente', estoque: 1, status: 'Oculto', imgs: [] });

        const listaAtual = getListas().find((l) => l.id === lista.id);
        atualizarListaItens(lista.id, [...(listaAtual?.itens || []), newItemId]);

        registrarCompra(lista.id, newItemId, { nome: form.nome, cpf: form.cpf, telefone: form.tel, valor: val, pagamento });
        setCompraModal(false);
        const msg = encodeURIComponent(`Olá! Sou ${form.nome}, gostaria de enviar um Cartão Vale-Presente no valor de ${formatMoney(val)} para a lista de ${lista.nome_noivos}. Forma de pagamento: ${pagamento}.`);
        setWaModal({ nome: 'Cartão Vale-Presente', href: `https://wa.me/5565996828577?text=${msg}` });
        setRefresh(r => r + 1);
        return;
      }
    } catch (e) {
      setFormErrors({ geral: e.message });
      setRefresh(r => r + 1);
    }
  }

  return (
    <>
      <Toast toasts={toasts} />

      <nav className="public-navbar">
        <Link to="/"><img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 150 }} /></Link>
      </nav>

      <div className="public-hero">
        <div className="public-hero-content">
          {!lista ? (
            <>
              <span className="label-caps">Lista não encontrada</span>
              <span className="script">Código inválido</span>
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
              <button className={`public-filter${setor === '' ? ' active' : ''}`} onClick={() => setSetor('')}>Todos</button>
              {setores.map((s) => <button key={s} className={`public-filter${setor === s ? ' active' : ''}`} onClick={() => setSetor(s)}>{s}</button>)}
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
                  <button className="btn btn-verde btn-sm" style={{ marginTop: 'auto' }} onClick={abrirCompraVale}>Presentear</button>
                </div>
              </div>
            )}

            {itens.map((item) => {
              const compra = compras.find((c) => c.item_id === item.id);
              const isPendente = compra && compra.status_pagamento === 'Pendente';
              return (
                <div key={item.id} className={`item-card${compra ? ' purchased' : ''}`} style={isPendente ? { opacity: 0.7, filter: 'grayscale(0.6)' } : {}}>
                  {compra && (
                    <div className="purchased-overlay" style={isPendente ? { background: 'rgba(107,107,107,0.7)' } : {}}>
                      <span className="purchased-stamp" style={isPendente ? { color: '#fff', borderColor: '#fff' } : {}}>{isPendente ? 'Em andamento' : 'Presenteado'}</span>
                    </div>
                  )}
                  <div style={{ cursor: 'pointer' }} onClick={() => setDetailItem(item)}>
                    <ItemCarousel item={item} context="pub" />
                  </div>
                  <div className="item-card-body">
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--texto-suave)', marginBottom: '0.3rem' }}>{item.marca || ''}</div>
                    <h4 style={{ cursor: 'pointer' }} onClick={() => setDetailItem(item)}>{item.nome}</h4>
                    <div className="tamanho">{item.tamanho}</div>
                    <div className="preco">{formatMoney(item.preco)}</div>
                    {!compra
                      ? <button className="btn btn-verde btn-sm" style={{ marginTop: 'auto' }} onClick={() => setDetailItem(item)}>Presentear</button>
                      : <span style={{ fontSize: '0.72rem', color: 'var(--texto-suave)' }}>{isPendente ? 'Em processamento' : 'Já foi presenteado'}</span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Purchase modal */}
      <Modal
        open={compraModal}
        onClose={() => setCompraModal(false)}
        title="Presentear este item"
        footer={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn btn-outline-dark btn-sm" style={{ flex: 1 }} onClick={() => setCompraModal(false)}>Cancelar</button>
              <button className="btn btn-verde" style={{ flex: 2 }} onClick={confirmarCompra}>Confirmar Presente</button>
            </div>
          </div>
        }
      >
        <div className="buy-item-preview">
          {isVale ? (
            <>
              <h4 style={{ color: 'var(--verde)', fontSize: '1.1rem', marginBottom: '0.3rem' }}>Cartão Vale-Presente</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', marginBottom: '1rem' }}>Defina o valor com o qual deseja presentear os noivos:</div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <input type="text" inputMode="numeric" placeholder="R$ 600" value={valeValor} onChange={(e) => setValeValor(maskCurrency(e.target.value))} style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ouro)' }} />
              </div>
            </>
          ) : null}
        </div>

        <div className="form-group">
          <label>Seu nome completo</label>
          <input type="text" placeholder="Como você gostaria de ser identificado" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          {formErrors.nome && <span className="form-error show">Informe seu nome completo</span>}
        </div>
        <div className="form-group">
          <label>CPF</label>
          <input type="text" placeholder="000.000.000-00" maxLength={14} value={form.cpf} onChange={(e) => setForm({ ...form, cpf: maskCPF(e.target.value) })} />
          {formErrors.cpf && <span className="form-error show">CPF inválido</span>}
        </div>
        <div className="form-group">
          <label>Telefone</label>
          <input type="text" placeholder="(00) 00000-0000" value={form.tel} onChange={(e) => setForm({ ...form, tel: maskPhone(e.target.value) })} />
          {formErrors.tel && <span className="form-error show">Informe seu telefone</span>}
        </div>
        <div className="form-group">
          <label>Forma de Pagamento</label>
          <div className="payment-options">
            <div className={`payment-option${pagamento === 'Pix' ? ' selected' : ''}`} onClick={() => setPagamento('Pix')}>Pix</div>
            <div className={`payment-option${pagamento === 'Cartao' ? ' selected' : ''}`} onClick={() => setPagamento('Cartao')}>Cartão</div>
          </div>
        </div>
        <div style={{ background: 'rgba(0,48,13,0.04)', border: '1px solid rgba(0,48,13,0.1)', borderRadius: 2, padding: '0.8rem 1rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--texto-suave)', fontWeight: 300, lineHeight: 1.7 }}>Ao confirmar, seu presente será registrado e os noivos serão notificados. O pagamento é processado de forma segura.</p>
        </div>
        {formErrors.geral && <span className="form-error show" style={{ marginTop: '0.8rem', fontSize: '0.8rem' }}>{formErrors.geral}</span>}
      </Modal>

      {/* WhatsApp redirect modal */}
      <Modal open={!!waModal} onClose={() => setWaModal(null)} maxWidth="450px">
        {waModal && (
          <div style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
            <span className="script" style={{ fontSize: '3.5rem', color: 'var(--ouro)', display: 'block', marginBottom: '0.5rem' }}>Quase lá!</span>
            <h3 style={{ color: 'var(--verde)', marginBottom: '1rem', fontSize: '1.1rem' }}>Estamos finalizando seu presente</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--texto-suave)', fontWeight: 300, lineHeight: 1.8, marginBottom: '1.5rem' }}>Para garantir a segurança da transação, o pagamento é concluído diretamente com nossa equipe.</p>
            <div style={{ background: 'var(--bege)', borderRadius: 4, padding: '1.2rem', marginBottom: '1.5rem' }}>
              <div className="label-caps" style={{ marginBottom: '0.3rem' }}>Item escolhido</div>
              <div style={{ fontWeight: 600, color: 'var(--verde)' }}>{waModal.nome}</div>
            </div>
            <a href={waModal.href} target="_blank" rel="noreferrer" className="btn btn-verde" style={{ width: '100%', display: 'block' }} onClick={() => setWaModal(null)}>Entrar em Contato via WhatsApp</a>
          </div>
        )}
      </Modal>

      {/* Item detail modal */}
      {detailItem && (
        <Modal
          open={!!detailItem}
          onClose={() => setDetailItem(null)}
          title="Detalhes do Presente"
          maxWidth="600px"
          footer={
            <>
              <button className="btn btn-outline-dark btn-sm" onClick={() => setDetailItem(null)}>Fechar</button>
              {!compras.find((c) => c.item_id === detailItem.id)
                ? <button className="btn btn-verde btn-sm" onClick={() => { setDetailItem(null); abrirCompra(detailItem.id); }}>Presentear</button>
                : <span style={{ fontSize: '0.8rem', color: 'var(--texto-suave)', padding: '0.5rem' }}>Já presenteado</span>
              }
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
    </>
  );
}
