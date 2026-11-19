import { useEffect, useId, useRef, useState } from 'react'
import { REGIONES } from '../utils/catalogos.js'
import Icono from './Icono.jsx'

/**
 * Selector de región activa (encabezado del ciudadano).
 * Cambia qué región se consulta en Alertas y Mapa; la región de la cuenta queda marcada como «Tu región».
 */
export default function SelectorRegion({ valor, propia, onCambio }) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!abierto) return
    const fuera = (e) => { if (!caja.current?.contains(e.target)) setAbierto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', fuera); document.addEventListener('keydown', esc)
    caja.current?.querySelector('[aria-checked="true"]')?.focus()
    return () => { document.removeEventListener('pointerdown', fuera); document.removeEventListener('keydown', esc) }
  }, [abierto])

  function teclas(e) {
    const items = [...caja.current.querySelectorAll('[role="menuitemradio"]')]
    const i = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus() }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus() }
  }

  const otra = valor !== propia
  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={id}
        className={`inline-flex min-h-11 items-center gap-1 rounded-full border px-2.5 text-nota font-bold transition hover:border-borde ${otra ? 'border-acento bg-acento-suave text-acento dark:text-acento-fuerte' : 'border-linea bg-superficie'}`}
      >
        <Icono nombre="ubicacion" tam={18} peso="fill" className="text-acento dark:text-acento-fuerte" />
        <span className="sr-only">Región activa:</span>
        <span className="max-w-[7.5rem] truncate">{valor ?? 'Sin región'}</span>
        <Icono nombre="abajo" tam={14} peso="bold" className={`text-tenue transition ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div id={id} role="menu" aria-label="Elegir región" onKeyDown={teclas}
          className="fixed inset-x-4 top-24 z-30 rounded-3xl border border-linea bg-superficie p-2 shadow-2xl sm:absolute sm:inset-x-auto sm:top-13 sm:right-0 sm:w-72">
          <p className="rotulo px-3 pt-2 pb-1.5 text-tenue">Ver alertas y mapa de…</p>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-1">
            {REGIONES.map((r) => {
              const sel = r === valor
              return (
                <li key={r}>
                  <button type="button" role="menuitemradio" aria-checked={sel}
                    onClick={() => { onCambio(r); setAbierto(false) }}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left font-semibold ${sel ? 'bg-acento text-white' : 'text-tinta hover:bg-hundido'}`}>
                    <span className="flex-1 leading-tight">{r}</span>
                    {r === propia && <span className={`rounded-full px-1.5 py-0.5 text-mini font-bold ${sel ? 'bg-white/20 text-white' : 'bg-acento-claro text-acento dark:text-acento-fuerte'}`}>Tu región</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
