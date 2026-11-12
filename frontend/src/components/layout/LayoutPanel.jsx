import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Icono from '../Icono.jsx'
import Logo from '../Logo.jsx'

/**
 * Estructura de los paneles web (autoridad y administrador): barra superior y menú lateral.
 * En celular el menú se acomoda arriba del contenido.
 */
export default function LayoutPanel({ titulo, enlaces }) {
  const { usuario, cerrarSesion } = useAuth()
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-arena bg-white px-5 py-3 sm:px-7">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="text-texto text-tenue">· {titulo}</span>
        </div>
        <div className="flex items-center gap-3 text-texto">
          {usuario?.rol === 'autoridad' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-riesgo-bajo-fondo px-2.5 py-1 text-nota font-bold text-ok-texto">
              <Icono nombre="palomita" tam={14} grosor={3} /> Verificada
            </span>
          )}
          <span className="hidden sm:inline">{usuario?.nombre}</span>
          <button type="button" onClick={cerrarSesion} className="btn-neutro min-h-10 text-nota">
            <Icono nombre="salir" tam={18} /> Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-wrap">
        <nav
          aria-label={`Menú del ${titulo.toLowerCase()}`}
          className="flex w-full gap-1 overflow-x-auto border-b border-arena bg-white p-3 sm:w-60 sm:flex-col sm:border-r sm:border-b-0 sm:p-4"
        >
          {enlaces.map((e) => (
            <NavLink
              key={e.a}
              to={e.a}
              end={e.exacta}
              className={({ isActive }) =>
                `flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-3.5 no-underline ${
                  isActive ? 'bg-anil-claro font-bold text-anil-oscuro' : 'text-barro hover:bg-crema'
                }`
              }
            >
              <Icono nombre={e.icono} tam={20} />
              {e.texto}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-[999_1_560px] p-5 sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
