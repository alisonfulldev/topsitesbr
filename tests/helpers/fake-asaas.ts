// Asaas falso em memória para os testes: responde às rotas que o sistema chama via asaasFetch.
// Uso: vi.mock('@/lib/integrations/asaas', () => fakeAsaasModule()) e fakeAsaas.reset() a cada teste.

export type FakePayment = {
  id: string
  customer: string
  subscription?: string
  status: string
  value: number
  dueDate: string
  paymentDate?: string
  billingType: string
  invoiceUrl: string
}
export type FakeSubscription = { id: string; customer: string; value: number; nextDueDate: string; status: string }
export type FakeAuthorization = {
  id: string
  customerId: string
  status: string
  value: number
  startDate: string
  subscriptionId: string | null
  immediateQrCode: { payload: string; encodedImage: string; expirationDate: string }
}

let seq = 0
const nextId = (prefix: string) => `${prefix}_${(++seq).toString(36).padStart(6, '0')}`

export const fakeAsaas = {
  customers: new Map<string, { id: string; name: string; email: string; mobilePhone?: string }>(),
  payments: new Map<string, FakePayment>(),
  subscriptions: new Map<string, FakeSubscription>(),
  authorizations: new Map<string, FakeAuthorization>(),
  notifications: new Map<string, { id: string; event: string; whatsappEnabledForCustomer: boolean }[]>(),
  calls: [] as { method: string; path: string; body?: unknown }[],
  reset() {
    this.customers.clear(); this.payments.clear(); this.subscriptions.clear(); this.authorizations.clear(); this.notifications.clear()
    this.calls = []
  },
  addPayment(p: Partial<FakePayment> & Pick<FakePayment, 'customer' | 'dueDate' | 'value' | 'status'>) {
    const payment: FakePayment = { id: nextId('pay'), billingType: 'UNDEFINED', invoiceUrl: 'https://asaas.test/i/x', ...p }
    this.payments.set(payment.id, payment)
    return payment
  },
  addSubscription(s: Pick<FakeSubscription, 'customer' | 'value' | 'nextDueDate'>) {
    const sub: FakeSubscription = { id: nextId('sub'), status: 'ACTIVE', ...s }
    this.subscriptions.set(sub.id, sub)
    return sub
  },
  /** Simula o cliente pagando o QR imediato: autorização vira ACTIVE e ganha uma assinatura. */
  payAuthorization(authId: string) {
    const auth = this.authorizations.get(authId)!
    auth.status = 'ACTIVE'
    auth.subscriptionId = this.addSubscription({ customer: auth.customerId, value: auth.value, nextDueDate: auth.startDate }).id
    this.addPayment({ customer: auth.customerId, status: 'RECEIVED', value: auth.value, dueDate: new Date().toISOString().slice(0, 10), billingType: 'PIX', paymentDate: new Date().toISOString().slice(0, 10) })
    return auth
  },
}

function notFound(path: string): never {
  throw new Error(`Asaas: recurso não encontrado (${path})`)
}

export async function fakeAsaasFetch<T>(path: string, options: { method?: string; body?: string } = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const body = options.body ? JSON.parse(options.body) : undefined
  fakeAsaas.calls.push({ method, path, body })
  const [p, query = ''] = path.split('?')
  const q = new URLSearchParams(query)
  let m: RegExpMatchArray | null

  if (method === 'POST' && p === '/customers') {
    const c = { id: nextId('cus'), name: body.name, email: body.email, mobilePhone: body.mobilePhone }
    fakeAsaas.customers.set(c.id, c)
    fakeAsaas.notifications.set(c.id, [{ id: nextId('not'), event: 'PAYMENT_OVERDUE', whatsappEnabledForCustomer: false }])
    return c as T
  }
  if ((m = p.match(/^\/customers\/([^/]+)\/notifications$/))) return { data: fakeAsaas.notifications.get(m[1]) ?? [] } as T
  if (method === 'PUT' && p === '/notifications/batch') {
    for (const n of body.notifications) {
      const list = fakeAsaas.notifications.get(body.customer) ?? []
      const found = list.find((x) => x.id === n.id)
      if (found) Object.assign(found, n)
    }
    return {} as T
  }
  if (method === 'POST' && p === '/payments') {
    return fakeAsaas.addPayment({ customer: body.customer, status: 'PENDING', value: body.value, dueDate: body.dueDate, billingType: body.billingType }) as T
  }
  if (p === '/payments' && method === 'GET') {
    const data = [...fakeAsaas.payments.values()].filter((x) => (!q.get('customer') || x.customer === q.get('customer')) && (!q.get('billingType') || x.billingType === q.get('billingType')))
    return { data } as T
  }
  if ((m = p.match(/^\/payments\/([^/]+)\/receiveInCash$/))) {
    const pay = fakeAsaas.payments.get(m[1]) ?? notFound(p)
    pay.status = 'RECEIVED_IN_CASH'; pay.paymentDate = body.paymentDate
    return pay as T
  }
  if ((m = p.match(/^\/payments\/([^/]+)$/))) {
    if (method === 'DELETE') { fakeAsaas.payments.delete(m[1]); return { deleted: true } as T }
    return (fakeAsaas.payments.get(m[1]) ?? notFound(p)) as T
  }
  if ((m = p.match(/^\/subscriptions\/([^/]+)\/payments$/))) {
    return { data: [...fakeAsaas.payments.values()].filter((x) => x.subscription === m![1]).sort((a, b) => b.dueDate.localeCompare(a.dueDate)) } as T
  }
  if ((m = p.match(/^\/subscriptions\/([^/]+)$/))) {
    if (method === 'DELETE') { fakeAsaas.subscriptions.delete(m[1]); return { deleted: true } as T }
    return (fakeAsaas.subscriptions.get(m[1]) ?? notFound(p)) as T
  }
  if (method === 'POST' && p === '/pix/automatic/authorizations') {
    const auth: FakeAuthorization = {
      id: nextId('auth'), customerId: body.customerId, status: 'CREATED', value: body.value, startDate: body.startDate, subscriptionId: null,
      immediateQrCode: { payload: `PIX-${seq}`, encodedImage: 'iVBORw0KGgo=', expirationDate: new Date(Date.now() + 86_400_000).toISOString() },
    }
    fakeAsaas.authorizations.set(auth.id, auth)
    return auth as T
  }
  if ((m = p.match(/^\/pix\/automatic\/authorizations\/([^/]+)$/))) return (fakeAsaas.authorizations.get(m[1]) ?? notFound(p)) as T

  throw new Error(`fake-asaas: rota não simulada ${method} ${path}`)
}

export function fakeAsaasModule() {
  return {
    asaasFetch: fakeAsaasFetch,
    getAsaasInvoiceUrl: async () => 'https://asaas.test/i/x',
    validateAsaasWebhook: (token: string) => token === 'token-de-teste',
  }
}
