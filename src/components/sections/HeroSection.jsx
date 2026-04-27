import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection({ onAcessarLista }) {
  const [code, setCode] = useState('');

  function handleAcessar() {
    if (!code.trim()) return;
    onAcessarLista(code.trim());
  }

  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: 'url("/assets/img/hero1.png")' }}></div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>Monte a lista</h1>
        <span className="script-title">dos seus sonhos</span>
        <p>Detalhes pensados com carinho para o lar que vocês estão construindo. Uma experiência elegante, simples para os noivos e inesquecível para quem os ama.</p>
        <div className="hero-access-bar">
          <div className="hero-access-col hero-access-noivos">
            <span className="hero-access-label">Sou noivo(a)</span>
            <Link to="/auth?modo=criar" className="btn btn-primary">Crie sua lista</Link>
          </div>
          <div className="hero-access-divider"></div>
          <div className="hero-access-col hero-access-convidado">
            <span className="hero-access-label">Sou convidado</span>
            <div className="hero-access-input-row">
              <input
                type="text"
                placeholder="Código da lista"
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleAcessar()}
              />
              <button className="btn btn-outline" onClick={handleAcessar}>Acessar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
