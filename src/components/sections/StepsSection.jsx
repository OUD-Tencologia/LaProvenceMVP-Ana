const STEPS = [
  { n: 1, t: 'Escolham juntos', p: 'Navegue pelo nosso catálogo curado e adicione os itens que fazem sentido para o lar dos sonhos de vocês. Comece do zero ou use uma de nossas listas pré-montadas.' },
  { n: 2, t: 'Compartilhem', p: 'Com um código único, seus convidados acessam a lista diretamente pelo link ou WhatsApp. Sem complicação, sem downloads, sem cadastro para eles.' },
  { n: 3, t: 'Recebam com amor', p: 'Cada presente é escolhido e registrado em tempo real. Vocês acompanham tudo pelo painel e seus convidados têm a certeza de que o presente chegará com significado.' },
];

export default function StepsSection() {
  return (
    <section className="steps-section reveal" id="como-funciona">
      <div className="section-header steps-header-pad">
        <span className="label-caps cta-label">Simples como deve ser</span>
        <span className="script">Como funciona</span>
        <h2 className="steps-title">Três passos para a lista perfeita</h2>
        <p>Do primeiro clique ao dia mais especial. Nós cuidamos de cada detalhe.</p>
      </div>
      <div className="steps-grid">
        {STEPS.map(({ n, t, p }) => (
          <div key={n} className="step-item">
            <div className="step-number">{n}</div>
            <h3>{t}</h3>
            <p>{p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
