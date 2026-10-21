import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

// Aba "Site": pedidos do formulário de contato da home e inscritos na newsletter do rodapé.
// Os dados só são lidos aqui, no servidor, depois da checagem de admin.

const PAGE_SIZE = 25

type Tab = 'contatos' | 'newsletter'

function fmtDateTime(d: Date) {
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function buildHref(tab: Tab, q: string, page: number) {
  const params = new URLSearchParams({ aba: tab })
  if (q) params.set('q', q)
  if (page > 1) params.set('pagina', String(page))
  return '/admin/site?' + params.toString()
}

export default async function SiteAdminPage({ searchParams }: { searchParams: { aba?: string; q?: string; pagina?: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') redirect('/login')

  const tab: Tab = searchParams.aba === 'newsletter' ? 'newsletter' : 'contatos'
  const q = (searchParams.q ?? '').trim().slice(0, 100)
  const page = Math.max(1, Number.parseInt(searchParams.pagina ?? '1', 10) || 1)

  const [contactTotal, newsletterTotal] = await Promise.all([
    prisma.contactRequest.count(),
    prisma.lead.count({ where: { source: 'newsletter' } }),
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Site</h2>
        <p className="text-sm text-gray-500 mt-1">Contatos do formulário e inscritos na newsletter de topsitebr.com.br</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {([['contatos', 'Contatos recebidos', contactTotal], ['newsletter', 'Inscritos na newsletter', newsletterTotal]] as const).map(([key, label, total]) => (
          <Link
            key={key}
            href={buildHref(key, '', 1)}
            className={cn(
              '-mb-px px-4 py-2.5 text-sm border-b-2 transition-colors',
              tab === key ? 'border-brand text-gray-900 font-medium' : 'border-transparent text-gray-500 hover:text-gray-800',
            )}
          >
            {label} <span className="text-gray-400">({total})</span>
          </Link>
        ))}
      </div>

      <form action="/admin/site" className="mb-4 flex gap-2">
        <input type="hidden" name="aba" value={tab} />
        <input
          type="search"
          name="q"
          defaultValue={q}
          maxLength={100}
          placeholder={tab === 'contatos' ? 'Buscar por nome, e-mail, telefone, tipo ou mensagem' : 'Buscar por e-mail'}
          className="flex-1 max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
        />
        <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">Buscar</button>
        {q && <Link href={buildHref(tab, '', 1)} className="self-center text-sm text-gray-500 hover:text-gray-800">Limpar</Link>}
      </form>

      {tab === 'contatos' ? <ContactsTable q={q} page={page} /> : <NewsletterTable q={q} page={page} />}
    </div>
  )
}

function Pagination({ tab, q, page, total }: { tab: Tab; q: string; page: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (pages <= 1) return null
  const link = 'rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50'
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
      <span>Página {page} de {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={buildHref(tab, q, page - 1)} className={link}>Anterior</Link>}
        {page < pages && <Link href={buildHref(tab, q, page + 1)} className={link}>Próxima</Link>}
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">{text}</div>
}

// Pedidos antigos guardavam nome e sobrenome separados; os novos, o nome completo
function displayName(row: { name: string; firstName: string | null; lastName: string | null }) {
  return row.name || [row.firstName, row.lastName].filter(Boolean).join(' ')
}

const th = 'text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider'

async function ContactsTable({ q, page }: { q: string; page: number }) {
  const contains = { contains: q, mode: 'insensitive' as const }
  const where = q ? { OR: [{ name: contains }, { email: contains }, { firstName: contains }, { lastName: contains }, { phone: contains }, { siteType: contains }, { message: contains }] } : {}
  const [total, rows] = await Promise.all([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ])

  if (total === 0) return <Empty text={q ? 'Nenhum contato encontrado para essa busca.' : 'Nenhum contato recebido ainda.'} />

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Nome</th>
                <th className={th}>E-mail</th>
                <th className={th}>Telefone</th>
                <th className={th}>Tipo de site</th>
                <th className={th}>Mensagem</th>
                <th className={th}>Recebido em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{displayName(row)}</td>
                  <td className="px-4 py-3 break-all">
                    {row.email ? <a href={'mailto:' + row.email} className="text-gray-700 hover:text-gray-900 hover:underline">{row.email}</a> : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a href={'https://wa.me/' + (row.phone.trim().startsWith('+') ? '' : '55') + row.phone.replace(/\D/g, '')} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-green-700">
                      {row.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.siteType}</td>
                  <td className="px-4 py-3 text-gray-600 min-w-[16rem] max-w-md">
                    {row.message.length <= 120 ? (
                      <p className="whitespace-pre-line break-words">{row.message}</p>
                    ) : (
                      <details>
                        <summary className="cursor-pointer break-words">{row.message.slice(0, 120)}… <span className="text-amber-700">ver tudo</span></summary>
                        <p className="mt-2 whitespace-pre-line break-words">{row.message}</p>
                      </details>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination tab="contatos" q={q} page={page} total={total} />
    </>
  )
}

async function NewsletterTable({ q, page }: { q: string; page: number }) {
  const where = { source: 'newsletter', ...(q ? { email: { contains: q.toLowerCase() } } : {}) }
  const [total, rows] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: { id: true, email: true, createdAt: true } }),
  ])

  if (total === 0) return <Empty text={q ? 'Nenhum inscrito encontrado para essa busca.' : 'Nenhuma inscrição na newsletter ainda.'} />

  // Descadastro (/descadastrar) fica em email_opt_outs — quem está lá não deve receber e-mails
  const optOuts = new Set(
    (await prisma.emailOptOut.findMany({ where: { email: { in: rows.map((r) => r.email) } }, select: { email: true } })).map((o) => o.email),
  )

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>E-mail</th>
                <th className={th}>Inscrito em</th>
                <th className={th}>Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 break-all">{row.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{fmtDateTime(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    {optOuts.has(row.email) ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">Descadastrado</span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">Ativo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination tab="newsletter" q={q} page={page} total={total} />
    </>
  )
}
