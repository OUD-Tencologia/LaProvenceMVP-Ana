import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const dashHref = currentUser?.role === 'gestor' ? '/admin' : '/dashboard';
  const dashLabel = currentUser?.role === 'gestor' ? 'Painel do Gestor' : 'Minha Lista';

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="navbar-logo">
        <img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 180, height: 'auto' }} />
      </Link>
      <div className="navbar-nav">
        <a href="#como-funciona">Como Funciona</a>
        <a href="#listas">Nossas Listas</a>
        {currentUser
          ? <Link to={dashHref} id="nav-entrar">{dashLabel}</Link>
          : <Link to="/auth" id="nav-entrar">Entrar</Link>
        }
        <Link to="/auth?modo=criar" className="btn btn-primary nav-btn-criar">Criar Lista</Link>
      </div>

      <button type="button" className="navbar-hamburger" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <button type="button" className="navbar-mobile-overlay" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />
          <div className="navbar-mobile-drawer">
            <div className="navbar-mobile-header">
              <img src="/assets/img/LaProvenceDecor-Logo.png" alt="La Provence Decor" style={{ height: 28 }} />
              <button type="button" className="navbar-mobile-close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <nav className="navbar-mobile-links">
              <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como Funciona</a>
              <a href="#listas" onClick={() => setMenuOpen(false)}>Nossas Listas</a>
              {currentUser
                ? <Link to={dashHref} onClick={() => setMenuOpen(false)}>{dashLabel}</Link>
                : <Link to="/auth" onClick={() => setMenuOpen(false)}>Entrar</Link>
              }
              <Link to="/auth?modo=criar" className="btn btn-primary" style={{ textAlign: 'center', marginTop: '0.75rem' }} onClick={() => setMenuOpen(false)}>
                Criar Lista
              </Link>
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}
