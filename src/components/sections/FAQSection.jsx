import { useState } from 'react';
import WAIcon from '../ui/WAIcon';

const FAQS = [
  { q: 'A lista tem algum custo de adesão?', a: 'Não! Criar e manter a sua lista de casamento na La Provence Decor é totalmente gratuito.' },
  { q: 'Como funciona a entrega dos presentes?', a: 'Vocês podem optar por receber os produtos físicos no conforto do seu endereço cadastrado, ou converter o valor em créditos (vale-troca) para uso futuro na loja.' },
  { q: 'Como realizo o pagamento do presente?', a: 'Após escolher o presente no site, você será direcionado para o nosso WhatsApp. Lá, nossa equipe enviará as orientações para a finalização do pagamento via Pix ou Cartão de forma 100% segura.' },
  { q: 'Posso trocar presentes repetidos?', a: 'Como os presentes são baixados da lista assim que a reserva é feita, não há risco de presentes repetidos. No entanto, se os noivos desejarem trocar alguma peça posteriormente, poderão utilizar o crédito como vale-troca.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="faq-section reveal" id="faq">
      <div className="faq-container">
        <div className="faq-left">
          <span className="label-caps">Tire suas dúvidas</span>
          <h2>Perguntas<br /><strong>Frequentes</strong></h2>
          <div className="faq-socials">
            <a href="https://www.instagram.com/laprovencedecor/" target="_blank" rel="noreferrer" title="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
            <a href="https://wa.me/5565996828577" target="_blank" rel="noreferrer" title="WhatsApp">
              <WAIcon size={24} />
            </a>
          </div>
          <div className="faq-address">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
            <span>Av. Pres. Marques, 35<br />Goiabeiras, Cuiabá-MT</span>
          </div>
        </div>
        <div className="faq-right">
          {FAQS.map((f, i) => (
            <div key={i} className={`faq-item${open === i ? ' active' : ''}`}>
              <div className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                {f.q} <span className="faq-icon"></span>
              </div>
              <div className="faq-answer"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
