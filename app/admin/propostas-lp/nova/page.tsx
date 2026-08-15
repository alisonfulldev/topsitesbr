import { CreateProposalForm } from './_components/CreateProposalForm'

export default function NovaProposta() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nova Proposta LP</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gera um link único para compartilhar com o cliente via WhatsApp.
        </p>
      </div>
      <CreateProposalForm />
    </div>
  )
}
