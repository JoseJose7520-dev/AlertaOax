import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { ESTADOS_REPORTE, TIPOS_ALERTA } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import Encabezado from '../../components/Encabezado.jsx'
import Icono from '../../components/Icono.jsx'
import ListaSolicitudes from '../../components/ListaSolicitudes.jsx'

function Cifra({ etiqueta, valor, icono, color, destacada = false, a }) {
  const contenido = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className={`icono-caja size-11 ${color}`}><Icono nombre={icono} tam={24} /></span>
        {a && <Icono nombre="flecha" tam={18} className="text-tenue" />}
      </span>
      <span className="font-display text-cifra font-bold">{valor}</span>
      <span className={`text-nota font-semibold ${destacada ? 'text-acento dark:text-acento-fuerte' : 'text-tenue'}`}>{etiqueta}</span>
    </>
  )
  const clases = `tarjeta flex flex-col gap-2.5 p-4.5 text-tinta no-underline transition ${destacada ? 'border-acento/50 ring-1 ring-acento/30 hover:border-acento' : ''}`
  return a ? <Link to={a} className={clases}>{contenido}</Link> : <div className={clases}>{contenido}</div>
}

/** Barras horizontales accesibles: cada fila tiene el texto y el número, no solo la barra. */
function Barras({ titulo, icono, filas, color = 'bg-acento' }) {
  const max = Math.max(1, ...filas.map((f) => f.total))
  return (
    <section className="tarjeta flex min-w-0 flex-[1_1_320px] flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 text-subtitulo font-bold"><Icono nombre={icono} tam={22} className="text-acento dark:text-acento-fuerte" /> {titulo}</h2>
      {filas.length === 0 && <p className="text-tenue">Sin datos todavía.</p>}
      <ul className="flex flex-col gap-2.5">
        {filas.map((f) => (
          <li key={f.nombre} className="grid grid-cols-[8.5rem_minmax(0,1fr)_2.25rem] items-center gap-2.5 text-texto">
            <span className="leading-tight">{f.nombre}</span>
            <span className="h-3 overflow-hidden rounded-full bg-hundido" aria-hidden="true">
              <span className={`block h-full rounded-full ${f.color ?? color}`} style={{ width: `${(f.total / max) * 100}%`, backgroundImage: f.color ? undefined : 'linear-gradient(90deg,#2563EB,#0891B2)' }} />
            </span>
            <strong className="text-right font-display">{f.total}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

const COLOR_ESTADO = { recibido: 'bg-borde', en_atencion: 'bg-acento', atendido: 'bg-riesgo-bajo' }

/** Las solicitudes de autoridad más antiguas, para resolverlas sin salir del resumen. */
function SolicitudesPendientes({ onCambio }) {
  const { datos, recargar } = useApi('/admin/authorities?estado=pendiente')
  const [aviso, setAviso] = useState({ tipo: 'info', texto: '' })
  const lista = datos?.autoridades ?? []
  return (
    <section className="flex flex-col gap-3" aria-labelledby="sol-titulo">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="sol-titulo" className="flex items-center gap-2 text-subtitulo font-bold">
          <Icono nombre="escudo" tam={22} className="text-acento dark:text-acento-fuerte" /> Solicitudes de autoridad
          {lista.length > 0 && <span className="rounded-full bg-riesgo-medio-fondo px-2 py-0.5 text-nota font-bold text-riesgo-medio-texto">{lista.length} por validar</span>}
        </h2>
        <Link to="/admin/autoridades" className="inline-flex min-h-11 items-center gap-1 font-bold">Ver todas <Icono nombre="flecha" tam={18} /></Link>
      </div>
      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
      {datos && lista.length === 0 && (
        <p className="tarjeta flex items-center gap-3 p-4 text-tenue">
          <span className="icono-caja size-10 bg-riesgo-bajo-fondo text-ok-texto"><Icono nombre="ok" tam={22} /></span> No hay solicitudes por revisar.
        </p>
      )}
      {lista.length > 0 && (
        <ListaSolicitudes autoridades={lista.slice(0, 3)}
          onDecidido={(m) => { setAviso({ tipo: 'exito', texto: m }); recargar(); onCambio() }}
          onError={(m) => setAviso({ tipo: 'error', texto: m })} />
      )}
    </section>
  )
}

export default function Resumen() {
  const { datos, cargando, error, recargar } = useApi('/admin/metrics')
  if (cargando && !datos) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>
  const m = datos.metricas

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <Encabezado rotulo="Sala de situación · Oaxaca" titulo="Resumen" icono="grafica">
        Indicadores en tiempo real de alertas, ciudadanos y reportes en las 8 regiones.
      </Encabezado>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
        <Cifra etiqueta="Alertas activas" valor={m.alertas_activas} icono="sirena" color="bg-riesgo-critico-fondo text-riesgo-critico-texto" />
        <Cifra etiqueta="Ciudadanos registrados" valor={m.ciudadanos} icono="comunidad" color="bg-acento-claro text-acento dark:text-acento-fuerte" />
        <Cifra etiqueta="Reportes abiertos" valor={m.reportes_abiertos} icono="reporte" color="bg-riesgo-alto-fondo text-riesgo-alto-texto" />
        <Cifra etiqueta="Notificaciones enviadas" valor={m.notificaciones_enviadas} icono="campana" color="bg-cyan-500/15 text-cian" />
        <Cifra etiqueta="Autoridades por validar" valor={m.autoridades_pendientes} icono="escudo" color="bg-riesgo-medio-fondo text-riesgo-medio-texto" destacada a="/admin/autoridades" />
      </div>
      <div className="flex flex-wrap gap-5">
        <Barras titulo="Alertas por tipo" icono="huracan" filas={m.alertas_por_tipo.map((f) => ({ nombre: TIPOS_ALERTA[f.tipo] ?? f.tipo, total: f.total }))} />
        <Barras titulo="Alertas por región" icono="mapa" filas={m.alertas_por_region.map((f) => ({ nombre: f.region, total: f.total }))} />
        <Barras titulo="Reportes por estado" icono="reporte" filas={m.reportes_por_estado.map((f) => ({ nombre: ESTADOS_REPORTE[f.estado]?.nombre ?? f.estado, total: f.total, color: COLOR_ESTADO[f.estado] }))} />
      </div>
      <SolicitudesPendientes onCambio={recargar} />
      <p className="rotulo text-tenue">
        Total histórico: {m.alertas_total} alertas · {m.reportes_total} reportes · {m.autoridades_aprobadas} autoridades aprobadas
      </p>
    </div>
  )
}
