import { NIVELES } from '../../data/alertas.js'
import { IconoAlerta } from '../Iconos.jsx'

/** Etiqueta del nivel de la alerta (crítico, alto, medio, vigilancia). */
export default function InsigniaNivel({ nivel, className = '' }) {
  const n = NIVELES[nivel]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold ${n.clases} ${className}`}>
      <IconoAlerta width={12} height={12} />
      {n.etiqueta}
    </span>
  )
}
