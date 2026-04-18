export function validateCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(cpf[10]);
}

export function validatePassword(senha) {
  return senha.length >= 8 && /[A-Z]/.test(senha) && /[0-9]/.test(senha) && /[^A-Za-z0-9]/.test(senha);
}

/* ─── input masks (returns cleaned value) ────────── */
export function maskPhone(value) {
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length >= 7) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7);
  if (v.length >= 3) return '(' + v.slice(0, 2) + ') ' + v.slice(2);
  return v;
}

export function maskCPF(value) {
  let v = value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) return v.slice(0, 3) + '.' + v.slice(3, 6) + '.' + v.slice(6, 9) + '-' + v.slice(9);
  if (v.length > 6) return v.slice(0, 3) + '.' + v.slice(3, 6) + '.' + v.slice(6);
  if (v.length > 3) return v.slice(0, 3) + '.' + v.slice(3);
  return v;
}

export function maskCurrency(value) {
  let v = value.replace(/\D/g, '');
  if (!v) return '';
  v = parseInt(v, 10).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return 'R$ ' + v;
}
