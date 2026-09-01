export function validateCpf(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  if (rem !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  rem = (sum * 10) % 11
  if (rem === 10 || rem === 11) rem = 0
  return rem === parseInt(digits[10])
}

export function formatCpf(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

export function validateCnpj(raw: string): boolean {
  const d = raw.replace(/\D/g, '')
  if (d.length !== 14) return false
  if (/^(\d)\1{13}$/.test(d)) return false

  const calc = (digits: string, weights: number[]): number => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(digits[i]) * w, 0)
    const rem = sum % 11
    return rem < 2 ? 0 : 11 - rem
  }

  if (calc(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) !== parseInt(d[12])) return false
  if (calc(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) !== parseInt(d[13])) return false
  return true
}

export function validateDocument(raw: string): boolean {
  const d = raw.replace(/\D/g, '')
  if (d.length === 11) return validateCpf(d)
  if (d.length === 14) return validateCnpj(d)
  return false
}

export function formatDocument(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) return formatCpf(d)
  // CNPJ: 00.000.000/0000-00
  const a = d.slice(0, 2)
  const b = d.slice(2, 5)
  const c = d.slice(5, 8)
  const e = d.slice(8, 12)
  const f = d.slice(12, 14)
  let r = a
  if (d.length > 2) r += '.' + b
  if (d.length > 5) r += '.' + c
  if (d.length > 8) r += '/' + e
  if (d.length > 12) r += '-' + f
  return r
}
