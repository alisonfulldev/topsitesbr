export interface CreateCustomerInput {
  name: string
  email: string
  document?: string | null
  phone?: string | null
}

export interface CreateSubscriptionInput {
  customerId: string
  planName: string
  price: number
  successUrl?: string
  /** Data do primeiro vencimento (YYYY-MM-DD). Se omitido, usa amanhã. */
  firstDueDate?: string
}

export interface CreateSubscriptionResult {
  subscriptionId: string
  chargeId: string | null
  nextDueDate: Date
  paymentUrl: string
}

export interface UpdateSubscriptionResult {
  nextDueDate: Date
}

export interface CreateSingleChargeInput {
  customerId: string
  description: string
  price: number
  successUrl?: string
  externalReference?: string
}

export interface CreateSingleChargeResult {
  chargeId: string
  paymentUrl: string
}

export interface PaymentProvider {
  createCustomer(input: CreateCustomerInput): Promise<{ customerId: string }>
  createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult>
  updateSubscription(
    subscriptionId: string,
    newPrice: number,
    planName: string,
  ): Promise<UpdateSubscriptionResult>
  /** Atualiza o valor de uma cobrança pendente específica */
  updatePendingCharge(chargeId: string, newPrice: number): Promise<void>
  /**
   * Para adiantamento de mensalidade: verifica se o Asaas já gerou uma
   * cobrança pendente para o ciclo atual. Se não, avança o nextDueDate da
   * assinatura (evita cobrança dupla) e cria uma cobrança avulsa.
   * Retorna chargeId, paymentUrl e se a cobrança já existia (isExisting).
   */
  prepareAdvancePayment(
    subscriptionId: string,
    amount: number,
    currentDueDateStr: string,
    newNextDueDateStr: string,
    description: string,
    successUrl?: string,
  ): Promise<{ chargeId: string; paymentUrl: string; isExisting: boolean }>
  cancelSubscription(subscriptionId: string): Promise<void>
  createSingleCharge(input: CreateSingleChargeInput): Promise<CreateSingleChargeResult>
}

// ── Mock (PAYMENT_DRIVER=mock) ────────────────────────────────────────────────

function mockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

function addDays(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

const mockProvider: PaymentProvider = {
  async createCustomer(input) {
    console.log('[MOCK:createCustomer]', input.email)
    return { customerId: mockId('cus') }
  },

  async createSubscription(input) {
    const firstDue = input.firstDueDate ? new Date(`${input.firstDueDate}T12:00:00`) : addDays(1)
    const daysUntil = Math.round((firstDue.getTime() - Date.now()) / 86_400_000)
    console.log('[MOCK:createSubscription]', input.planName, `R$${input.price}`, `1ª cobrança em ${daysUntil}d`)
    if (daysUntil > 2) {
      return {
        subscriptionId: mockId('sub'),
        chargeId: null,
        nextDueDate: firstDue,
        paymentUrl: '/painel?ativado=1',
      }
    }
    return {
      subscriptionId: mockId('sub'),
      chargeId: mockId('chg'),
      nextDueDate: firstDue,
      paymentUrl: '/dev/pagamento-simulado',
    }
  },

  async updateSubscription(subscriptionId, newPrice, planName) {
    console.log('[MOCK:updateSubscription]', subscriptionId, planName, `R$${newPrice}`)
    return { nextDueDate: addDays(30) }
  },

  async updatePendingCharge(chargeId, newPrice) {
    console.log('[MOCK:updatePendingCharge]', chargeId, `R$${newPrice}`)
  },

  async prepareAdvancePayment(subscriptionId, amount, currentDueDateStr, newNextDueDateStr, description) {
    console.log('[MOCK:prepareAdvancePayment]', subscriptionId, `R$${amount}`, currentDueDateStr, '→', newNextDueDateStr)
    return { chargeId: mockId('chg'), paymentUrl: '/dev/pagamento-simulado', isExisting: false }
  },

  async cancelSubscription(subscriptionId) {
    console.log('[MOCK:cancelSubscription]', subscriptionId)
  },

  async createSingleCharge(input) {
    console.log('[MOCK:createSingleCharge]', input.description, `R$${input.price}`)
    return {
      chargeId: mockId('chg'),
      paymentUrl: '/dev/pagamento-simulado',
    }
  },
}

// ── Factory ───────────────────────────────────────────────────────────────────

let _provider: PaymentProvider | undefined

export function getPaymentProvider(): PaymentProvider {
  if (_provider) return _provider
  if (process.env.PAYMENT_DRIVER === 'asaas') {
    const { AsaasPaymentProvider } = require('./asaas-provider') as {
      AsaasPaymentProvider: new () => PaymentProvider
    }
    _provider = new AsaasPaymentProvider()
  } else {
    _provider = mockProvider
  }
  return _provider
}
