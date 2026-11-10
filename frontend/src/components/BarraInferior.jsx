import { NavLink } from 'react-router-dom'
import Icono from './Icono.jsx'

const SECCIONES = [
  { a: '/', texto: 'Alertas', icono: 'campana', exacta: true },
  { a: '/mapa', texto: 'Mapa', icono: 'mapa' },
  { a: '/preparate', texto: 'Prepárate', icono: 'mochila' },
  { a: '/reportar', texto: 'Reportar', icono: 'mas' },
]

/** Navegación principal del ciudadano: fija abajo, pensada para el pulgar. */
export default function BarraInferior() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-arena bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1.5 pb-2">
        {SECCIONES.map((s) => (
          <li key={s.a}>
            <NavLink
              to={s.a}
              end={s.exacta}
              className={({ isActive }) =>
                `flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-xl text-nota no-underline ${
                  isActive ? 'font-bold text-anil' : 'text-tenue hover:text-barro'
                }`
              }
            >
              <Icono nombre={s.icono} grosor={2.1} />
              {s.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
