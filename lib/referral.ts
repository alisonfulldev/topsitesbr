const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function generateReferralCode(name: string): string {
  const prefix = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'X')

  const suffix = Array.from({ length: 5 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')

  return `${prefix}${suffix}`
}
