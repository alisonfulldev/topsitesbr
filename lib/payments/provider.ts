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
}

export interface CreateSubscriptionResult {
  subscriptionId: string
  chargeId: string
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
    console.log('[MOCK:createSubscription]', input.planName, `R$${input.price}`)
    return {
      subscriptionId: mockId('sub'),
      chargeId: mockId('chg'),
      nextDueDate: addDays(30),
      paymentUrl: '/dev/pagamento-simulado',
    }
  },

  async updateSubscription(subscriptionId, newPrice, planName) {
    console.log('[MOCK:updateSubscription]', subscriptionId, planName, `R$${newPrice}`)
    return { nextDueDate: addDays(30) }
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
