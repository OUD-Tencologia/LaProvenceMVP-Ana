export function formatMoney(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
  return dt.toLocaleDateString('pt-BR');
}
