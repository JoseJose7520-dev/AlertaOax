import { NIVELES } from '../utils/catalogos.js'

/** Etiqueta de nivel de riesgo: siempre color + texto (nunca solo color). */
export default function InsigniaNivel({ nivel, className = '' }) {
  const n = NIVELES[nivel] ?? NIVELES.vigilancia
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-nota font-bold uppercase ${n.clases.fondo} ${n.clases.texto} ${className}`}
    >
      <span className={`size-2 rounded-full ${n.clases.solido}`} aria-hidden="true" />
      {n.nombre}
    </span>
  )
}
