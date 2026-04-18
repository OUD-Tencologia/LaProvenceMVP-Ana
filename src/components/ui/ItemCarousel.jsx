import { useState } from 'react';

export default function ItemCarousel({ item, context = '' }) {
  const imgs = item.imgs?.length ? item.imgs : ['assets/img/dishesTemplate.png'];
  const [idx, setIdx] = useState(0);
  const multi = imgs.length > 1;

  const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + imgs.length) % imgs.length); };
  const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % imgs.length); };

  return (
    <div className="item-carousel">
      <img
        className="carousel-img"
        src={imgs[idx]}
        alt={item.nome}
        onError={(e) => { e.target.src = 'assets/img/dishesTemplate.png'; }}
      />
      <div className="carousel-setor-badge">{item.setor}</div>
      {multi && (
        <>
          <button className="carousel-btn carousel-prev" onClick={prev}>&#8249;</button>
          <button className="carousel-btn carousel-next" onClick={next}>&#8250;</button>
          <div className="carousel-dots">
            {imgs.map((_, i) => (
              <span key={i} className={`carousel-dot${i === idx ? ' active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
