// ── Company constants ─────────────────────────────────────────────────────────
// TODO: Add COMPANY_CNPJ when available

export const COMPANY_NAME = 'TOP SITE'
export const COMPANY_EMAIL = process.env.COMPANY_EMAIL ?? 'contato@topsite.com.br'
export const COMPANY_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'
export const COMPANY_CNPJ = '' // TODO: preencher com o CNPJ da empresa
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ── Terms version ─────────────────────────────────────────────────────────────
// Bump this string whenever the Terms of Service or Privacy Policy changes,
// so we can track which version each client accepted.
export const TERMS_VERSION = '1.0'
