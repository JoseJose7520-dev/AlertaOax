import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { ESTADOS_REPORTE, ICONO_TIPO, TIPOS_REPORTE, fechaCorta } from '../utils/catalogos.js'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'
import SeguimientoReporte from '../components/SeguimientoReporte.jsx'

export default function MisReportes() {
  const { datos, cargando, error } = useApi('/reports/mine')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="rotulo text-tenue">Seguimiento</p>
          <h1 className="text-titular font-bold">Mis reportes</h1>
        </div>
        <Link to="/reportar" className="btn-secundario"><Icono nombre="mas" tam={20} /> Nuevo reporte</Link>
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
              <div className="flex items-start gap-3">
                <span className="icono-caja size-11 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre={ICONO_TIPO[r.tipo]} tam={24} /></span>
                <div className="flex flex-col gap-0.5">
                <h2 className="font-bold">{TIPOS_REPORTE[r.tipo]} <span className="rotulo text-tenue">#{r.id}</span></h2>
                <span className="text-nota text-tenue">{r.referencia ?? 'Con ubicación GPS'} · {fechaCorta(r.creado_en)}</span>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-nota font-bold ${e.clases}`}>{e.nombre}</span>
            </div>
            <p className="text-texto text-tinta-suave">{r.descripcion}</p>
            <SeguimientoReporte estado={r.estado} />
            {r.nota_autoridad && (
              <p className="flex items-start gap-2.5 rounded-xl border-l-4 border-acento bg-acento-suave px-3.5 py-3 text-texto leading-snug text-tinta">
                <Icono nombre="megafono" tam={20} className="mt-0.5 text-acento dark:text-acento-fuerte" />
                <span><strong>Autoridad:</strong> {r.nota_autoridad}</span>
              </p>
            )}
          </article>
        )
      })}
    </div>
  )
}
