export default function PieEmergencia() {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-slate-100 px-3 py-2.5 text-[11px] text-slate-500">
      <p className="flex items-center gap-2">
        <span className="rounded bg-alerta px-1.5 py-0.5 text-[10px] font-bold text-white">911</span>
        <span className="leading-tight">
          Línea de emergencia directa
          <br />
          <strong className="text-slate-800">Emergencias 911 / 089 Anónimo</strong>
        </span>
      </p>
      <nav aria-label="Información de apoyo" className="flex flex-wrap gap-x-4 gap-y-1">
        {/* TODO: enlazar a las páginas de ayuda, privacidad y directorio */}
        <a href="#ayuda" className="hover:text-oax-700 hover:underline">Centro de Ayuda</a>
        <a href="#privacidad" className="hover:text-oax-700 hover:underline">Aviso de Privacidad</a>
        <a href="#directorio" className="hover:text-oax-700 hover:underline">Directorio CEPCO</a>
      </nav>
    </footer>
  )
}
