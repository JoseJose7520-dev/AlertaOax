import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { haceCuanto } from '../utils/catalogos.js'
import Icono from './Icono.jsx'
import InsigniaNivel from './InsigniaNivel.jsx'

/**
 * Campana de avisos (HU-03) en el encabezado: visible en todas las pantallas del ciudadano,
 * con contador de no leídos. Se actualiza sola cada 60 segundos.
 */
export default function Notificaciones() {
  const { datos, recargar } = useApi('/notifications', { intervalo: 60000 })
  const [abierto, setAbierto] = useState(false)
  const caja = useRef(null)

  // Se cierra al tocar fuera, con Escape o al elegir un aviso
  useEffect(() => {
    if (!abierto) return undefined
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) setAbierto(false) }
    const escape = (e) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('pointerdown', fuera)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      document.removeEventListener('keydown', escape)
    }
  }, [abierto])

  const noLeidas = datos?.noLeidas ?? 0
  const lista = datos?.notificaciones ?? []

  async function leerTodas() {
    await api.patch('/notifications/leer-todas').catch(() => {})
    recargar()
  }

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-haspopup="true"
        aria-label={noLeidas > 0 ? `Avisos, ${noLeidas} sin leer` : 'Avisos'}
        className="relative inline-flex size-11 items-center justify-center rounded-xl text-barro hover:bg-crema"
      >
        <Icono nombre="campana" />
        {noLeidas > 0 && (
          <span className="absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-anil px-1 text-nota leading-5 font-bold text-white" aria-hidden="true">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="fixed inset-x-4 top-16 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl border border-arena bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-arena px-4 py-3">
            <h2 className="text-subtitulo font-bold">Avisos</h2>
            {noLeidas > 0 && (
              <button type="button" onClick={leerTodas} className="min-h-11 px-1 text-nota font-bold text-anil">Marcar todo como leído</button>
            )}
          </div>
          {lista.length === 0 ? (
            <p className="px-4 py-5 text-tenue">Aún no has recibido avisos. Te llegarán cuando se publique una alerta en tu región.</p>
          ) : (
            <ul className="max-h-[60dvh] overflow-y-auto">
              {lista.slice(0, 20).map((n) => (
                <li key={n.id} className="border-b border-arena last:border-0">
                  <Link
                    to={`/alertas/${n.alerta_id}`}
                    onClick={() => { setAbierto(false); if (!n.leida) api.patch(`/notifications/${n.id}/leida`).then(recargar).catch(() => {}) }}
                    className={`flex flex-col gap-1 px-4 py-3 text-barro no-underline hover:bg-anil-suave ${n.leida ? '' : 'bg-anil-suave'}`}
                  >
                    <span className="flex items-center gap-2">
                      <InsigniaNivel nivel={n.nivel} />
                      {!n.vigente && <span className="text-nota text-tenue">Terminó</span>}
                      {!n.leida && <span className="ml-auto size-2.5 rounded-full bg-anil" aria-label="Sin leer" />}
                    </span>
                    <span className={n.leida ? '' : 'font-bold'}>{n.titulo}</span>
                    <span className="text-nota text-tenue">{haceCuanto(n.creada_en)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
