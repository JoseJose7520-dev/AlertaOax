import { useState } from 'react'
import { api } from '../services/api.js'
import { fechaCorta, haceCuanto } from '../utils/catalogos.js'
import Confirmar from './Confirmar.jsx'
import Icono from './Icono.jsx'

const ESTADO = {
  pendiente: { texto: 'Pendiente', icono: 'reloj', clases: 'bg-riesgo-medio-fondo text-riesgo-medio-texto' },
  aprobada: { texto: 'Aprobada', icono: 'ok', clases: 'bg-riesgo-bajo-fondo text-ok-texto' },
  rechazada: { texto: 'Rechazada', icono: 'cerrar', clases: 'bg-hundido text-tinta-suave' },
}

const iniciales = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

/**
 * Solicitudes de cuenta de autoridad con Aprobar / Rechazar.
 * Cada decisión pide confirmación en un diálogo; al terminar avisa con `onDecidido(mensaje)`.
 */
export default function ListaSolicitudes({ autoridades, onDecidido, onError }) {
  const [pendiente, setPendiente] = useState(null) // { a, decision }
  const [enviando, setEnviando] = useState(false)

  async function confirmar() {
    const { a, decision } = pendiente
    setEnviando(true)
    try {
      const r = await api.put(`/admin/authorities/${a.id}/validate`, { decision })
      onDecidido?.(`${r.mensaje} (${a.nombre})`)
      setPendiente(null)
    } catch (err) {
      onError?.(err.message)
      setPendiente(null)
    } finally {
      setEnviando(false)
    }
  }

  const aprobar = pendiente?.decision === 'aprobada'
  return (
    <>
      <ul className="flex flex-col gap-2.5">
        {autoridades.map((a) => {
          const e = ESTADO[a.estado_validacion] ?? ESTADO.pendiente
          return (
            <li key={a.id} className="tarjeta flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-acento-claro font-bold text-acento dark:text-acento-fuerte" aria-hidden="true">{iniciales(a.nombre)}</span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-subtitulo">{a.nombre}</strong>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-nota font-bold ${e.clases}`}><Icono nombre={e.icono} tam={14} peso="bold" /> {e.texto}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-tinta-suave"><Icono nombre="escudo" tam={16} className="shrink-0 text-tenue" /> {a.institucion}</span>
                  <span className="text-nota text-tenue">
                    <Icono nombre="ubicacion" tam={14} className="inline align-[-2px]" /> {a.region} · {a.correo} · <span title={fechaCorta(a.creado_en)}>solicitó {haceCuanto(a.creado_en)}</span>
                  </span>
                </div>
              </div>
              <div className="flex gap-2 md:shrink-0">
                {a.estado_validacion !== 'rechazada' && (
                  <button type="button" onClick={() => setPendiente({ a, decision: 'rechazada' })} className="btn-neutro min-h-11 flex-1 text-nota md:flex-none">
                    <Icono nombre="cerrar" tam={18} peso="bold" /> Rechazar
                  </button>
                )}
                {a.estado_validacion !== 'aprobada' && (
                  <button type="button" onClick={() => setPendiente({ a, decision: 'aprobada' })} className="btn-principal min-h-11 flex-1 text-nota md:flex-none">
                    <Icono nombre="palomita" tam={18} peso="bold" /> Aprobar
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <Confirmar
        abierto={pendiente !== null}
        icono={aprobar ? 'escudo' : 'cerrar'}
        tono={aprobar ? 'normal' : 'peligro'}
        titulo={aprobar ? '¿Aprobar esta autoridad?' : '¿Rechazar la solicitud?'}
        textoConfirmar={aprobar ? 'Sí, aprobar' : 'Sí, rechazar'}
        textoCancelar="Cancelar"
        enviando={enviando}
        onConfirmar={confirmar}
        onCancelar={() => setPendiente(null)}
      >
        {pendiente && (
          <>
            <p><strong className="text-tinta">{pendiente.a.nombre}</strong> · {pendiente.a.institucion} ({pendiente.a.region})</p>
            <p>{aprobar
              ? 'Podrá publicar alertas que llegarán a toda la población de su región. Confirma antes su cargo por un medio oficial.'
              : 'La persona no podrá publicar alertas. Podrás aprobarla después desde «Rechazadas» si fue un error.'}</p>
          </>
        )}
      </Confirmar>
    </>
  )
}
