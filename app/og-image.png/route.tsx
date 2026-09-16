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
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.15 }}>Sites profissionais</div>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.15, color: '#facc15' }}>e software sob medida.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 25, color: '#d4d4d4' }}>
        <span>Da presença digital à operação da sua empresa.</span>
        <span>topsitebr.com.br</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
