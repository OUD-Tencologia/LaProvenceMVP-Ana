const VARIANT_MAP = {
  Ativo:      'active',
  Inativo:    'inactive',
  Pendente:   'pending',
  Aprovado:   'approved',
  Confirmado: 'approved',
};

export default function StatusBadge({ status }) {
  const variant = VARIANT_MAP[status] || 'default';
  return <span className={`status-badge status-badge--${variant}`}>{status}</span>;
}
