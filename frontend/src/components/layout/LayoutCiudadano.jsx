import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import BarraInferior, { SECCIONES_CIUDADANO } from '../BarraInferior.jsx'
import BotonTema from '../BotonTema.jsx'
import Icono from '../Icono.jsx'
import Logo from '../Logo.jsx'
import Notificaciones from '../Notificaciones.jsx'
import PieLegal from '../PieLegal.jsx'
import SelectorRegion from '../SelectorRegion.jsx'

const MENU_ESCRITORIO = [
  ...SECCIONES_CIUDADANO,
  { a: '/reportes', texto: 'Mis reportes', icono: 'reporte' },
  { a: '/perfil', texto: 'Mi perfil', icono: 'perfil' },
]

/**
 * App del ciudadano.
 * - Celular: encabezado, contenido en una columna y barra inferior de 4 pestañas.
 * - Escritorio: menú lateral fijo con la tarjeta de emergencia 911.
 */
export default function LayoutCiudadano() {
  const { usuario, cerrarSesion } = useAuth()
  // Región que se consulta en Alertas y Mapa (por defecto, la de la cuenta). Se recuerda en la pestaña.
  const [region, setRegion] = useState(() => {
    try { return sessionStorage.getItem('alertaoax-region') || usuario?.region } catch { return usuario?.region }
  })
  const cambiarRegion = (r) => { setRegion(r); try { sessionStorage.setItem('alertaoax-region', r) } catch { /* sin almacenamiento */ } }
  return (
    <div className="min-h-[calc(100dvh-2rem)] lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="topografia sticky top-8 hidden h-[calc(100dvh-2rem)] flex-col gap-6 overflow-hidden border-r border-linea bg-superficie px-5 py-6 lg:flex">
        <Link to="/" className="no-underline" aria-label="AlertaOax, inicio"><Logo /></Link>
        <nav aria-label="Navegación principal" className="flex flex-col gap-1">
          {MENU_ESCRITORIO.map((s) => (
            <NavLink
              key={s.a}
              to={s.a}
              end={s.exacta}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-3.5 font-semibold no-underline transition ${
                  isActive ? 'bg-acento text-white shadow-[0_8px_20px_-12px_rgb(37_99_235/0.9)]' : 'text-tinta-suave hover:bg-hundido hover:text-tinta'
                }`
              }
            >
              {({ isActive }) => (<><Icono nombre={s.icono} tam={22} peso={isActive ? 'fill' : 'duotone'} />{s.texto}</>)}
            </NavLink>
          ))}
        </nav>
        <a href="tel:911" className="mt-auto flex flex-col gap-1 rounded-2xl bg-riesgo-critico p-4 text-white no-underline shadow-lg">
          <span className="flex items-center gap-2 text-subtitulo font-bold" style={{ color: '#fff' }}><Icono nombre="telefono" peso="fill" /> Llamar al 911</span>
          <span className="text-nota text-white/85">¿Tu vida corre peligro? Llama antes de reportar.</span>
        </a>
      </aside>

      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col lg:max-w-5xl">
        <header className="sticky top-8 z-10 flex items-center justify-between gap-3 border-b border-linea/70 bg-fondo/85 px-4 py-3 backdrop-blur-md sm:px-5 lg:border-0 lg:bg-transparent lg:px-8 lg:pt-6 lg:backdrop-blur-none">
          <Link to="/" className="no-underline lg:hidden" aria-label="AlertaOax, inicio"><Logo tam={32} conTexto={false} className="min-[400px]:hidden" /><Logo tam={32} className="max-[399px]:hidden" /></Link>
          <p className="hidden text-subtitulo font-bold lg:block">Hola, {usuario?.nombre?.split(' ')[0]}</p>
          <div className="flex items-center gap-1.5">
            <SelectorRegion valor={region} propia={usuario?.region} onCambio={cambiarRegion} />
            <Notificaciones />
            <BotonTema />
            <NavLink
              to="/perfil"
              className={({ isActive }) => `inline-flex size-11 items-center justify-center rounded-xl lg:hidden ${isActive ? 'bg-acento-claro text-acento dark:text-acento-fuerte' : 'text-tenue hover:bg-hundido hover:text-tinta'}`}
              aria-label="Mi perfil"
              title="Mi perfil"
            >
              <Icono nombre="perfil" tam={24} />
            </NavLink>
            <button
              type="button"
              onClick={cerrarSesion}
              className="inline-flex size-11 items-center justify-center rounded-xl text-tenue hover:bg-hundido hover:text-tinta"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <Icono nombre="salir" tam={22} />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 pt-4 pb-6 sm:px-5 lg:px-8">
          <Outlet context={{ region, propia: usuario?.region, cambiarRegion }} />
        </main>
        <PieLegal className="px-4 pb-28 lg:pb-8" />
      </div>
      <BarraInferior />
    </div>
  )
}
