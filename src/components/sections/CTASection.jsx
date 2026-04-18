import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="cta-section reveal">
      <div className="section-header">
        <span className="label-caps cta-label">O grande dia se aproxima</span>
        <h2 className="cta-title">Prontos para montar a lista <strong>dos sonhos?</strong></h2>
        <p>Gratuito, elegante e pensado para tornar esse momento ainda mais especial.</p>
      </div>
      <Link to="/auth?modo=criar" className="btn btn-primary btn-lg">Criar Lista dos sonhos</Link>
    </section>
  );
}
