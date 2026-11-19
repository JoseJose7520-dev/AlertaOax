import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import BotonTema from '../BotonTema.jsx'
import Icono from '../Icono.jsx'
import Logo from '../Logo.jsx'
import PieLegal from '../PieLegal.jsx'

/**
 * Paneles web (autoridad y administrador): barra superior y menú lateral tipo sala de situación.
 * En celular el menú se acomoda arriba del contenido.
 */
export default function LayoutPanel({ titulo, enlaces }) {
  const { usuario, cerrarSesion } = useAuth()
  // «Mi perfil» vive dentro del panel en el que se está (/autoridad/perfil o /admin/perfil)
  const base = useLocation().pathname.startsWith('/admin') ? '/admin' : '/autoridad'
  // El administrador también puede publicar alertas: desde ese panel, le damos un regreso a su resumen
  const menu = usuario?.rol === 'administrador' && !enlaces.some((e) => e.a === '/admin')
    ? [...enlaces, { a: '/admin', texto: 'Administración', corto: 'Admin', icono: 'grafica', exacta: true }]
    : enlaces
  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <header className="sticky top-8 z-20 flex items-center justify-between gap-2 sm:gap-3 border-b border-linea bg-superficie/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Logo tam={32} conTexto={false} className="min-[480px]:hidden" />
          <Logo tam={32} className="max-[479px]:hidden" />
          <span className="rotulo hidden rounded-md border border-linea px-2 py-1 text-tenue sm:inline">{titulo}</span>
        </div>
        <div className="flex items-center gap-1.5 text-texto sm:gap-2">
          {usuario?.rol === 'autoridad' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-riesgo-bajo-fondo px-2.5 py-1 text-nota font-bold text-ok-texto">
              <Icono nombre="escudo" tam={16} peso="fill" /> Verificada
            </span>
          )}
          {usuario?.rol === 'administrador' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-acento-claro px-2.5 py-1 text-nota font-bold text-acento dark:text-acento-fuerte">
              <Icono nombre="escudo" tam={16} peso="fill" /> Administrador
            </span>
          )}
          <Link to={`${base}/perfil`} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 font-medium text-tinta no-underline hover:bg-hundido" title="Mi perfil">
            <Icono nombre="perfil" tam={24} /> <span className="hidden md:inline">{usuario?.nombre}</span><span className="sr-only md:hidden">Mi perfil</span>
          </Link>
          <BotonTema />
          <button type="button" onClick={cerrarSesion} className="btn-neutro min-h-11 text-nota">
            <Icono nombre="salir" tam={18} /> <span className="max-sm:sr-only">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-wrap">
        <nav
          aria-label={`Menú del ${titulo.toLowerCase()}`}
          className="topografia flex w-full gap-1 overflow-x-auto border-b border-linea bg-superficie p-3 sm:sticky sm:top-[101px] sm:h-[calc(100dvh-101px)] sm:w-64 sm:flex-col sm:border-r sm:border-b-0 sm:p-4"
        >
          <p className="rotulo hidden px-3 pb-2 text-tenue sm:block">Menú</p>
          {menu.map((e) => (
            <NavLink
              key={e.a}
              to={e.a}
              end={e.exacta}
              className={({ isActive }) =>
                `flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-3 font-semibold sm:gap-3 sm:px-3.5 no-underline transition ${
                  isActive ? 'bg-acento text-white shadow-[0_8px_20px_-12px_rgb(37_99_235/0.9)]' : 'text-tinta-suave hover:bg-hundido hover:text-tinta'
                }`
              }
            >
              {({ isActive }) => (<><Icono nombre={e.icono} tam={22} peso={isActive ? 'fill' : 'duotone'} /><span className="sm:hidden">{e.corto ?? e.texto}</span><span className="max-sm:hidden">{e.texto}</span></>)}
            </NavLink>
          ))}
        </nav>
        <div className="flex min-w-0 flex-[999_1_560px] flex-col">
          <main className="flex-1 p-4 sm:p-7">
            <Outlet />
          </main>
          <PieLegal className="px-4 pb-6" />
        </div>
      </div>
    </div>
  )
}
