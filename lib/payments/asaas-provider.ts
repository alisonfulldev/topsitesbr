import { asaasFetch } from '@/lib/integrations/asaas'
import type {
  PaymentProvider,
  CreateCustomerInput,
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  UpdateSubscriptionResult,
  CreateSingleChargeInput,
  CreateSingleChargeResult,
} from './provider'

// ── Tipos da API do Asaas ─────────────────────────────────────────────────────

interface AsaasCustomer {
  id: string
}

interface AsaasSubscription {
  id: string
  nextDueDate: string
}

interface AsaasPayment {
  id: string
  invoiceUrl: string
}

interface AsaasPaymentList {
  data: AsaasPayment[]
}

// ── Utilitários ───────────────────────────────────────────────────────────────

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function only(value: string | null | undefined): string | undefined {
  return value?.replace(/\D/g, '') || undefined
}

function asaasError(context: string, err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err)
  throw new Error(`Pagamento (${context}): ${msg}`)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class AsaasPaymentProvider implements PaymentProvider {
  async createCustomer(input: CreateCustomerInput): Promise<{ customerId: string }> {
    try {
      const customer = await asaasFetch<AsaasCustomer>('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          cpfCnpj: only(input.document),
          phone: only(input.phone),
        }),
      })
      return { customerId: customer.id }
    } catch (err) {
      asaasError('createCustomer', err)
    }
  }

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    try {
      const sub = await asaasFetch<AsaasSubscription>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          customer: input.customerId,
          billingType: 'UNDEFINED',
          value: input.price,
          nextDueDate: daysFromNow(1),
          cycle: 'MONTHLY',
          description: input.planName,
          ...(input.successUrl && {
            callback: { successUrl: input.successUrl, autoRedirect: true },
          }),
        }),
      })

      // Busca a primeira cobrança gerada pela assinatura
      const list = await asaasFetch<AsaasPaymentList>(
        `/subscriptions/${sub.id}/payments?limit=1&offset=0`,
      )

      const first = list.data[0]
      if (!first) throw new Error('Nenhuma cobrança gerada pela assinatura.')

      return {
        subscriptionId: sub.id,
        chargeId: first.id,
        nextDueDate: new Date(sub.nextDueDate),
        paymentUrl: first.invoiceUrl,
      }
    } catch (err) {
      asaasError('createSubscription', err)
    }
  }

  async updateSubscription(
    subscriptionId: string,
    newPrice: number,
    planName: string,
  ): Promise<UpdateSubscriptionResult> {
    try {
      const sub = await asaasFetch<AsaasSubscription>(
        `/subscriptions/${subscriptionId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ value: newPrice, description: planName }),
        },
      )
      return { nextDueDate: new Date(sub.nextDueDate) }
    } catch (err) {
      asaasError('updateSubscription', err)
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await asaasFetch(`/subscriptions/${subscriptionId}`, { method: 'DELETE' })
    } catch (err) {
      asaasError('cancelSubscription', err)
    }
  }

  async createSingleCharge(
    input: CreateSingleChargeInput,
  ): Promise<CreateSingleChargeResult> {
    try {
      const payment = await asaasFetch<AsaasPayment>('/payments', {
        method: 'POST',
        body: JSON.stringify({
          customer: input.customerId,
          billingType: 'UNDEFINED',
          value: input.price,
          dueDate: daysFromNow(3),
          description: input.description,
          ...(input.successUrl && {
            callback: { successUrl: input.successUrl, autoRedirect: true },
          }),
        }),
      })
      return { chargeId: payment.id, paymentUrl: payment.invoiceUrl }
    } catch (err) {
      asaasError('createSingleCharge', err)
    }
  }
}
