import { useEffect, useRef, useState } from 'react'
import { useTema } from '../context/TemaContext.jsx'

const SCRIPT = 'https://accounts.google.com/gsi/client'
let cargaScript = null

function cargarGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve()
  cargaScript ??= new Promise((resolver, rechazar) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = resolver
    s.onerror = () => { cargaScript = null; rechazar(new Error('No se pudo cargar Google')) }
    document.head.appendChild(s)
  })
  return cargaScript
}

function LogoG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

/**
 * Botón oficial «Continuar con Google» (Google Identity Services).
 * Mientras carga, o si Google no responde, se ve un botón equivalente desactivado.
 */
export default function BotonGoogle({ clientId, onCredencial, texto = 'continue_with' }) {
  const caja = useRef(null)
  const { tema } = useTema()
  const [listo, setListo] = useState(false)
  const [falla, setFalla] = useState(false)
  const callback = useRef(onCredencial)
  useEffect(() => { callback.current = onCredencial }, [onCredencial])

  useEffect(() => {
    let vivo = true
    cargarGoogle()
      .then(() => {
        if (!vivo || !caja.current) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (r) => callback.current?.(r.credential),
          ux_mode: 'popup',
          itp_support: true,
        })
        caja.current.innerHTML = ''
        window.google.accounts.id.renderButton(caja.current, {
          type: 'standard', theme: tema === 'oscuro' ? 'filled_black' : 'outline', size: 'large',
          text: texto, shape: 'pill', logo_alignment: 'center', width: Math.min(400, caja.current.offsetWidth || 360), locale: 'es',
        })
        setListo(true)
      })
      .catch(() => vivo && setFalla(true))
    return () => { vivo = false }
  }, [clientId, tema, texto])

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <div ref={caja} className={`flex min-h-11 justify-center ${listo ? '' : 'hidden'}`} />
      {!listo && (
        <button type="button" disabled className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-linea-fuerte bg-superficie px-4 font-semibold text-tinta opacity-90">
          <LogoG /> Continuar con Google
        </button>
      )}
      {falla && <p className="text-center text-nota text-tenue">No se pudo conectar con Google. Usa tu correo y contraseña.</p>}
    </div>
  )
}
