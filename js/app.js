/* ================================================
   La Provence — Application Logic (localStorage MVP)
   ================================================ */

/* ─── SEED DATA ─────────────────────────────────── */
const CATALOGO_SEED = [
  { id: 'c1', nome: 'Jogo de Panelas Antiaderente', tamanho: '7 peças', quantidade: 1, descricao: 'Conjunto completo com 7 peças em aço inoxidável com revestimento antiaderente premium.', peso: 8.5, preco: 890.00, setor: 'Cozinha', estoque: 15, status: 'Ativo', version: 1 },
  { id: 'c2', nome: 'Aparelho de Jantar em Porcelana', tamanho: '42 peças', quantidade: 1, descricao: 'Aparelho de jantar completo em porcelana branca com borda dourada. Resistente e elegante.', peso: 12.0, preco: 1250.00, setor: 'Cozinha', estoque: 8, status: 'Ativo', version: 1 },
  { id: 'c3', nome: 'Conjunto de Facas Tramontina', tamanho: '12 peças', quantidade: 1, descricao: 'Faqueiro em aço inoxidável com cabo em madeira nobre. Inclui estojo de couro.', peso: 3.2, preco: 480.00, setor: 'Cozinha', estoque: 20, status: 'Ativo', version: 1 },
  { id: 'c4', nome: 'Jogo de Copos de Cristal', tamanho: '12 peças', quantidade: 1, descricao: 'Copos de cristal lapidado para água e vinho. Perfeitos para receber convidados com elegância.', peso: 4.8, preco: 360.00, setor: 'Cozinha', estoque: 12, status: 'Ativo', version: 1 },
  { id: 'c5', nome: 'Sofá 3 Lugares em Veludo', tamanho: '220 x 95 cm', quantidade: 1, descricao: 'Sofá retrátil e reclinável em veludo italiano. Disponível em verde musgo e bege.', peso: 68.0, preco: 4200.00, setor: 'Sala de Estar', estoque: 5, status: 'Ativo', version: 1 },
  { id: 'c6', nome: 'Mesa de Centro em Mármore', tamanho: '120 x 60 x 40 cm', quantidade: 1, descricao: 'Mesa com tampo em mármore branco carrara e base em aço dourado escovado.', peso: 35.0, preco: 2800.00, setor: 'Sala de Estar', estoque: 6, status: 'Ativo', version: 1 },
  { id: 'c7', nome: 'Tapete Persa Artesanal', tamanho: '200 x 300 cm', quantidade: 1, descricao: 'Tapete em lã natural com padrão geométrico em tons terrosos. Produção artesanal.', peso: 18.0, preco: 1850.00, setor: 'Sala de Estar', estoque: 4, status: 'Ativo', version: 1 },
  { id: 'c8', nome: 'Luminária de Chão', tamanho: 'Alt. 165 cm', quantidade: 1, descricao: 'Luminária de chão com cúpula em linho natural e estrutura em latão envelhecido.', peso: 6.5, preco: 680.00, setor: 'Sala de Estar', estoque: 10, status: 'Ativo', version: 1 },
  { id: 'c9', nome: 'Jogo de Cama Queen Acetinado', tamanho: 'Queen 4 peças', quantidade: 1, descricao: 'Jogo de cama em algodão egípcio 500 fios com acabamento acetinado. Toque aveludado.', peso: 2.8, preco: 520.00, setor: 'Quarto', estoque: 18, status: 'Ativo', version: 1 },
  { id: 'c10', nome: 'Colchão Premium Molas Ensacadas', tamanho: 'Queen 158 x 198 cm', quantidade: 1, descricao: 'Colchão com tecnologia de molas ensacadas independentes e espuma de alta densidade.', peso: 42.0, preco: 3600.00, setor: 'Quarto', estoque: 7, status: 'Ativo', version: 1 },
  { id: 'c11', nome: 'Criado-Mudo em Carvalho', tamanho: '50 x 40 x 55 cm', quantidade: 2, descricao: 'Par de criados-mudos em madeira de carvalho com gaveta e nicho aberto. Design escandinavo.', peso: 22.0, preco: 960.00, setor: 'Quarto', estoque: 9, status: 'Ativo', version: 1 },
  { id: 'c12', nome: 'Jogo de Toalhas Felpudas', tamanho: '8 peças', quantidade: 1, descricao: 'Jogo de toalhas em algodão extra felpudo 700g/m². Inclui toalhas de banho, rosto e piso.', peso: 3.5, preco: 290.00, setor: 'Banho', estoque: 25, status: 'Ativo', version: 1 },
  { id: 'c13', nome: 'Espelho com Moldura Dourada', tamanho: '60 x 80 cm', quantidade: 1, descricao: 'Espelho bisotado com moldura em metal dourado. Perfeito para hall ou quarto.', peso: 8.0, preco: 420.00, setor: 'Banho', estoque: 14, status: 'Ativo', version: 1 },
  { id: 'c14', nome: 'Aparador para Hall', tamanho: '130 x 38 x 85 cm', quantidade: 1, descricao: 'Aparador em madeira maciça pintada e tampo em mármore. Peça de entrada sofisticada.', peso: 28.0, preco: 2100.00, setor: 'Sala de Estar', estoque: 6, status: 'Ativo', version: 1 },
  { id: 'c15', nome: 'Liquidificador Premium', tamanho: '2L', quantidade: 1, descricao: 'Liquidificador com 12 velocidades, copo em vidro temperado e potência de 1200W.', peso: 4.2, preco: 380.00, setor: 'Cozinha', estoque: 22, status: 'Ativo', version: 1 },
  { id: 'c16', nome: 'Aspirador Robot', tamanho: 'Diâmetro 32 cm', quantidade: 1, descricao: 'Aspirador robô com mapeamento inteligente, controle via app e bateria de 180 minutos.', peso: 3.8, preco: 1890.00, setor: 'Sala de Estar', estoque: 11, status: 'Ativo', version: 1 },
];

const PREMONTADAS_SEED = [
  {
    id: 'p1',
    nome: 'Floridos',
    descricao: 'O essencial para começar o lar com leveza e charme. Itens cuidadosamente selecionados para quem busca praticidade sem abrir mão da elegância.',
    itens: ['c1', 'c2', 'c3', 'c4', 'c9', 'c12'],
    badge: 'Mais Simples',
    img: 'assets/img/dishesTemplate7.png'
  },
  {
    id: 'p2',
    nome: 'Rústicos',
    descricao: 'A escolha mais popular. Tudo o que vocês precisam para transformar a nova casa num lar aconchegante e sofisticado desde o primeiro dia.',
    itens: ['c1', 'c2', 'c3', 'c4', 'c5', 'c7', 'c9', 'c10', 'c11', 'c12', 'c13', 'c15'],
    badge: 'Mais Popular',
    popular: true,
    img: 'assets/img/dishesTemplate1.png'
  },
  {
    id: 'p3',
    nome: 'Minimalistas',
    descricao: 'Para os noivos que sonham com um lar limpo e refinado. Uma seleção exclusiva com o melhor em design, conforto e sofisticação discreta.',
    itens: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15', 'c16'],
    badge: 'Premium',
    img: 'assets/img/dishesTemplate6.png'
  }
];

/* ─── STORAGE HELPERS ──────────────────────────── */
const Store = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('lp_' + key)) || null; } catch { return null; } },
  set: (key, val) => localStorage.setItem('lp_' + key, JSON.stringify(val)),
  remove: (key) => localStorage.removeItem('lp_' + key),
};

function init() {
  if (!Store.get('catalogo')) Store.set('catalogo', CATALOGO_SEED);
  // Always refresh premontadas seed so names/images stay current
  const pm = Store.get('premontadas');
  if (!pm || (pm[0] && pm[0].nome === 'Lista Essencial')) {
    Store.set('premontadas', PREMONTADAS_SEED);
  }
  if (!Store.get('usuarios')) Store.set('usuarios', [
    { id: 'gestor-01', nome: 'Gestor La Provence', email: 'gestor@laprovence.com', senha: 'Gestor@123', role: 'gestor', telefone: '' }
  ]);
  if (!Store.get('listas')) Store.set('listas', []);
  if (!Store.get('compras')) Store.set('compras', []);
}

/* ─── AUTH ─────────────────────────────────────── */
function getCurrentUser() { return Store.get('currentUser'); }
function setCurrentUser(u) { Store.set('currentUser', u); }
function logout() { Store.remove('currentUser'); window.location.href = 'auth.html'; }

function requireAuth(role) {
  const u = getCurrentUser();
  if (!u) { window.location.href = 'auth.html'; return null; }
  if (role && u.role !== role) { window.location.href = u.role === 'gestor' ? 'gestor.html' : 'dashboard.html'; return null; }
  return u;
}

function login(email, senha) {
  const usuarios = Store.get('usuarios') || [];
  const user = usuarios.find(u => u.email === email && u.senha === senha);
  if (!user) throw new Error('E-mail ou senha incorretos.');
  setCurrentUser(user);
  return user;
}

function register(nome, email, senha, telefone) {
  const usuarios = Store.get('usuarios') || [];
  if (usuarios.find(u => u.email === email)) throw new Error('Este e-mail ja esta cadastrado.');
  const user = {
    id: 'u_' + Date.now(),
    nome, email, senha, telefone,
    role: 'noivo'
  };
  usuarios.push(user);
  Store.set('usuarios', usuarios);
  setCurrentUser(user);
  return user;
}

/* ─── LISTAS ────────────────────────────────────── */
function getListas() { return Store.get('listas') || []; }
function saveListas(l) { Store.set('listas', l); }

function getListaByUser(userId) {
  return getListas().find(l => l.user_id === userId && l.status === 'Ativa');
}

function getListaByCodigo(codigo) {
  return getListas().find(l => l.codigo === codigo.toUpperCase() && l.status === 'Ativa');
}

function criarLista(userId, nomeNoivos, telefone, dataCasamento, itens = []) {
  const listas = getListas();
  const existente = listas.find(l => l.user_id === userId && l.status === 'Ativa');
  if (existente) return existente;

  const codigo = gerarCodigo();
  const lista = {
    id: 'l_' + Date.now(),
    codigo,
    nome_noivos: nomeNoivos,
    telefone,
    data_casamento: dataCasamento,
    status: 'Ativa',
    user_id: userId,
    itens: itens,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  listas.push(lista);
  saveListas(listas);
  return lista;
}

function atualizarListaItens(listaId, itens) {
  const listas = getListas();
  const idx = listas.findIndex(l => l.id === listaId);
  if (idx === -1) return;
  listas[idx].itens = itens;
  listas[idx].updated_at = new Date().toISOString();
  saveListas(listas);
}

function gerarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

/* ─── COMPRAS ───────────────────────────────────── */
function getCompras() { return Store.get('compras') || []; }
function getComprasByLista(listaId) { return getCompras().filter(c => c.lista_id === listaId); }
function getComprasByItem(listaId, itemId) { return getCompras().find(c => c.lista_id === listaId && c.item_id === itemId); }

function registrarCompra(listaId, itemId, dados) {
  // Lock: check if already purchased
  if (getComprasByItem(listaId, itemId)) throw new Error('Este item ja foi presenteado por outro convidado.');

  const compras = getCompras();
  const compra = {
    id: 'comp_' + Date.now(),
    lista_id: listaId,
    item_id: itemId,
    nome_convidado: dados.nome,
    cpf: dados.cpf,
    telefone: dados.telefone,
    valor_pago: dados.valor,
    forma_pagamento: dados.pagamento,
    status_pagamento: 'Confirmado',
    data_compra: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  compras.push(compra);
  Store.set('compras', compras);
  return compra;
}

/* ─── CATALOG ───────────────────────────────────── */
function getCatalogo() { return Store.get('catalogo') || []; }
function getItemById(id) { return getCatalogo().find(i => i.id === id); }
function saveCatalogo(c) { Store.set('catalogo', c); }

function salvarItem(item) {
  const cat = getCatalogo();
  if (item.id) {
    const idx = cat.findIndex(i => i.id === item.id);
    if (idx !== -1) { cat[idx] = { ...cat[idx], ...item, version: (cat[idx].version || 1) + 1, updated_at: new Date().toISOString() }; }
    else cat.push(item);
  } else {
    item.id = 'c_' + Date.now();
    item.version = 1;
    item.status = 'Ativo';
    item.created_at = new Date().toISOString();
    cat.push(item);
  }
  saveCatalogo(cat);
}

function inativarItem(id) {
  const cat = getCatalogo();
  const idx = cat.findIndex(i => i.id === id);
  if (idx !== -1) {
    cat[idx].status = cat[idx].status === 'Ativo' ? 'Inativo' : 'Ativo';
    saveCatalogo(cat);
  }
}

/* ─── PRE-MONTADAS ──────────────────────────────── */
function getPremontadas() { return Store.get('premontadas') || []; }

/* ─── UI HELPERS ────────────────────────────────── */
function toast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'error' ? ' error' : '');
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

function formatMoney(v) { return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
  return dt.toLocaleDateString('pt-BR');
}

function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(cpf[10]);
}

function maskPhone(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length >= 7) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
    else if (v.length >= 3) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
    this.value = v;
  });
}

function maskCPF(input) {
  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6,9) + '-' + v.slice(9);
    else if (v.length > 6) v = v.slice(0,3) + '.' + v.slice(3,6) + '.' + v.slice(6);
    else if (v.length > 3) v = v.slice(0,3) + '.' + v.slice(3);
    this.value = v;
  });
}

/* ─── NAVBAR SCROLL EFFECT ──────────────────────── */
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

/* ─── MODAL CLOSE ON OVERLAY ────────────────────── */
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
}

/* ─── TABS ──────────────────────────────────────── */
function initTabs(container) {
  const el = container || document;
  el.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      const parent = btn.closest('[data-tabs]') || btn.parentElement.closest('section') || document;
      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = parent.querySelector('#' + tabId);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ─── INIT ──────────────────────────────────────── */
init();
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initModals();
  initTabs();
});
