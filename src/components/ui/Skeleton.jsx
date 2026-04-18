export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-img">
        <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div className="skeleton-card-body">
        <div className="skeleton skeleton-line-sm" style={{ width: '40%' }} />
        <div className="skeleton skeleton-line-lg" style={{ width: '80%' }} />
        <div className="skeleton skeleton-line" style={{ width: '55%' }} />
        <div className="skeleton skeleton-line" style={{ width: '35%' }} />
        <div className="skeleton skeleton-btn" style={{ width: '100%' }} />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="skeleton-stat">
      <div className="skeleton skeleton-line-sm" style={{ width: '50%' }} />
      <div className="skeleton skeleton-line-lg" style={{ width: '35%' }} />
      <div className="skeleton skeleton-line-sm" style={{ width: '60%' }} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.8rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 4, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div className="skeleton skeleton-line" style={{ width: '60%' }} />
        <div className="skeleton skeleton-line-sm" style={{ width: '40%' }} />
      </div>
      <div className="skeleton skeleton-line" style={{ width: 80 }} />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="catalog-grid catalog-grid-large">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonStatsGrid({ count = 4 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonStat key={i} />)}
    </div>
  );
}
