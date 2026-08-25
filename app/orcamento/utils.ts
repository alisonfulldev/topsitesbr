import type { ProjectType } from './actions'

export function siteBase(type: ProjectType, pages: number): number {
  if (type === 'landing_page') return 297
  if (type === 'loja_virtual') return 1200
  return pages <= 4 ? 500 : 500 + (pages - 4) * 100
}

export function calcTotal(
  type: ProjectType,
  pages: number,
  hasAdmin: boolean,
  hasLogo: boolean,
  hasDomain: boolean,
): number {
  const base = siteBase(type, pages)
  const adminCost = type === 'loja_virtual' ? 0 : (hasAdmin ? base : 0)
  return base + adminCost + (!hasLogo ? 220 : 0) + (!hasDomain ? 140 : 0)
}

export function monthlyPrice(hasAdmin: boolean, type: ProjectType): number {
  return hasAdmin || type === 'loja_virtual' ? 49 : 29
}

export function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function buildWAMessage(q: {
  projectType: ProjectType
  pageCount: number | null
  hasAdmin: boolean
  hasLogo: boolean
  hasDomain: boolean
  hasHosting?: boolean
  totalValue: number
}): string {
  const typeLabel =
    q.projectType === 'landing_page'
      ? 'Landing Page'
      : q.projectType === 'loja_virtual'
      ? 'Loja Virtual'
      : `Site Institucional (${q.pageCount ?? 1} página${(q.pageCount ?? 1) !== 1 ? 's' : ''})`

  const addons: string[] = []
  if (q.hasAdmin && q.projectType !== 'loja_virtual') addons.push('Painel admin / backend')
  if (!q.hasLogo) addons.push('Logotipo')
  if (!q.hasDomain) addons.push('Domínio')
  const addonsLine = addons.length > 0 ? addons.join(', ') : 'Nenhum'

  const total = q.totalValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  const monthly = q.hasHosting
    ? `\nManutenção + Hospedagem: R$${(q.hasAdmin || q.projectType === 'loja_virtual') ? 49 : 29}/mês`
    : ''

  return [
    'Olá! Aprovei meu orçamento na TopSite:',
    '',
    `Projeto: ${typeLabel}`,
    `Adicionais: ${addonsLine}`,
    `Valor total: ${total} — pagamento em 2× no cartão sem juros`,
    monthly,
    '',
    'Quero seguir com meu projeto!',
  ].filter(Boolean).join('\n')
}
