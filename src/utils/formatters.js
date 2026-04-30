export function formatMoney(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d + (d.includes('T') ? '' : 'T00:00:00'));
  return dt.toLocaleDateString('pt-BR');
}

export function maskMoney(v) {
  const digits = String(v).replace(/\D/g, '')
  if (!digits) return ''
  const padded = digits.padStart(3, '0')
  const reais = padded.slice(0, -2)
  const centavos = padded.slice(-2)
  return `R$ ${Number(reais).toLocaleString('pt-BR')},${centavos}`
}

export function parseMoney(v) {
  if (!v && v !== 0) return 0
  return Number(String(v).replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

export function numToMaskMoney(v) {
  const num = Number(v) || 0
  const cents = Math.round(num * 100)
  return maskMoney(String(cents))
}
