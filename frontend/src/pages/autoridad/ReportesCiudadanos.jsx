import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../services/api.js'
import { ESTADOS_REPORTE, ICONO_TIPO, TIPOS_REPORTE, fechaCorta } from '../../utils/catalogos.js'
import { enlaceRuta } from '../../utils/geo.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import Encabezado, { Filtros } from '../../components/Encabezado.jsx'
import Icono from '../../components/Icono.jsx'
import SeguimientoReporte from '../../components/SeguimientoReporte.jsx'

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
    <article className="tarjeta flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="icono-caja size-11 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre={ICONO_TIPO[reporte.tipo]} tam={24} /></span>
          <div className="flex flex-col gap-0.5">
            <h2 className="font-bold">{TIPOS_REPORTE[reporte.tipo]} <span className="rotulo text-tenue">#{reporte.id}</span></h2>
            <span className="text-nota text-tenue">{reporte.ciudadano} · {fechaCorta(reporte.creado_en)}</span>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-nota font-bold ${e.clases}`}>{e.nombre}</span>
      </div>
      <p className="text-tinta-suave">{reporte.descripcion}</p>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-hundido px-3 py-2 text-nota">
        <Icono nombre="ubicacion" tam={18} peso="fill" className="text-acento dark:text-acento-fuerte" />
        <span><strong>Lugar:</strong> {reporte.referencia ?? 'Sin referencia'}</span>
        {reporte.latitud !== null && (
          <a href={enlaceRuta(reporte)} target="_blank" rel="noreferrer" className="font-bold">Ver en el mapa →</a>
        )}
      </p>
      <SeguimientoReporte estado={reporte.estado} />
      {reporte.nota_autoridad && <p className="rounded-xl border-l-4 border-acento bg-acento-suave px-3 py-2 text-nota"><strong>Última nota:</strong> {reporte.nota_autoridad}</p>}
      {siguiente && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="etiqueta min-w-0 flex-[1_1_260px] text-nota">
            Nota para el ciudadano (opcional)
            <input className="campo min-h-11 font-normal" maxLength={500} placeholder="Ej. Brigada en camino" value={nota} onChange={(ev) => setNota(ev.target.value)} />
          </label>
          <button type="button" disabled={enviando} onClick={() => cambiar(siguiente)} className="btn-principal min-h-11 text-texto">
            <Icono nombre={siguiente === 'en_atencion' ? 'reloj' : 'ok'} tam={20} peso="fill" />
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
      <Encabezado rotulo="Panel de autoridad · Atención" titulo="Reportes ciudadanos" icono="reporte">
        Incidentes que reportó la población de tu región. Deja una nota para que sepan qué se está haciendo.
      </Encabezado>
      <Filtros etiqueta="Filtrar por estado" valor={filtro} onCambio={setFiltro} opciones={FILTROS.map((f) => [f.valor, f.texto])} />
      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos?.reportes.length === 0 && <p className="text-tenue">No hay reportes con este filtro.</p>}
      {datos?.reportes.map((r) => <Reporte key={r.id} reporte={r} alActualizar={recargar} />)}
    </section>
  )
}
