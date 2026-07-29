// Stub — full HTML template enters in Etapa 4
export async function sendProposalEmail(params: {
  to: string
  clientName: string
  proposalTitle: string
  magicLink: string
}): Promise<void> {
  console.log('[PROPOSAL EMAIL] Para:', params.to)
  console.log('[PROPOSAL EMAIL] Assunto: Sua proposta está pronta —', params.proposalTitle)
  console.log('[PROPOSAL EMAIL] Link:', params.magicLink)
}
