export default function ObrigadoPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-3">Pagamento confirmado!</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Recebemos seu pagamento. Nossa equipe irá construir seu site e em breve você
          receberá uma confirmação no e-mail cadastrado.
        </p>
        <p className="text-xs text-gray-400">
          Dúvidas? Fale conosco pelo WhatsApp.
        </p>
      </div>
    </main>
  )
}
