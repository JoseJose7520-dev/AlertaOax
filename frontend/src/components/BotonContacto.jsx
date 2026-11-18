import { useEffect, useId, useRef, useState } from 'react'
import { useConfig } from '../hooks/useConfig.js'
import Icono from './Icono.jsx'

/**
 * Botón flotante de contacto rápido: WhatsApp institucional, correo y 911.
 * El número y el correo vienen del servidor (CONTACTO_WHATSAPP y CONTACTO_CORREO en el .env).
 * `elevado`: súbelo en celular cuando hay barra inferior.
 */
export default function BotonContacto({ elevado = false }) {
  const { contacto } = useConfig()
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', fuera); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', esc) }
  }, [abierto])

  const whatsapp = contacto?.whatsapp
  const correo = contacto?.correo
  const mensaje = encodeURIComponent('Hola, escribo desde AlertaOax.')
  const opcion = 'flex min-h-14 items-center gap-3 rounded-2xl px-3 font-semibold text-tinta no-underline hover:bg-hundido'

  return (
    <div ref={caja} className={`fixed right-4 z-30 flex flex-col items-end gap-3 sm:right-6 ${elevado ? 'bottom-24 lg:bottom-6' : 'bottom-5 sm:bottom-6'}`}>
      {abierto && (
        <div id={id} role="menu" aria-label="Contacto rápido" className="w-72 rounded-3xl border border-linea bg-superficie p-2 shadow-2xl">
          <p className="rotulo px-3 pt-2 pb-1 text-tenue">Contacto rápido</p>
          {whatsapp && (
            <a role="menuitem" href={`https://wa.me/${whatsapp}?text=${mensaje}`} target="_blank" rel="noopener noreferrer" className={opcion}>
              <span className="icono-caja size-10 bg-[#25D366]/15 text-[#128C4B] dark:text-[#4ADE80]"><Icono nombre="whatsapp" tam={22} peso="fill" /></span>
              <span className="flex flex-col leading-tight">WhatsApp institucional<span className="text-nota font-normal text-tenue">Dudas y soporte</span></span>
            </a>
          )}
          {correo && (
            <a role="menuitem" href={`mailto:${correo}`} className={opcion}>
              <span className="icono-caja size-10 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="correo" tam={22} /></span>
              <span className="flex flex-col leading-tight">Escríbenos<span className="text-nota font-normal text-tenue">{correo}</span></span>
            </a>
          )}
          <a role="menuitem" href="tel:911" className={opcion}>
            <span className="icono-caja size-10 bg-riesgo-critico-fondo text-riesgo-critico-texto"><Icono nombre="telefono" tam={22} peso="fill" /></span>
            <span className="flex flex-col leading-tight">Emergencias 911<span className="text-nota font-normal text-tenue">Si tu vida corre peligro</span></span>
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-controls={id}
        aria-label={abierto ? 'Cerrar contacto' : 'Contacto rápido'}
        className="inline-flex size-14 items-center justify-center rounded-full bg-linear-to-br from-[#2563EB] to-[#0891B2] text-white shadow-[0_12px_28px_-10px_rgb(37_99_235/0.8)] transition hover:scale-105 active:scale-95"
      >
        <Icono nombre={abierto ? 'cerrar' : 'contacto'} tam={28} peso={abierto ? 'bold' : 'fill'} />
      </button>
    </div>
  )
}
