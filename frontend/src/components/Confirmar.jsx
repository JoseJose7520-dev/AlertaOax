import { useEffect, useId, useRef } from 'react'
import Icono from './Icono.jsx'

/**
 * Diálogo de confirmación para acciones que no se pueden deshacer.
 * Usa <dialog> nativo: atrapa el foco, se cierra con Escape y lo anuncian los lectores de pantalla.
 * `tono`: 'peligro' (rojo) o 'normal'; `icono` opcional en la cabecera.
 */
export default function Confirmar({
  abierto, titulo, children, textoConfirmar, textoCancelar = 'Revisar', claseConfirmar, tono = 'normal', icono,
  enviando = false, onConfirmar, onCancelar,
}) {
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  const peligro = tono === 'peligro'
  const boton = claseConfirmar ?? (peligro
    ? 'inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-riesgo-critico px-5 font-bold text-white hover:brightness-110 disabled:opacity-60'
    : 'btn-principal min-h-13')

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onCancelar() }}
      aria-labelledby={`${id}-titulo`}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-3xl border border-linea bg-superficie p-0 text-left text-tinta shadow-2xl backdrop:bg-abisal/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          {icono && (
            <span className={`icono-caja size-12 shrink-0 ${peligro ? 'bg-riesgo-critico-fondo text-riesgo-critico-texto' : 'bg-acento-claro text-acento dark:text-acento-fuerte'}`}>
              <Icono nombre={icono} tam={26} />
            </span>
          )}
          <h2 id={`${id}-titulo`} className="pt-1 text-pantalla font-bold">{titulo}</h2>
        </div>
        <div className="flex flex-col gap-2 text-tinta-suave">{children}</div>
        <div className="flex flex-wrap justify-end gap-2.5 pt-2">
          <button type="button" onClick={onCancelar} className="btn-neutro min-h-13">{textoCancelar}</button>
          <button type="button" onClick={onConfirmar} disabled={enviando} className={boton} autoFocus>
            {enviando ? 'Un momento…' : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
