import { Link } from 'react-router-dom';

export default function TemplatesSection({ premontadas, onVerItens }) {
  return (
    <section className="templates-section reveal" id="listas">
      <div className="section-header">
        <span className="script">Nossas Listas</span>
        <h2>Escolha seu <strong>ponto de partida</strong></h2>
        <p>Listas pensadas com carinho para diferentes momentos. Personalize como quiser depois.</p>
      </div>
      <div className="ornament-center ornament">
        <span style={{ color: 'var(--ouro)', fontSize: '0.85rem' }}>&#10022;</span>
      </div>
      <div className="templates-grid">
        {premontadas.map((p) => (
          <div key={p.id} className="template-card template-card--static">
            <span className={`template-card-badge${p.popular ? ' popular' : ''}`}>{p.badge}</span>
            <div className="template-card-img" style={{ backgroundImage: `url('${p.img || 'assets/img/dishesTemplate1.png'}')` }}></div>
            <div className="template-card-body">
              <span className="label-caps">{p.itens.length} itens selecionados</span>
              <h3>{p.nome}</h3>
              <p>{p.descricao}</p>
              <div className="templates-card-actions">
                <button className="btn btn-outline-dark btn-sm" onClick={() => onVerItens(p)}>Ver itens</button>
                <Link to={`/auth?modo=criar&template=${p.id}`} className="btn btn-verde btn-sm">Escolher esta lista</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
