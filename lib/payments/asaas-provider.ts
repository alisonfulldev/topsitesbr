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

interface AsaasSubscriptionDetail {
  id: string
  customer: string
  nextDueDate: string
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
      const startDate = input.firstDueDate ?? daysFromNow(1)

      const sub = await asaasFetch<AsaasSubscription>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          customer: input.customerId,
          billingType: 'UNDEFINED',
          value: input.price,
          nextDueDate: startDate,
          cycle: 'MONTHLY',
          description: input.planName,
          ...(input.successUrl && {
            callback: { successUrl: input.successUrl, autoRedirect: true },
          }),
        }),
      })

      // Usamos a data que enviamos ao Asaas (não sub.nextDueDate, pois o Asaas pode
      // retornar a data do ciclo seguinte ao primeiro pagamento, gerando shift de 1 mês)
      const nextDueDate = new Date(`${startDate}T12:00:00`)

      // Se o vencimento é mais de 2 dias à frente, não há cobrança imediata a buscar
      const twoDaysFromNow = new Date()
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
      if (nextDueDate > twoDaysFromNow) {
        return {
          subscriptionId: sub.id,
          chargeId: null,
          nextDueDate,
          paymentUrl: input.successUrl ?? '/painel?ativado=1',
        }
      }

      // Cobrança imediata — busca o link de pagamento gerado pela assinatura
      const list = await asaasFetch<AsaasPaymentList>(
        `/subscriptions/${sub.id}/payments?limit=1&offset=0`,
      )
      const first = list.data[0]
      if (!first) throw new Error('Nenhuma cobrança gerada pela assinatura.')

      return {
        subscriptionId: sub.id,
        chargeId: first.id,
        nextDueDate,
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

  async prepareAdvancePayment(
    subscriptionId: string,
    amount: number,
    currentDueDateStr: string,
    newNextDueDateStr: string,
    description: string,
    successUrl?: string,
  ): Promise<{ chargeId: string; paymentUrl: string; isExisting: boolean }> {
    try {
      // 1. Verifica se o Asaas já gerou cobrança pendente para este ciclo
      const pendingList = await asaasFetch<AsaasPaymentList>(
        `/subscriptions/${subscriptionId}/payments?status=PENDING&limit=1`,
      )
      const existing = pendingList.data[0]
      if (existing) {
        return { chargeId: existing.id, paymentUrl: existing.invoiceUrl, isExisting: true }
      }

      // 2. Busca o customerId vinculado à assinatura
      const sub = await asaasFetch<AsaasSubscriptionDetail>(`/subscriptions/${subscriptionId}`)

      // 3. Avança o nextDueDate da assinatura para evitar cobrança dupla
      await asaasFetch(`/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        body: JSON.stringify({ nextDueDate: newNextDueDateStr }),
      })

      // 4. Cria cobrança avulsa para o ciclo atual
      const payment = await asaasFetch<AsaasPayment>('/payments', {
        method: 'POST',
        body: JSON.stringify({
          customer: sub.customer,
          billingType: 'UNDEFINED',
          value: amount,
          dueDate: currentDueDateStr,
          description,
          ...(successUrl && { callback: { successUrl, autoRedirect: true } }),
        }),
      })

      return { chargeId: payment.id, paymentUrl: payment.invoiceUrl, isExisting: false }
    } catch (err) {
      asaasError('prepareAdvancePayment', err)
    }
  }

  async updatePendingCharge(chargeId: string, newPrice: number): Promise<void> {
    try {
      await asaasFetch(`/payments/${chargeId}`, {
        method: 'PUT',
        body: JSON.stringify({ value: newPrice }),
      })
    } catch (err) {
      asaasError('updatePendingCharge', err)
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
          ...(input.externalReference && { externalReference: input.externalReference }),
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
