import { useState, useEffect } from 'react';
import WAIcon from '../ui/WAIcon';

export default function WABubble() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="wa-bubble" onClick={() => setOpen((v) => !v)}>
        <WAIcon size={26} />
      </div>
      <div className={`wa-popup${open ? ' open' : ''}`}>
        <div className="wa-popup-header">
          <div className="wa-popup-header-info">
            <div className="wa-popup-avatar">
              <WAIcon size={22} />
            </div>
            <div>
              <div className="wa-popup-brand-name">La Provence Decor</div>
              <div className="wa-popup-brand-hours">Seg. a Sáb. · 08h às 18h</div>
            </div>
          </div>
          <button className="wa-popup-close" onClick={() => setOpen(false)}>&times;</button>
        </div>
        <div className="wa-popup-body">
          <div className="wa-popup-msg">Oi! 👋 Pronto para montar a lista de casamento dos sonhos? Fale com a gente e tire todas as suas dúvidas. Atendemos de <strong>segunda a sábado, das 08h às 18h</strong>. ✨</div>
        </div>
        <div className="wa-popup-footer">
          <a href="https://wa.me/5565996828577?text=Ola!%20Tenho%20interesse%20na%20Lista%20de%20Casamento%20La%20Provence." target="_blank" rel="noreferrer" className="wa-popup-btn">
            Iniciar conversa
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </a>
        </div>
      </div>
    </>
  );
}
