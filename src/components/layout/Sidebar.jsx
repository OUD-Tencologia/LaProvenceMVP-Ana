import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { listasService } from '../../services/listas.js';

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.114 1.532 5.841L.057 23.882l6.198-1.625A11.96 11.96 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 0 1-4.997-1.367l-.358-.213-3.677.964.981-3.594-.234-.369A9.795 9.795 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z" />
  </svg>
);

export default function Sidebar({ role = 'noivo' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useStore();

  const currentTab = new URLSearchParams(location.search).get('tab') || 'listas';

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function compartilharWhatsApp() {
    if (!currentUser?.id) return;
    try {
      const lista = await listasService.getByUser(currentUser.id);
      if (!lista) return;
      const url = `${window.location.origin}/lista?codigo=${lista.codigo}`;
      const msg = encodeURIComponent(
        `Oi! ${lista.nome_noivos} estão se casando e montaram a lista de presentes no La Provence.\n\nAcesse aqui: ${url}\n\nOu use o código: ${lista.codigo}`
      );
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    } catch { /* silently fail */ }
  }

  const initials = currentUser?.nome?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  const gestorLinks = (
    <>
      <div className="sidebar-section-label">Gestão</div>
      <Link
        to="/admin"
        className={location.pathname === '/admin' && currentTab === 'listas' ? 'active' : ''}
        onClick={() => setOpen(false)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
        Listas de Casamento
      </Link>
      <Link
        to="/admin?tab=catalogo"
        className={location.pathname === '/admin' && currentTab === 'catalogo' ? 'active' : ''}
        onClick={() => setOpen(false)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
        Catálogo de Itens
      </Link>
      <Link
        to="/admin?tab=premontadas"
        className={location.pathname === '/admin' && currentTab === 'premontadas' ? 'active' : ''}
        onClick={() => setOpen(false)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" /></svg>
        Pré-montadas
      </Link>
    </>
  );

  const noivoLinks = (
    <>
      <div className="sidebar-section-label">Menu</div>
      <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
        Minha Lista
      </NavLink>
      <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'active' : ''}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" /></svg>
        Catálogo de Itens
      </NavLink>
      <div className="sidebar-section-label">Compartilhar</div>
      <NavLink to="/story" className={({ isActive }) => isActive ? 'active' : ''}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z" /></svg>
        Story Instagram
      </NavLink>
      <a href="#" onClick={(e) => { e.preventDefault(); compartilharWhatsApp(); }}>
        {WA_ICON}
        Compartilhar
      </a>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ height: 28 }} />
        <button className="sidebar-toggle" aria-label="Abrir Menu" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </div>

      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 150 }} />
          </Link>
        </div>
        <nav className="sidebar-nav" onClick={() => setOpen(false)}>
          {role === 'gestor' ? gestorLinks : noivoLinks}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <small>{role === 'gestor' ? 'Gestor' : 'Noivos'}</small>
              <span>{currentUser?.nome?.split(' ')[0] || 'La Provence'}</span>
            </div>
          </div>
          <div style={{ marginTop: '0.8rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ fontSize: '0.7rem', color: 'rgba(251,221,144,0.4)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Sair
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
