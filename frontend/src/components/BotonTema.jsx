import { useTema } from '../context/TemaContext.jsx'
import Icono from './Icono.jsx'

/** Botón Sol/Luna para cambiar entre modo diurno y nocturno. */
export default function BotonTema({ className = '' }) {
  const { tema, alternar } = useTema()
  const oscuro = tema === 'oscuro'
  return (
    <button
      type="button"
      onClick={alternar}
      className={`inline-flex size-11 items-center justify-center rounded-xl border border-linea bg-superficie text-tinta-suave transition hover:border-borde hover:text-tinta ${className}`}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={oscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      <Icono nombre={oscuro ? 'sol' : 'luna'} tam={22} peso="fill" className={oscuro ? 'text-amber-300' : 'text-acento'} />
    </button>
  )
}
