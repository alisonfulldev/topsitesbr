import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { unsubscribeByToken } from '@/lib/prospecting/service'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Descadastro', robots: { index: false, follow: false } }

// Link de descadastro do rodapé dos e-mails de prospecção. O descadastro só acontece no clique do botão,
// para que robôs que abrem os links dos e-mails não descadastrem ninguém por engano.
async function confirm(formData: FormData) {
  'use server'
  const token = String(formData.get('token') ?? '')
  const test = formData.get('teste') === '1'
  if (!test) await unsubscribeByToken(token, 'link')
  redirect(`/sair/${encodeURIComponent(token)}?feito=1${test ? '&teste=1' : ''}`)
}

const box = 'mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center'

export default async function Page({ params, searchParams }: { params: { token: string }; searchParams: { feito?: string; teste?: string } }) {
  const prospect = await prisma.prospect.findUnique({ where: { unsubscribeToken: params.token }, select: { status: true } })
  const test = searchParams.teste === '1'
  const done = searchParams.feito === '1' || prospect?.status === 'descadastrado'

  return (
    <main className="flex min-h-screen items-center bg-gray-50 px-4 py-12">
      <div className={box}>
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-900">TOP SITE</p>
        {!prospect ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900">Link inválido</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Este link de descadastro não foi encontrado.</p>
          </>
        ) : done ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900">Descadastro confirmado</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              {test ? 'Teste: nada foi alterado. Num e-mail real, o endereço sairia da lista agora.' : 'Você não receberá mais nossos e-mails.'}
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-900">Não quer mais receber nossos e-mails?</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Confirme abaixo e o seu endereço sai da nossa lista na hora.</p>
            <form action={confirm} className="mt-6">
              <input type="hidden" name="token" value={params.token} />
              {test && <input type="hidden" name="teste" value="1" />}
              <button type="submit" className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700">
                Confirmar descadastro
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
