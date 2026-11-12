import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import BarraInferior from '../BarraInferior.jsx'
import Icono from '../Icono.jsx'
import Logo from '../Logo.jsx'

/** Estructura de la app del ciudadano: encabezado, contenido en una columna y barra inferior. */
export default function LayoutCiudadano() {
  const { usuario, cerrarSesion } = useAuth()
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <Link to="/" className="text-barro no-underline" aria-label="AlertaOax, inicio">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-arena bg-white px-3.5 text-[15px]">
            <Icono nombre="ubicacion" tam={18} className="text-anil" />
            <span className="sr-only">Tu región:</span>
            {usuario?.region ?? 'Sin región'}
          </span>
          <button
            type="button"
            onClick={cerrarSesion}
            className="inline-flex size-11 items-center justify-center rounded-xl text-tenue hover:bg-crema hover:text-barro"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <Icono nombre="salir" tam={22} />
          </button>
        </div>
      </header>
      <main className="flex-1 px-5 pb-28">
        <Outlet />
      </main>
      <BarraInferior />
    </div>
  )
}
