/* Key/value info row used in modals */
export default function InfoRow({ label, children, highlight = false }) {
  return (
    <div className="info-row">
      <span className="info-row__label">{label}</span>
      <span className={`info-row__value${highlight ? ' info-row__value--highlight' : ''}`}>{children}</span>
    </div>
  );
}
