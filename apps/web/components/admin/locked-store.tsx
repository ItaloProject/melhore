export function LockedStoreNotice() {
  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Assinatura</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Sua loja está pausada</h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          A mensalidade ficou mais de 1 mês em aberto. Os dados da loja continuam guardados.
          Quando o pagamento for confirmado, você volta exatamente de onde parou.
        </p>
        <p className="text-sm text-gray-400 mt-4">
          Fale com o Melhore para reativar. Nada foi apagado.
        </p>
      </div>
    </div>
  )
}
