import { Link } from 'react-router-dom';
import WAIcon from '../ui/WAIcon';

const IG_PATH = 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z';

export default function SiteFooter() {
  return (
    <footer className="reveal">
      <div className="footer-grid">
        <div className="footer-logo">
          <img src="assets/img/LaProvenceDecor-Logo.png" alt="La Provence" />
          <div className="footer-social-links">
            <a href="https://www.instagram.com/laprovencedecor/" target="_blank" rel="noreferrer" className="footer-social-link" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={IG_PATH} /></svg>
            </a>
            <a href="https://wa.me/5565996828577" target="_blank" rel="noreferrer" className="footer-social-link" title="WhatsApp">
              <WAIcon size={20} />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Contato</h5>
          <address>
            <a href="tel:+5565996828577" className="footer-phone-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
              (65) 99682-8577
            </a>
            <span className="footer-address-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="footer-address-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              Av. Pres. Marques, 35 — Goiabeiras, Cuiabá-MT
            </span>
          </address>
        </div>
        <div className="footer-col">
          <h5>Horário de Atendimento</h5>
          <p>Segunda a Sábado<br />08h às 18h</p>
        </div>
        <div className="footer-col">
          <h5>Sobre Nós</h5>
          <p className="footer-about-text">A La Provence Decor acredita que montar a lista de casamento é um ato de amor. Cada item escolhido carrega o desejo de construir um lar bonito, acolhedor e cheio de significado.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 La Provence Decor. Todos os direitos reservados.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacidade</a>
          <a href="#">Termos de Uso</a>
          <Link to="/admin">Área do Gestor</Link>
        </div>
      </div>
    </footer>
  );
}
