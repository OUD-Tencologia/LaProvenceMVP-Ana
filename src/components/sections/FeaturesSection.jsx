const FEATURES = [
  { t: 'Mix completo e elegante', p: 'Oferecemos um catálogo completo de produtos para casa, adornos e mesa posta para tornar este momento ainda mais inesquecível. Tudo com a sofisticação que seu novo lar merece.' },
  { t: 'Resgate com praticidade', p: 'Você pode resgatar os produtos físicos diretamente ou optar pelo vale-troca, escolhendo outros itens do nosso catálogo que combinam perfeitamente com o seu estilo.' },
  { t: 'Atendimento Personalizado', p: 'Nossa equipe acompanha cada presente de perto. A finalização é feita através de um contato direto, garantindo segurança, exclusividade e proximidade com seus convidados.' },
  { t: 'Segurança no Pagamento:', p: 'Para sua tranquilidade, os pagamentos são finalizados via WhatsApp diretamente com a nossa equipe da loja. Aceitamos Pix ou Cartão de forma totalmente segura e transparente.' },
];

export default function FeaturesSection() {
  return (
    <section className="features-section reveal" id="diferenciais">
      <div className="features-container">
        <div className="features-text">
          <span className="label-caps">O lar dos sonhos</span>
          <h2>Na La Provence Decor você encontra <strong>tudo o que você precisa</strong></h2>
          {FEATURES.map(({ t, p }, i) => (
            <div key={i} className={`feature-item${i === FEATURES.length - 1 ? ' feature-item--last' : ''}`}>
              <h4>{t}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <div className="features-grid">
          <img src="assets/img/catalog/buleFlorido.jpeg" alt="Decor" className="fg-img main-img" />
          <img src="assets/img/catalog/Item1.png" alt="Decor" className="fg-img overlap-img" />
        </div>
      </div>
    </section>
  );
}
