'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GiftIcon, UsersIcon } from '@/components/ui/icons'

type Referral = {
  id: string
  referredName: string
  status: 'confirmado' | 'recompensado'
  createdAt: string
}

const HOW_IT_WORKS = [
  'Compartilhe seu link com amigos e conhecidos',
  'Seu amigo entra em contato via WhatsApp com seu código',
  'Quando ele ativar o plano, você ganha 1 mês grátis',
]

export function IndicacoesClientPage({
  referralCode,
  referralLink,
  referrals,
}: {
  referralCode: string
  referralLink: string
  referrals: Referral[]
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleWhatsAppShare() {
    const text = `Olá! Tenho um site profissional com hospedagem, SSL e suporte. O primeiro mês é grátis e depois R$29/mês. Você pode ter o seu também: ${referralLink}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Site profissional por R$97', text, url: referralLink })
      } catch {
        // user cancelled — do nothing
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-brand-dark rounded-2xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-brand/15 flex items-center justify-center">
            <GiftIcon className="w-7 h-7 text-brand" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Indique um amigo e ganhe 1 mês grátis</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Seu amigo descobre o site de R$97 · Você ganha um mês sem pagar
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Como funciona
        </p>
        <ol className="space-y-3">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-brand-50 text-brand-text text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700 leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Share section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Seu link</p>

        {/* Link display */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-sm text-gray-700 break-all min-h-[44px] flex items-center">
          {referralLink}
        </div>

        {/* Share buttons */}
        <div className="flex gap-3">
          <Button variant="primary" size="md" fullWidth onClick={handleWhatsAppShare}>
            {/* WhatsApp icon */}
            <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Compartilhar no WhatsApp
          </Button>
          <Button variant="secondary" size="md" onClick={handleCopy} className="shrink-0 min-w-[96px]">
            {copied ? '✓ Copiado' : 'Copiar link'}
          </Button>
        </div>

        <p className="text-xs text-gray-400">
          Código:{' '}
          <span className="font-mono font-semibold text-gray-600">{referralCode}</span>
        </p>
      </div>

      {/* Referrals list */}
      {referrals.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              Suas indicações{' '}
              <span className="text-gray-400 font-normal">({referrals.length})</span>
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.referredName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge variant={r.status === 'recompensado' ? 'success' : 'warning'}>
                  {r.status === 'recompensado' ? 'Recompensada' : 'Aguardando ativação'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Nenhuma indicação ainda</p>
          <p className="text-sm text-gray-500">
            Compartilhe seu link e comece a ganhar meses grátis!
          </p>
        </div>
      )}
    </div>
  )
}
