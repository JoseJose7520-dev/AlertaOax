import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { ESTADOS_REPORTE, TIPOS_REPORTE, fechaCorta } from '../utils/catalogos.js'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'
import SeguimientoReporte from '../components/SeguimientoReporte.jsx'

export default function MisReportes() {
  const { datos, cargando, error } = useApi('/reports/mine')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Link to="/reportar" className="-ml-3 inline-flex size-11 items-center justify-center rounded-xl text-barro hover:bg-crema" aria-label="Volver a reportar">
          <Icono nombre="atras" />
        </Link>
        <h1 className="text-pantalla font-bold">Mis reportes</h1>
      </div>

      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos?.reportes.length === 0 && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-tenue">Todavía no has enviado reportes.</p>
          <Link to="/reportar" className="btn-principal">Hacer un reporte</Link>
        </div>
      )}

      {datos?.reportes.map((r) => {
        const e = ESTADOS_REPORTE[r.estado]
        return (
          <article key={r.id} className="tarjeta flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-bold">{TIPOS_REPORTE[r.tipo]}</h2>
                <span className="text-nota text-tenue">{r.referencia ?? 'Con ubicación GPS'} · {fechaCorta(r.creado_en)}</span>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-nota font-bold ${e.clases}`}>{e.nombre}</span>
            </div>
            <p className="text-texto text-barro-suave">{r.descripcion}</p>
            <SeguimientoReporte estado={r.estado} />
            {r.nota_autoridad && (
              <p className="rounded-xl bg-anil-suave px-3 py-2.5 text-nota leading-snug text-anil-oscuro">
                <strong>Autoridad:</strong> {r.nota_autoridad}
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
