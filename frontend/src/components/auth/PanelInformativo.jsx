import { IconoEscudo, IconoEscudoSimple, IconoOnda, IconoRuta, IconoMensaje, IconoInstitucion } from '../Iconos.jsx'

const BENEFICIOS = [
  {
    icono: IconoOnda,
    titulo: 'Alertas tempranas geolocalizadas',
    texto: 'Notificaciones prioritarias con redundancia acústica en las 8 regiones del estado.',
  },
  {
    icono: IconoRuta,
    titulo: 'Protocolos de evacuación verificados',
    texto: 'Rutas seguras y refugios temporales certificados por geólogos y rescatistas locales.',
  },
  {
    icono: IconoMensaje,
    titulo: 'Comunicación directa con autoridades',
    texto: 'Reporte de daños, incidencias en cuadrantes y solicitud inmediata de auxilio civil.',
  },
]

export default function PanelInformativo() {
  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-gradient-to-b from-oax-50 to-white p-6 lg:p-8">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-oax-700 text-white">
            <IconoEscudo width={22} height={22} />
          </span>
          <div>
            <p className="flex items-center gap-2 text-lg font-bold leading-none">
              AlertaOax
              <span className="rounded bg-oax-100 px-1.5 py-0.5 text-[10px] font-semibold text-oax-700">OFICIAL</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Sistema Estatal de Protección Civil y Gestión de Riesgos</p>
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px] text-slate-500 sm:flex">
          <IconoInstitucion width={18} height={18} />
          GOB·OAX
        </div>
      </header>

      <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
        <IconoEscudoSimple width={12} height={12} />
        Monitoreo sísmico e hidrometeorológico
      </p>

      <div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight lg:text-[2rem]">
          Información confiable antes, durante y después de un desastre.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          Conectamos a las familias oaxaqueñas con las brigadas de Protección Civil estatal y municipal en tiempo real
          ante sismos, huracanes y contingencias naturales.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {BENEFICIOS.map(({ icono: Icono, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-oax-50 text-oax-700">
              <Icono />
            </span>
            <div>
              <h2 className="text-sm font-semibold">{titulo}</h2>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{texto}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-oax-700 text-white">
          <IconoEscudo />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium text-slate-400">Acreditación estatal</p>
          <p className="font-semibold">Certificación CEPCO / SEGOB OAX</p>
        </div>
        <span className="shrink-0 rounded bg-oax-50 px-2 py-1 text-[10px] font-semibold text-oax-700">
          Folio OAX-PC-2025
        </span>
      </div>
    </section>
  )
}
