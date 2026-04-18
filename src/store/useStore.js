import { create } from 'zustand';
import { CATALOG_VERSION, CATALOGO_SEED, PREMONTADAS_SEED, SPECIFIC_IMG_MAPPINGS, GESTOR_USER } from '../data/seed';

/* ─── localStorage helpers ───────────────────────── */
const lp = {
  get: (key) => { try { return JSON.parse(localStorage.getItem('lp_' + key)) || null; } catch { return null; } },
  set: (key, val) => localStorage.setItem('lp_' + key, JSON.stringify(val)),
  remove: (key) => localStorage.removeItem('lp_' + key),
};

/* ─── seed / init (runs once at store creation) ──── */
function initStorage() {
  if (lp.get('catalogoVersion') !== CATALOG_VERSION) {
    const catalogoComFotos = CATALOGO_SEED.map((item) => {
      let imgs = [];
      if (SPECIFIC_IMG_MAPPINGS[item.id]) {
        imgs = [...SPECIFIC_IMG_MAPPINGS[item.id]];
      } else {
        (item.imgs || []).forEach((img) => {
          let updated = img.replace('assets/img/catalog/', 'assets/img/catalog/ListaItens/ListaItensSemNome/');
          const match = updated.match(/IMG_(\d+)\.(jpg|jpeg|png)$/i);
          if (match) {
            const num = match[1];
            updated = num.length <= 3
              ? updated.replace(/IMG_(\d+)\.(jpg|jpeg|png)$/i, 'IMG$1.jpeg')
              : updated.replace(/\.(jpg|jpeg|png)$/i, '.JPG');
          }
          imgs.push(updated);
        });
      }
      return { ...item, imgs };
    });

    lp.set('catalogo', catalogoComFotos);
    lp.set('catalogoVersion', CATALOG_VERSION);
    lp.set('usuarios', [GESTOR_USER]);
    lp.set('listas', []);
    lp.set('compras', []);
  }

  lp.set('premontadas', PREMONTADAS_SEED);
  if (!lp.get('usuarios')) lp.set('usuarios', [GESTOR_USER]);
  if (!lp.get('listas'))   lp.set('listas', []);
  if (!lp.get('compras'))  lp.set('compras', []);
}

initStorage();

/* ─── code generator ─────────────────────────────── */
function gerarCodigo() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

/* ─── store ──────────────────────────────────────── */
const useStore = create((set, get) => ({
  currentUser: lp.get('currentUser'),

  /* ─── AUTH ─────────────────────────────────────── */
  login(email, senha) {
    const usuarios = lp.get('usuarios') || [];
    const user = usuarios.find((u) => u.email === email && u.senha === senha);
    if (!user) throw new Error('E-mail ou senha incorretos.');
    lp.set('currentUser', user);
    set({ currentUser: user });
    return user;
  },

  register(nome, email, senha, telefone) {
    const usuarios = lp.get('usuarios') || [];
    if (usuarios.find((u) => u.email === email)) throw new Error('Este e-mail já está cadastrado.');
    const user = { id: 'u_' + Date.now(), nome, email, senha, telefone, role: 'noivo' };
    usuarios.push(user);
    lp.set('usuarios', usuarios);
    lp.set('currentUser', user);
    set({ currentUser: user });
    return user;
  },

  logout() {
    lp.remove('currentUser');
    set({ currentUser: null });
  },

  /* ─── LISTAS ────────────────────────────────────── */
  getListas: () => lp.get('listas') || [],

  getListaByUser(userId) {
    return (lp.get('listas') || []).find((l) => l.user_id === userId && l.status === 'Ativa') || null;
  },

  getListaByCodigo(codigo) {
    return (lp.get('listas') || []).find((l) => l.codigo === codigo.toUpperCase() && l.status === 'Ativa') || null;
  },

  criarLista(userId, nomeNoivos, telefone, dataCasamento, itens = [], fotoCasal = null) {
    const listas = lp.get('listas') || [];
    const existente = listas.find((l) => l.user_id === userId && l.status === 'Ativa');
    if (existente) return existente;

    const lista = {
      id: 'l_' + Date.now(),
      codigo: gerarCodigo(),
      nome_noivos: nomeNoivos,
      telefone,
      data_casamento: dataCasamento,
      foto_casal: fotoCasal,
      status: 'Ativa',
      user_id: userId,
      itens,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    listas.push(lista);
    lp.set('listas', listas);
    return lista;
  },

  atualizarListaItens(listaId, itens) {
    const listas = lp.get('listas') || [];
    const idx = listas.findIndex((l) => l.id === listaId);
    if (idx === -1) return;
    listas[idx].itens = itens;
    listas[idx].updated_at = new Date().toISOString();
    lp.set('listas', listas);
  },

  getUserById(userId) {
    return (lp.get('usuarios') || []).find((u) => u.id === userId) || null;
  },

  arquivarLista(listaId) {
    const listas = lp.get('listas') || [];
    const idx = listas.findIndex((l) => l.id === listaId);
    if (idx !== -1) {
      listas[idx].status = 'Inativa';
      listas[idx].updated_at = new Date().toISOString();
      lp.set('listas', listas);
    }
  },

  salvarMensagemLista(listaId, mensagem) {
    const listas = lp.get('listas') || [];
    const idx = listas.findIndex((l) => l.id === listaId);
    if (idx !== -1) {
      listas[idx].mensagem_boas_vindas = mensagem;
      lp.set('listas', listas);
    }
  },

  atualizarFotoCasal(listaId, fotoCasal) {
    const listas = lp.get('listas') || [];
    const idx = listas.findIndex((l) => l.id === listaId);
    if (idx !== -1) {
      listas[idx].foto_casal = fotoCasal;
      listas[idx].updated_at = new Date().toISOString();
      lp.set('listas', listas);
    }
  },

  /* ─── COMPRAS ───────────────────────────────────── */
  getCompras: () => lp.get('compras') || [],

  getComprasByLista(listaId) {
    return (lp.get('compras') || []).filter((c) => c.lista_id === listaId);
  },

  getComprasByItem(listaId, itemId) {
    return (lp.get('compras') || []).find((c) => c.lista_id === listaId && c.item_id === itemId) || null;
  },

  registrarCompra(listaId, itemId, dados) {
    const compras = lp.get('compras') || [];
    if (compras.find((c) => c.lista_id === listaId && c.item_id === itemId)) {
      throw new Error('Este item já foi presenteado por outro convidado.');
    }
    const compra = {
      id: 'comp_' + Date.now(),
      lista_id: listaId,
      item_id: itemId,
      nome_convidado: dados.nome,
      cpf: dados.cpf,
      telefone: dados.telefone,
      valor_pago: dados.valor,
      forma_pagamento: dados.pagamento,
      status_pagamento: 'Pendente',
      data_compra: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_new_gestor: true,
      is_new_noivo: false,
    };
    compras.push(compra);
    lp.set('compras', compras);
    return compra;
  },

  aprovarCompra(compraId) {
    const compras = lp.get('compras') || [];
    const idx = compras.findIndex((c) => c.id === compraId);
    if (idx !== -1) {
      compras[idx].status_pagamento = 'Aprovado';
      compras[idx].is_new_noivo = true;
      lp.set('compras', compras);
    }
  },

  rejeitarCompra(compraId) {
    const compras = lp.get('compras') || [];
    const idx = compras.findIndex((c) => c.id === compraId);
    if (idx !== -1) {
      compras.splice(idx, 1);
      lp.set('compras', compras);
    }
  },

  marcarComprasVistas(role, listaId = null) {
    const compras = lp.get('compras') || [];
    const updated = compras.map((c) => {
      const match = role === 'gestor'
        ? c.is_new_gestor
        : c.lista_id === listaId && c.is_new_noivo;
      if (!match) return c;
      return {
        ...c,
        is_new_gestor: role === 'gestor' ? false : c.is_new_gestor,
        is_new_noivo: role === 'noivo' ? false : c.is_new_noivo,
      };
    });
    lp.set('compras', updated);
  },

  /* ─── CATÁLOGO ──────────────────────────────────── */
  getCatalogo: () => lp.get('catalogo') || [],

  getItemById(id) {
    return (lp.get('catalogo') || []).find((i) => i.id === id) || null;
  },

  salvarItem(item) {
    const cat = lp.get('catalogo') || [];
    if (item.id) {
      const idx = cat.findIndex((i) => i.id === item.id);
      if (idx !== -1) {
        cat[idx] = { ...cat[idx], ...item, version: (cat[idx].version || 1) + 1, updated_at: new Date().toISOString() };
      } else {
        cat.push(item);
      }
    } else {
      cat.push({ ...item, id: 'c_' + Date.now(), version: 1, status: 'Ativo', created_at: new Date().toISOString() });
    }
    lp.set('catalogo', cat);
  },

  inativarItem(id) {
    const cat = lp.get('catalogo') || [];
    const idx = cat.findIndex((i) => i.id === id);
    if (idx !== -1) {
      cat[idx].status = cat[idx].status === 'Ativo' ? 'Inativo' : 'Ativo';
      lp.set('catalogo', cat);
    }
  },

  /* ─── PRÉ-MONTADAS ──────────────────────────────── */
  getPremontadas: () => lp.get('premontadas') || [],

  salvarPremontada(premontada) {
    const list = lp.get('premontadas') || [];
    const idx = list.findIndex((p) => p.id === premontada.id);
    if (idx !== -1) list[idx] = premontada;
    else list.push({ ...premontada, id: 'p_' + Date.now() });
    lp.set('premontadas', list);
  },
}));

export default useStore;
