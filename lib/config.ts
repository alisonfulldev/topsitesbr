// ── Company constants ─────────────────────────────────────────────────────────

export const COMPANY_NAME = 'TOP SITE'
export const COMPANY_EMAIL = process.env.COMPANY_EMAIL ?? 'contato@topsite.com.br'
export const COMPANY_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5511999999999'
export const COMPANY_CNPJ = '22.556.759/0001-98'
export const COMPANY_CNPJ_DIGITS = '22556759000198'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ── Terms version ─────────────────────────────────────────────────────────────
// Bump this string whenever the Terms of Service or Privacy Policy changes,
// so we can track which version each client accepted.
export const TERMS_VERSION = '1.0'
