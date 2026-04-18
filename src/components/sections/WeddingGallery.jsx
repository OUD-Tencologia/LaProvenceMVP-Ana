const TIPS = [
  { n: 1, t: 'Converse sobre o lar', p: 'Alinhem prioridades antes de adicionar qualquer item: estilos, essenciais, prioridades.' },
  { n: 2, t: 'Varie os valores', p: 'Inclua itens de diferentes faixas de preço para que todos possam presentear com carinho.' },
  { n: 3, t: 'Pense em cada cômodo', p: 'Cozinha, sala, quarto, banheiro — percorra o lar e garanta cobertura completa.' },
  { n: 4, t: 'Não se limite', p: 'Adicione mais itens do que espera receber. Dá mais opções e aumenta as chances.' },
  { n: 5, t: 'Compartilhe cedo', p: 'Divulgue com 2 meses de antecedência para os convidados planejarem com calma.' },
  { n: 6, t: 'Acompanhe em tempo real', p: 'Pelo painel, vocês sabem exatamente o que foi presenteado — sem surpresas!' },
];

export default function WeddingGallery() {
  return (
    <section className="wedding-gallery reveal">
      <div className="section-header wg-header">
        <span className="label-caps">Guia prático</span>
        <h2>Como montar <strong>sua lista?</strong></h2>
        <p>Seis dicas pensadas para vocês escolherem com calma, carinho e alegria.</p>
      </div>
      <div className="wg-container">
        <div className="wg-left">
          <img src="assets/img/QuadroCasalAdornos.png" className="wg-main-img" alt="Casal de noivos" />
        </div>
        <div className="wg-right">
          <div className="wg-grid">
            {TIPS.map(({ n, t, p }) => (
              <div key={n} className="wg-step-card">
                <div className="wg-step-num">{n}</div>
                <h4>{t}</h4>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
