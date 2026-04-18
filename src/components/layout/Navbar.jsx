import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { currentUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashHref = currentUser?.role === 'gestor' ? '/admin' : '/dashboard';
  const dashLabel = currentUser?.role === 'gestor' ? 'Painel do Gestor' : 'Minha Lista';

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="navbar-logo">
        <img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" style={{ width: 180, height: 'auto' }} />
      </Link>
      <div className="navbar-nav">
        <a href="#como-funciona">Como Funciona</a>
        <a href="#listas">Nossas Listas</a>
        {currentUser
          ? <Link to={dashHref}>{dashLabel}</Link>
          : <Link to="/auth">Entrar</Link>
        }
        <Link to="/auth?modo=criar" className="btn btn-primary nav-btn-criar">Criar Lista</Link>
      </div>
    </nav>
  );
}
