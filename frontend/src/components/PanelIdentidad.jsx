import { useId } from 'react'
import Icono from './Icono.jsx'
import Logo from './Logo.jsx'

const INSIGNIAS = [
  { icono: 'cable', texto: 'Alertas al instante', color: 'text-amber-300 bg-amber-300/12' },
  { icono: 'casa', texto: 'Red de albergues', color: 'text-emerald-300 bg-emerald-300/12' },
  { icono: 'escudo', texto: 'Reporte directo', color: 'text-sky-300 bg-sky-300/12' },
]

/** Ondas de radar concéntricas (se detienen si la persona prefiere menos movimiento). */
function Radar({ className = '' }) {
  const g = `radar-brillo-${useId().replace(/[^\w-]/g, '')}`
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={g} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#22D3EE" stopOpacity=".35" />
          <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill={`url(#${g})`} />
      {[60, 110, 160].map((r) => <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#38BDF8" strokeOpacity=".22" />)}
      <line x1="10" y1="200" x2="390" y2="200" stroke="#38BDF8" strokeOpacity=".15" />
      <line x1="200" y1="10" x2="200" y2="390" stroke="#38BDF8" strokeOpacity=".15" />
      {[0, 1.2, 2.4].map((d) => (
        <circle key={d} className="onda-radar" style={{ animationDelay: `${d}s` }} cx="200" cy="200" r="190" fill="none" stroke="#22D3EE" strokeWidth="2" strokeOpacity=".5" />
      ))}
      <circle cx="262" cy="148" r="6" fill="#F43F5E" />
      <circle cx="262" cy="148" r="12" fill="none" stroke="#F43F5E" strokeOpacity=".5" />
      <circle cx="142" cy="236" r="5" fill="#F59E0B" />
      <circle cx="228" cy="272" r="4.5" fill="#10B981" />
    </svg>
  )
}

/**
 * Columna de identidad regional (pantallas de acceso): fondo abisal, curvas de nivel y radar.
 * `compacto` se usa en celular, arriba del formulario.
 */
export default function PanelIdentidad({ compacto = false, accion = null }) {
  if (compacto) {
    return (
      <div className="topografia topografia-clara relative overflow-hidden bg-abisal px-5 pt-6 pb-8 text-white">
        <Radar className="pointer-events-none absolute -top-24 -right-24 size-72 opacity-70" />
        <Logo tam={40} claro />
        <p className="mt-4 max-w-xs text-[26px] leading-tight font-bold">Alertas oficiales para las 8 regiones de Oaxaca</p>
      </div>
    )
  }
  return (
    <div className="topografia topografia-clara relative flex h-full flex-col justify-between overflow-hidden bg-abisal p-10 text-white xl:p-14">
      <Radar className="pointer-events-none absolute -top-16 -right-28 size-[30rem] opacity-80 xl:-right-16" />
      <Logo tam={44} claro />
      <div className="relative flex flex-col gap-6">
        <p className="rotulo flex items-center gap-2 text-cyan-300">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgb(52_211_153/0.25)]" /> Monitoreo regional activo
        </p>
        <h1 className="max-w-lg text-[40px] leading-[1.05] font-bold xl:text-[46px]">
          Monitoreo ciudadano y alertas oficiales en tiempo real para las 8 regiones de Oaxaca
        </h1>
        <ul className="flex flex-wrap gap-2.5">
          {INSIGNIAS.map((i) => (
            <li key={i.texto} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 py-2 pr-4 pl-2 backdrop-blur-sm">
              <span className={`icono-caja size-9 ${i.color}`}><Icono nombre={i.icono} tam={22} peso="duotone" /></span>
              <span className="font-semibold">{i.texto}</span>
            </li>
          ))}
        </ul>
        {accion && (
          <button type="button" onClick={accion.alHacer}
            className="group mt-2 inline-flex min-h-13 items-center gap-3 self-start rounded-full bg-white py-2 pr-5 pl-2 font-semibold text-abisal shadow-[0_14px_30px_-12px_rgb(34_211_238/0.6)] transition hover:bg-cyan-50 active:scale-[0.98]">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#0891B2] text-white">
              <Icono nombre="flecha" tam={20} peso="bold" className="transition group-hover:translate-x-0.5" />
            </span>
            {accion.texto}
          </button>
        )}
      </div>
      <p className="relative text-nota text-slate-400">Costa · Cañada · Istmo · Mixteca · Papaloapan · Sierra Norte · Sierra Sur · Valles Centrales</p>
    </div>
  )
}
