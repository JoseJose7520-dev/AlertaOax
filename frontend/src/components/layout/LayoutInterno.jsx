import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLES } from '../../utils/constantes.js'
import { IconoCampana, IconoSalir, IconoUsuario, IconoEscudoSimple } from '../Iconos.jsx'

const ENLACES = [
  { a: '/alertas', texto: 'Alertas' },
  { a: '/mapa', texto: 'Mapa' },
  { a: '/preparacion', texto: 'Prepárate' },
  { a: '/reportes', texto: 'Reportar' },
  { a: '/publicar', texto: 'Publicar aviso', roles: [ROLES.AUTORIDAD, ROLES.ADMIN] },
  { a: '/admin', texto: 'Administración', roles: [ROLES.ADMIN] },
]

/** Estructura común de las páginas internas: aviso, barra superior con navegación según el rol y pie. */
export default function LayoutInterno() {
  const { usuario, cerrarSesion } = useAuth()
  const navegar = useNavigate()
  const [menu, setMenu] = useState(false)
  const refMenu = useRef(null)

  // Cierra el menú del avatar al hacer clic fuera
  useEffect(() => {
    const fuera = (e) => { if (refMenu.current && !refMenu.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  function salir() {
    cerrarSesion()
    navegar('/acceso', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <p className="bg-slate-200 px-4 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Aviso institucional: canal complementario a las fuentes oficiales de Protección Civil Oaxaca
      </p>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to="/alertas" className="leading-tight">
            <span className="block text-lg font-extrabold text-oax-700">AlertaOax</span>
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-500">Gobierno del Estado</span>
          </Link>

          <nav aria-label="Principal" className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 text-sm">
            {ENLACES.filter((e) => !e.roles || e.roles.includes(usuario.rol)).map((e) => (
              <NavLink
                key={e.a} to={e.a}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-1.5 font-semibold transition ${isActive ? 'bg-oax-700 text-white' : 'text-slate-600 hover:bg-white'}`}
              >
                {e.texto}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold uppercase text-slate-600 sm:inline-flex">
              <IconoEscudoSimple width={13} height={13} /> Rol: {usuario.rol}
            </span>
            <button type="button" aria-label="Notificaciones" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
              <IconoCampana width={18} height={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-alerta" />
            </button>

            <div className="relative" ref={refMenu}>
              <button
                type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Menú de usuario"
                className="grid h-9 w-9 place-items-center rounded-full bg-oax-700 text-white"
              >
                <IconoUsuario width={16} height={16} />
              </button>
              {menu && (
                <div className="absolute right-0 z-[2000] mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-tarjeta">
                  <p className="px-3 py-2 text-xs text-slate-500">
                    <strong className="block text-sm text-slate-900">{usuario.nombre}</strong>
                    {usuario.correo}
                  </p>
                  <button type="button" onClick={salir} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100">
                    <IconoSalir /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[11px] text-slate-500">
          <p>AlertaOax • Coordinación Estatal de Protección Civil y Gestión de Riesgos del Estado de Oaxaca.</p>
          <nav aria-label="Pie" className="flex flex-wrap gap-x-5 gap-y-1">
            <a href="#protocolo" className="font-semibold text-oax-700 hover:underline">Protocolo criptográfico oficial</a>
            <a href="#terminos" className="hover:underline">Términos</a>
            <a href="#contacto" className="hover:underline">Contacto de emergencia 911</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
