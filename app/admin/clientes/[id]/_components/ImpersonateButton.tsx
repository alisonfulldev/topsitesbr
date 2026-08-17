export function ImpersonateButton({
  clientId,
}: {
  clientId: string
  clientName: string
}) {
  return (
    <a
      href={`/admin/impersonate/${clientId}`}
      className="inline-block px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      title="Ver painel exatamente como o cliente vê (modo visualização)"
    >
      Acessar como cliente
    </a>
  )
}
