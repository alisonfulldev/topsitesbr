'use client'

import { useState } from 'react'
import { MarketingIcon } from './MarketingIcon'

// Acordeão acessível: botões reais com aria-expanded/aria-controls.
// As respostas ficam sempre no HTML; fechadas, só recolhem (altura 0 + visibility).
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="border-t border-black/15">
      {items.map(({ q, a }, index) => {
        const isOpen = open === index
        const id = 'faq-' + index
        return (
          <div key={q} className="border-b border-black/15">
            <h3>
              <button type="button" id={id + '-pergunta'} aria-expanded={isOpen} aria-controls={id + '-resposta'} onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center justify-between gap-6 py-5 text-left text-base font-semibold sm:py-6 text-black transition-colors hover:text-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:text-xl">
                {q}
                <MarketingIcon name="plus" className={'h-5 w-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ' + (isOpen ? 'rotate-45' : '')} />
              </button>
            </h3>
            <div id={id + '-resposta'} role="region" aria-labelledby={id + '-pergunta'} className={'grid transition-[grid-template-rows,visibility] duration-200 ease-out motion-reduce:transition-none ' + (isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-6 leading-relaxed text-black/75">{a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
