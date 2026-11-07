'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@/components/ui'
import type { ParsedBlock, ParsedProspect } from '@/lib/prospecting/parse'
import { directActivateAction, parseProspectsAction, saveProspectsAction } from '../actions'

const field = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none'

export function NewProspectForm({ allowDirectActivate, liveMode }: { allowDirectActivate: boolean; liveMode: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [text, setText] = useState('')
  const [blocks, setBlocks] = useState<ParsedBlock[] | null>(null)
  const [error, setError] = useState('')

  const valid = blocks?.filter((b) => b.data) ?? []
  const invalid = blocks?.filter((b) => !b.data) ?? []

  const read = () => start(async () => {
    setError('')
    const res = await parseProspectsAction(text)
    if (!res.ok) return setError(res.error)
    setBlocks(res.blocks)
  })

  const direct = () => start(async () => {
    setError('')
    const res = await directActivateAction(text)
    if (!res.ok) {
      setError(res.error)
      if ('blocks' in res) setBlocks(res.blocks)
      return
    }
    router.push('/admin/prospeccao?status=ativo')
  })

  const save = (activate: boolean) => start(async () => {
    setError('')
    const res = await saveProspectsAction(valid.map((b) => b.data!), activate)
    if (!res.ok) return setError(res.error)
    router.push(res.ids.length === 1 ? '/admin/prospeccao/' + res.ids[0] : '/admin/prospeccao?status=' + (activate ? 'ativo' : 'rascunho'))
  })

  const edit = (blockIndex: number, step: number, key: 'subject' | 'body', value: string) => {
    setBlocks((current) => current!.map((b) => b.index !== blockIndex || !b.data ? b : {
      ...b,
      data: { ...b.data, emails: b.data.emails.map((e) => (e.step === step ? { ...e, [key]: value } : e)) },
    }))
  }

  return (
    <div className="space-y-5">
      <Card>
        <label htmlFor="bloco" className="mb-1 block text-sm font-medium text-gray-700">Colar bloco do prospect</label>
        <p className="mb-3 text-xs text-gray-500">
          Uma chave por linha (NOME, EMAIL, NEGOCIO, SEGMENTO, SITE, NOTA, EMAIL1_ASSUNTO, EMAIL1_CORPO … EMAIL5_CORPO).
          Para importar vários de uma vez, separe os blocos com uma linha <code>=====</code>.
        </p>
        <textarea
          id="bloco"
          value={text}
          onChange={(e) => { setText(e.target.value); setBlocks(null) }}
          rows={14}
          spellCheck={false}
          placeholder={'NOME: Maria\nEMAIL: maria@exemplo.com.br\nNEGOCIO: Clínica Sorriso\n…'}
          className={field + ' font-mono text-xs leading-relaxed'}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={read} loading={pending} disabled={!text.trim()}>Ler</Button>
          {allowDirectActivate && (
            <Button variant="secondary" onClick={direct} loading={pending} disabled={!text.trim()}>Ler e ativar direto</Button>
          )}
        </div>
      </Card>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {blocks && (
        <>
          <p className="text-sm text-gray-600">
            {blocks.length} bloco(s) lido(s): <strong className="text-green-700">{valid.length} ok</strong>
            {invalid.length > 0 && <>, <strong className="text-red-700">{invalid.length} com erro</strong> (serão ignorados)</>}.
          </p>

          {invalid.map((b) => (
            <Card key={b.index} className="border-red-200 bg-red-50">
              <p className="mb-2 text-sm font-semibold text-red-800">Bloco {b.index}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                {b.errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </Card>
          ))}

          {valid.map((b) => <BlockPreview key={b.index} index={b.index} data={b.data!} onEdit={edit} />)}

          {valid.length > 0 && (
            <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => save(false)} loading={pending}>Salvar como rascunho</Button>
              <Button onClick={() => save(true)} loading={pending}>Aprovar e ativar ({valid.length})</Button>
            </div>
          )}
          {valid.length > 0 && !liveMode && (
            <p className="text-xs text-gray-500">Modo teste ligado: ao ativar, os e-mails ficam agendados, mas nada sai para o prospect até você ligar os envios reais.</p>
          )}
        </>
      )}
    </div>
  )
}

function BlockPreview({ index, data, onEdit }: { index: number; data: ParsedProspect; onEdit: (block: number, step: number, key: 'subject' | 'body', value: string) => void }) {
  return (
    <Card>
      <div className="mb-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <p><span className="text-gray-500">Nome:</span> {data.name}</p>
        <p><span className="text-gray-500">E-mail:</span> {data.email}</p>
        <p><span className="text-gray-500">Negócio:</span> {data.business}</p>
        {data.segment && <p><span className="text-gray-500">Segmento:</span> {data.segment}</p>}
        {data.site && <p><span className="text-gray-500">Site:</span> {data.site}</p>}
        {data.score !== null && <p><span className="text-gray-500">Nota:</span> {data.score}</p>}
      </div>
      <div className="space-y-2">
        {data.emails.map((email) => (
          <details key={email.step} className="rounded-lg border border-gray-200" open={email.step === 1}>
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-800">
              E-mail {email.step}: <span className="font-normal text-gray-600">{email.subject}</span>
            </summary>
            <div className="space-y-2 border-t border-gray-100 p-3">
              <input aria-label={`Assunto do e-mail ${email.step}`} value={email.subject} onChange={(e) => onEdit(index, email.step, 'subject', e.target.value)} className={field} />
              <textarea aria-label={`Corpo do e-mail ${email.step}`} value={email.body} onChange={(e) => onEdit(index, email.step, 'body', e.target.value)} rows={10} className={field + ' leading-relaxed'} />
            </div>
          </details>
        ))}
      </div>
    </Card>
  )
}
