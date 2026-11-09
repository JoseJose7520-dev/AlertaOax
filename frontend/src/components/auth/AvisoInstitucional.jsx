const AVISO =
  'Canal complementario y coordinado con los sistemas oficiales del Estado de Oaxaca (CENAPRED / SSPC). En caso de emergencia, llama al 911.'

export default function AvisoInstitucional() {
  return (
    <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700">
      <span className="shrink-0 font-semibold leading-tight text-slate-500">
        Aviso <br className="hidden sm:block" />institucional:
      </span>

      {/* Texto en marquesina; se detiene con prefers-reduced-motion (ver index.css) */}
      <div className="relative min-w-0 flex-1 overflow-hidden" role="note">
        <p className="flex w-max animate-marquesina whitespace-nowrap">
          <span className="pr-12">{AVISO}</span>
          <span className="pr-12" aria-hidden="true">{AVISO}</span>
        </p>
      </div>

      <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-oax-50 px-2.5 py-1 font-medium text-oax-700 sm:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-operativo" />
        Red Estatal Operativa
      </span>
      <span className="hidden shrink-0 text-slate-400 md:inline">Actualizado: 24/7</span>
    </div>
  )
}
