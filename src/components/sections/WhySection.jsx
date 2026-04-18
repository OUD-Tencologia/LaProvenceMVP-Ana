const WHY_ITEMS = [
  {
    path: <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />,
    t: 'Atualização em tempo real',
    p: 'Assim que um presente é escolhido, ele sai da lista instantaneamente. Sem duplicidades, sem confusão.',
  },
  {
    path: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
    t: 'Acesso simples para convidados',
    p: 'Sem cadastro, sem app. Basta o link ou o código. Qualquer pessoa, qualquer dispositivo.',
  },
  {
    path: <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14l-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z" />,
    t: 'Privacidade e segurança',
    p: 'Seus dados e os de seus convidados protegidos com criptografia. Conformidade total com a LGPD.',
  },
  {
    path: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.114 1.532 5.841L.057 23.882l6.198-1.625A11.96 11.96 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.795 9.795 0 0 1-4.997-1.367l-.358-.213-3.677.964.981-3.594-.234-.369A9.795 9.795 0 0 1 2.182 12C2.182 6.579 6.579 2.182 12 2.182S21.818 6.579 21.818 12 17.421 21.818 12 21.818z" />,
    t: 'Compartilhe pelo WhatsApp',
    p: 'Com um clique, envie o link da lista para todos os seus convidados pelo WhatsApp ou qualquer canal.',
  },
];

export default function WhySection() {
  return (
    <section className="why-section reveal">
      <div className="section-header">
        <span className="label-caps">Nosso compromisso</span>
        <h2>Uma experiência <strong>pensada nos detalhes</strong></h2>
      </div>
      <div className="why-grid">
        {WHY_ITEMS.map(({ path, t, p }, i) => (
          <div key={i} className="why-item">
            <div className="why-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">{path}</svg>
            </div>
            <div>
              <h4>{t}</h4>
              <p>{p}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
