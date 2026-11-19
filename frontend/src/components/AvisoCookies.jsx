import { useEffect, useState } from 'react'
import Icono from './Icono.jsx'
import { EVENTO_COOKIES } from '../utils/legal.js'

const CLAVE = 'alertaoax-cookies'

function leer() { try { return localStorage.getItem(CLAVE) } catch { return 'esenciales' } }

/**
 * Aviso de cookies no invasivo (tarjeta en una esquina, no bloquea la pantalla).
 * AlertaOax solo usa almacenamiento esencial; la elección queda guardada y se puede cambiar desde el pie.
 */
export default function AvisoCookies({ elevado = false }) {
  const [visible, setVisible] = useState(() => !leer())
  useEffect(() => {
    const abrir = () => setVisible(true)
    window.addEventListener(EVENTO_COOKIES, abrir)
    return () => window.removeEventListener(EVENTO_COOKIES, abrir)
  }, [])
  if (!visible) return null
  const elegir = (v) => { try { localStorage.setItem(CLAVE, v) } catch { /* sin almacenamiento */ } setVisible(false) }
  return (
    <section
      role="region"
      aria-label="Aviso de cookies"
      className={`fixed inset-x-3 z-30 rounded-3xl border border-linea bg-superficie p-4 shadow-2xl sm:right-24 sm:left-auto sm:w-[26rem] ${elevado ? 'bottom-[10.5rem] lg:bottom-6' : 'bottom-24 sm:bottom-6'}`}
    >
      <div className="flex gap-3">
        <span className="icono-caja size-10 shrink-0 bg-riesgo-medio-fondo text-riesgo-medio-texto"><Icono nombre="galleta" tam={24} /></span>
        <div className="flex flex-col gap-1">
          <h2 className="text-subtitulo font-bold">Tu privacidad</h2>
          <p className="text-nota leading-relaxed text-tinta-suave">
            Solo guardamos lo esencial: tu sesión y el tema. Sin publicidad ni rastreo de terceros.
          </p>
        </div>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => elegir('esenciales')} className="btn-neutro min-h-11 text-nota">Solo esenciales</button>
        <button type="button" onClick={() => elegir('todas')} className="btn-principal min-h-11 text-nota">Aceptar todas</button>
      </div>
    </section>
  )
}
