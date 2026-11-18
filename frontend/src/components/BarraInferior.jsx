import { NavLink } from 'react-router-dom'
import Icono from './Icono.jsx'

// eslint-disable-next-line react-refresh/only-export-components
export const SECCIONES_CIUDADANO = [
  { a: '/', texto: 'Alertas', icono: 'campana', exacta: true },
  { a: '/mapa', texto: 'Mapa', icono: 'mapa' },
  { a: '/preparate', texto: 'Prepárate', icono: 'mochila' },
  { a: '/reportar', texto: 'Reportar', icono: 'mas' },
]

/** Navegación principal del ciudadano en celular: fija abajo, pensada para el pulgar. */
export default function BarraInferior() {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-linea bg-superficie/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1.5 pb-2">
        {SECCIONES_CIUDADANO.map((s) => (
          <li key={s.a}>
            <NavLink
              to={s.a}
              end={s.exacta}
              className={({ isActive }) =>
                `group flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-nota no-underline ${
                  isActive ? 'font-bold text-acento dark:text-acento-fuerte' : 'font-medium text-tenue hover:text-tinta'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-14 items-center justify-center rounded-full transition ${isActive ? 'bg-acento-claro' : ''}`}>
                    <Icono nombre={s.icono} tam={24} peso={isActive ? 'fill' : 'duotone'} />
                  </span>
                  {s.texto}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
