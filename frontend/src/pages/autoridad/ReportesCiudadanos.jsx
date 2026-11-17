import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../services/api.js'
import { ESTADOS_REPORTE, TIPOS_REPORTE, fechaCorta } from '../../utils/catalogos.js'
import { enlaceRuta } from '../../utils/geo.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'

const FILTROS = [
  { valor: '', texto: 'Todos' },
  { valor: 'recibido', texto: 'Recibidos' },
  { valor: 'en_atencion', texto: 'En atención' },
  { valor: 'atendido', texto: 'Atendidos' },
]

function Reporte({ reporte, alActualizar }) {
  const [nota, setNota] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const e = ESTADOS_REPORTE[reporte.estado]
  const siguiente = reporte.estado === 'recibido' ? 'en_atencion' : reporte.estado === 'en_atencion' ? 'atendido' : null

  async function cambiar(estado) {
    setEnviando(true)
    setError('')
    try {
      await api.patch(`/reports/${reporte.id}/estado`, { estado, nota: nota.trim() || undefined })
      setNota('')
      alActualizar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <article className="tarjeta flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-bold">{TIPOS_REPORTE[reporte.tipo]} · <span className="font-normal text-tenue">#{reporte.id}</span></h2>
          <span className="text-nota text-tenue">{reporte.ciudadano} · {fechaCorta(reporte.creado_en)}</span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-nota font-bold ${e.clases}`}>{e.nombre}</span>
      </div>
      <p className="text-barro-suave">{reporte.descripcion}</p>
      <p className="text-nota">
        <strong>Lugar:</strong> {reporte.referencia ?? 'Sin referencia'}
        {reporte.latitud !== null && (
          <> · <a href={enlaceRuta(reporte)} target="_blank" rel="noreferrer">Ver en el mapa</a></>
        )}
      </p>
      {reporte.nota_autoridad && <p className="text-nota text-anil-oscuro"><strong>Última nota:</strong> {reporte.nota_autoridad}</p>}
      {siguiente && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="etiqueta min-w-0 flex-[1_1_260px] text-nota">
            Nota para el ciudadano (opcional)
            <input className="campo min-h-11 font-normal" maxLength={500} placeholder="Ej. Brigada en camino" value={nota} onChange={(ev) => setNota(ev.target.value)} />
          </label>
          <button type="button" disabled={enviando} onClick={() => cambiar(siguiente)} className="btn-principal min-h-11 text-texto">
            {siguiente === 'en_atencion' ? 'Marcar en atención' : 'Marcar atendido'}
          </button>
        </div>
      )}
      <Aviso tipo="error">{error}</Aviso>
    </article>
  )
}

export default function ReportesCiudadanos() {
  const [filtro, setFiltro] = useState('')
  const { datos, cargando, error, recargar } = useApi(`/reports${filtro ? `?estado=${filtro}` : ''}`)

  return (
    <section className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-titular font-bold">Reportes ciudadanos</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            aria-pressed={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`min-h-11 rounded-full border-[1.5px] px-4 ${filtro === f.valor ? 'border-anil bg-anil font-bold text-white' : 'border-borde bg-white'}`}
          >
            {f.texto}
          </button>
        ))}
      </div>
      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos?.reportes.length === 0 && <p className="text-tenue">No hay reportes con este filtro.</p>}
      {datos?.reportes.map((r) => <Reporte key={r.id} reporte={r} alActualizar={recargar} />)}
    </section>
  )
}
