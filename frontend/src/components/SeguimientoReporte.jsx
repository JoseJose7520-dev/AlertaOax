import { ESTADOS_REPORTE } from '../utils/catalogos.js'

/** Barra de 3 pasos: Recibido → En atención → Atendido. */
export default function SeguimientoReporte({ estado }) {
  const actual = ESTADOS_REPORTE[estado]?.paso ?? 1
  return (
    <ol className="grid grid-cols-3 gap-1.5" aria-label={`Estado: ${ESTADOS_REPORTE[estado]?.nombre}`}>
      {Object.values(ESTADOS_REPORTE).map((e) => (
        <li key={e.nombre} className="flex flex-col gap-1">
          <span className={`h-1.5 rounded ${actual >= e.paso ? 'bg-anil' : 'bg-arena'}`} aria-hidden="true" />
          <span className={`text-nota ${actual === e.paso ? 'font-bold text-barro' : 'text-tenue'}`}>{e.nombre}</span>
        </li>
      ))}
    </ol>
  )
}
