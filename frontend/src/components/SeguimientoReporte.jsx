import { ESTADOS_REPORTE } from '../utils/catalogos.js'

/** Barra de 3 pasos: Recibido → En atención → Atendido. */
export default function SeguimientoReporte({ estado }) {
  const actual = ESTADOS_REPORTE[estado]?.paso ?? 1
  return (
    <ol className="grid grid-cols-3 gap-1.5" aria-label={`Estado: ${ESTADOS_REPORTE[estado]?.nombre}`}>
      {Object.values(ESTADOS_REPORTE).map((e) => (
        <li key={e.nombre} className="flex flex-col gap-1">
          <span className={`h-2 rounded-full ${actual >= e.paso ? (actual === 3 ? 'bg-riesgo-bajo' : 'bg-acento') : 'bg-linea'}`} aria-hidden="true" />
          <span className={`text-nota ${actual === e.paso ? 'font-bold text-tinta' : 'text-tenue'}`}>{e.nombre}</span>
        </li>
      ))}
    </ol>
  )
}
