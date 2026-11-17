import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { ESTADOS_REPORTE, TIPOS_ALERTA } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'

function Cifra({ etiqueta, valor, destacada = false, a }) {
  const contenido = (
    <>
      <span className={`text-nota ${destacada ? 'text-anil-oscuro' : 'text-tenue'}`}>{etiqueta}</span>
      <span className={`text-titular leading-none font-bold ${destacada ? 'text-anil-oscuro' : ''}`}>{valor}</span>
    </>
  )
  const clases = `flex flex-col gap-2 rounded-2xl border p-4.5 no-underline ${destacada ? 'border-[#C9C3EA] bg-anil-claro text-anil-oscuro' : 'border-arena bg-white text-barro'}`
  return a ? <Link to={a} className={clases}>{contenido}</Link> : <div className={clases}>{contenido}</div>
}

/** Barras horizontales accesibles: cada fila tiene el texto y el número, no solo la barra. */
function Barras({ titulo, filas }) {
  const max = Math.max(1, ...filas.map((f) => f.total))
  return (
    <section className="tarjeta flex min-w-0 flex-[1_1_320px] flex-col gap-3.5 p-5">
      <h2 className="text-subtitulo font-bold">{titulo}</h2>
      {filas.length === 0 && <p className="text-tenue">Sin datos todavía.</p>}
      <ul className="flex flex-col gap-2.5">
        {filas.map((f) => (
          <li key={f.nombre} className="grid grid-cols-[120px_minmax(0,1fr)_36px] items-center gap-2.5 text-texto">
            <span className="truncate">{f.nombre}</span>
            <span className="h-3.5 overflow-hidden rounded-full bg-crema" aria-hidden="true">
              <span className="block h-full rounded-full bg-anil" style={{ width: `${(f.total / max) * 100}%` }} />
            </span>
            <strong className="text-right">{f.total}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Resumen() {
  const { datos, cargando, error } = useApi('/admin/metrics')
  if (cargando) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>
  const m = datos.metricas

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <h1 className="text-titular font-bold">Resumen</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
        <Cifra etiqueta="Alertas activas" valor={m.alertas_activas} />
        <Cifra etiqueta="Ciudadanos registrados" valor={m.ciudadanos} />
        <Cifra etiqueta="Reportes abiertos" valor={m.reportes_abiertos} />
        <Cifra etiqueta="Notificaciones enviadas" valor={m.notificaciones_enviadas} />
        <Cifra etiqueta="Autoridades por validar" valor={m.autoridades_pendientes} destacada a="/admin/autoridades" />
      </div>
      <div className="flex flex-wrap gap-5">
        <Barras titulo="Alertas por tipo" filas={m.alertas_por_tipo.map((f) => ({ nombre: TIPOS_ALERTA[f.tipo] ?? f.tipo, total: f.total }))} />
        <Barras titulo="Alertas por región" filas={m.alertas_por_region.map((f) => ({ nombre: f.region, total: f.total }))} />
        <Barras titulo="Reportes por estado" filas={m.reportes_por_estado.map((f) => ({ nombre: ESTADOS_REPORTE[f.estado]?.nombre ?? f.estado, total: f.total }))} />
      </div>
      <p className="text-nota text-tenue">
        Total histórico: {m.alertas_total} alertas, {m.reportes_total} reportes y {m.autoridades_aprobadas} autoridades aprobadas.
      </p>
    </div>
  )
}
