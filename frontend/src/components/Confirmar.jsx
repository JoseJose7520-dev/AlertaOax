import { useEffect, useRef } from 'react'

/**
 * Diálogo de confirmación para acciones que no se pueden deshacer.
 * Usa <dialog> nativo: atrapa el foco, se cierra con Escape y lo anuncian los lectores de pantalla.
 */
export default function Confirmar({ abierto, titulo, children, textoConfirmar, claseConfirmar = 'btn-principal', enviando = false, onConfirmar, onCancelar }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onCancelar() }}
      aria-labelledby="confirmar-titulo"
      className="m-auto w-[min(28rem,calc(100vw-2.5rem))] rounded-2xl border border-arena bg-white p-0 text-barro shadow-xl backdrop:bg-barro/50"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="confirmar-titulo" className="text-pantalla font-bold">{titulo}</h2>
        <div className="flex flex-col gap-2 text-barro-suave">{children}</div>
        <div className="flex flex-wrap justify-end gap-2.5 pt-2">
          <button type="button" onClick={onCancelar} className="btn-neutro min-h-13">Revisar</button>
          <button type="button" onClick={onConfirmar} disabled={enviando} className={claseConfirmar} autoFocus>
            {enviando ? 'Un momento…' : textoConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  )
}
