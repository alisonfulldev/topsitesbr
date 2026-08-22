import type { ProjectType } from './actions'

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
