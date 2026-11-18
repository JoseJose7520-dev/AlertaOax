import { useEffect, useId, useRef, useState } from 'react'
import Icono from './Icono.jsx'
import { DOCUMENTOS } from '../utils/legal.js'

/**
 * Diálogo con el Aviso Legal, la Política de Privacidad y los Términos, en pestañas.
 * `seccion` elige la pestaña inicial; `onAceptar` muestra «Entendido y aceptar» (desde el registro).
 */
export default function ModalTerminos({ abierto, seccion = 'terminos', onCerrar, onAceptar }) {
  const ref = useRef(null)
  const cuerpo = useRef(null)
  const [activa, setActiva] = useState(seccion)
  const uid = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) { setActiva(seccion); d.showModal() }
    if (!abierto && d.open) d.close()
  }, [abierto, seccion])

  useEffect(() => { cuerpo.current?.scrollTo({ top: 0 }) }, [activa])

  const doc = DOCUMENTOS.find((d) => d.id === activa) ?? DOCUMENTOS[0]

  function teclas(e) {
    const i = DOCUMENTOS.findIndex((d) => d.id === activa)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const sig = DOCUMENTOS[(i + (e.key === 'ArrowRight' ? 1 : DOCUMENTOS.length - 1)) % DOCUMENTOS.length]
      setActiva(sig.id)
      e.currentTarget.querySelector(`[data-doc="${sig.id}"]`)?.focus()
    }
  }

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onCerrar() }}
      onClick={(e) => { if (e.target === ref.current) onCerrar() }}
      aria-labelledby={`${uid}-titulo`}
      className="m-auto text-left max-h-[min(88dvh,46rem)] w-[min(42rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl border border-linea bg-superficie p-0 text-tinta shadow-2xl backdrop:bg-abisal/70 backdrop:backdrop-blur-sm open:flex"
    >
      <header className="topografia flex flex-col gap-4 border-b border-linea px-5 pt-5 pb-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="icono-caja size-11 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre={doc.icono} tam={24} /></span>
            <div>
              <p className="rotulo text-tenue">Información legal · AlertaOax</p>
              <h2 id={`${uid}-titulo`} data-titulo className="text-pantalla font-bold">{doc.titulo}</h2>
            </div>
          </div>
          <button type="button" onClick={onCerrar} className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-tenue hover:bg-hundido hover:text-tinta" aria-label="Cerrar">
            <Icono nombre="cerrar" peso="bold" />
          </button>
        </div>
        <div role="tablist" aria-label="Documentos legales" onKeyDown={teclas} className="grid grid-cols-3 gap-1 rounded-full border border-linea bg-hundido p-1">
          {DOCUMENTOS.map((d) => {
            const sel = d.id === activa
            return (
              <button key={d.id} id={`${uid}-${d.id}`} data-doc={d.id} type="button" role="tab" aria-selected={sel} aria-controls={`${uid}-panel`} tabIndex={sel ? 0 : -1}
                onClick={() => setActiva(d.id)}
                className={`min-h-10 rounded-full px-2 text-nota font-semibold transition ${sel ? 'bg-superficie text-tinta shadow-tarjeta' : 'text-tenue hover:text-tinta'}`}>
                {d.corto}
              </button>
            )
          })}
        </div>
      </header>
      <div ref={cuerpo} id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-${doc.id}`} className="flex flex-col gap-3 overflow-y-auto px-5 py-5 sm:px-6">
        {doc.bloques.map(([t, d], i) => (
          <section key={t} className="flex gap-3.5 rounded-2xl border border-linea bg-hundido/50 px-4 py-3.5">
            <span className="mt-0.5 font-mono text-nota font-semibold text-acento dark:text-acento-fuerte" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 leading-relaxed text-tinta-suave">{d}</p>
            </div>
          </section>
        ))}
        <p className="pt-1 text-nota text-tenue">Última actualización: noviembre de 2026.</p>
      </div>
      <footer className="flex flex-wrap justify-end gap-2.5 border-t border-linea px-5 py-4 sm:px-6">
        <button type="button" onClick={onCerrar} className="btn-neutro min-h-12">Cerrar</button>
        {onAceptar && (
          <button type="button" onClick={onAceptar} className="btn-principal min-h-12 text-texto">
            <Icono nombre="ok" tam={20} peso="fill" /> Entendido y aceptar
          </button>
        )}
      </footer>
    </dialog>
  )
}
