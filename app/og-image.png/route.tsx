import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '64px 72px',
      background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif',
      borderBottom: '12px solid #facc15',
    }}>
      <div style={{ display: 'flex', fontSize: 30, letterSpacing: 6, color: '#facc15' }}>TOP SITE</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>Sites profissionais</div>
        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.1, color: '#facc15' }}>para o seu negócio.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#d4d4d4' }}>
        <span>Design · SEO · Atendimento em todo o Brasil</span>
        <span>topsitebr.com.br</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
