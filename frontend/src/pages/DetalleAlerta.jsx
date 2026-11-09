import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import { ALERTAS, DETALLES } from '../data/alertas.js'
import InsigniaNivel from '../components/ui/InsigniaNivel.jsx'
import {
  IconoAntena, IconoCarretera, IconoCasa, IconoEscudoSimple, IconoFlechaIzq, IconoGota, IconoImprimir,
  IconoMensaje, IconoMira, IconoPin, IconoRayo, IconoReloj, IconoTelefono, IconoBrujula, IconoChevronAbajo,
  IconoCheck, IconoInstitucion, IconoAlerta, IconoRuta,
} from '../components/Iconos.jsx'

const TONO = {
  ambar: 'bg-amber-100 text-amber-800',
  azul: 'bg-oax-100 text-oax-800',
  rojo: 'bg-red-100 text-red-700',
  verde: 'bg-green-100 text-green-800',
}
const ICONO_INFRA = [IconoRayo, IconoGota, IconoCarretera, IconoAntena]
const COLOR_PUNTO = { ciudad: '#334155', mando: '#c81e1e', hospital: '#12a150' }

function Dato({ icono: Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icono width={15} height={15} className="mt-0.5 shrink-0 text-oax-700" />
      <div className="leading-tight">
        <dt className="text-[10px] text-slate-500">{etiqueta}</dt>
        <dd className="text-xs font-bold">{valor}</dd>
      </div>
    </div>
  )
}

function MapaImpacto({ mapa }) {
  const [posicion, setPosicion] = useState(null)
  const [aviso, setAviso] = useState('')

  function ubicar() {
    setAviso('')
    if (!navigator.geolocation) return setAviso('Tu navegador no permite obtener la ubicación.')
    navigator.geolocation.getCurrentPosition(
      (p) => setPosicion([p.coords.latitude, p.coords.longitude]),
      () => setAviso('No pudimos obtener tu ubicación. Revisa el permiso del navegador.'),
    )
  }

  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-xl border border-slate-200">
        <MapContainer bounds={mapa.puntos.map((p) => p.pos)} boundsOptions={{ padding: [40, 40] }} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle center={mapa.centro} radius={mapa.radio} pathOptions={{ color: '#c81e1e', fillColor: '#c81e1e', fillOpacity: 0.18, dashArray: '6 6' }} />
          {mapa.puntos.map((p) => (
            <CircleMarker key={p.nombre} center={p.pos} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: COLOR_PUNTO[p.tipo], fillOpacity: 1 }}>
              <Tooltip permanent direction="top" offset={[0, -6]}>{p.nombre}</Tooltip>
            </CircleMarker>
          ))}
          {posicion && (
            <CircleMarker center={posicion} radius={8} pathOptions={{ color: '#fff', weight: 3, fillColor: '#1a77b3', fillOpacity: 1 }}>
              <Tooltip permanent direction="top">Tu ubicación</Tooltip>
            </CircleMarker>
          )}
        </MapContainer>
        <button type="button" onClick={ubicar} className="absolute right-3 top-3 z-[500] inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-oax-700 shadow">
          <IconoMira width={13} height={13} /> Ubicar mi posición
        </button>
      </div>
      {aviso && <p role="alert" className="mt-2 text-xs text-alerta">{aviso}</p>}

      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-600">
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-oax-600" />{mapa.albergues} Albergues habilitados</li>
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" />Puesto Mando CEPCyGR</li>
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-600" />Hospital General Pochutla</li>
        <li className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-700" />Cabeceras municipales</li>
      </ul>
      <Link to="/mapa" className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
        <IconoBrujula width={13} height={13} /> Ver rutas de escape hacia zonas altas (Miahuatlán / Valles)
      </Link>
    </div>
  )
}

export default function DetalleAlerta() {
  const { id } = useParams()
  const alerta = ALERTAS.find((a) => a.id === id)
  const d = DETALLES[id]
  const [verTodo, setVerTodo] = useState(false)

  if (!alerta) {
    return (
      <div className="tarjeta p-8 text-center">
        <h1 className="text-xl font-bold">No encontramos esa alerta</h1>
        <p className="mt-2 text-sm text-slate-500">Puede que haya terminado su vigencia. Revisa las alertas activas.</p>
        <Link to="/alertas" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-oax-700 px-4 py-2.5 text-sm font-semibold text-white">Volver a alertas</Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs">
        <Link to="/alertas" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">
          <IconoFlechaIzq width={13} height={13} /> Volver a alertas
        </Link>
        <nav aria-label="Ruta de navegación" className="text-slate-500">
          Inicio / Alertas activas / <strong className="text-slate-900">{alerta.titulo.length > 40 ? alerta.titulo.slice(0, 40) + '…' : alerta.titulo}</strong>
        </nav>
        <span className="ml-auto flex items-center gap-1.5 font-bold text-red-700"><span className="h-2 w-2 rounded-full bg-red-600" /> BOLETÍN ACTIVO EN TIEMPO REAL</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="flex flex-col gap-6">
          <article className="tarjeta overflow-hidden border-l-4 p-5" style={{ borderLeftColor: alerta.nivel === 'critico' ? '#c81e1e' : undefined }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <InsigniaNivel nivel={alerta.nivel} />
              {d && <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">Folio: {d.folio}</span>}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight">{d?.tituloDetalle ?? alerta.titulo}</h1>

            {d && (
              <dl className="mt-4 grid gap-4 rounded-xl bg-slate-100 p-4 sm:grid-cols-2">
                <Dato icono={IconoInstitucion} etiqueta="Institución emisora" valor={d.emisor} />
                <Dato icono={IconoReloj} etiqueta="Hora de emisión" valor={d.emision} />
                <Dato icono={IconoAlerta} etiqueta="Vigencia oficial" valor={d.vigenciaOficial} />
                <Dato icono={IconoEscudoSimple} etiqueta="Fase operativa" valor={d.fase} />
              </dl>
            )}

            <h2 className="mt-5 text-base font-extrabold">{d ? 'Diagnóstico técnico y cobertura territorial' : 'Resumen'}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">{d?.diagnostico ?? alerta.resumen}</p>
            {!d && (
              <p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
                Emisora: <strong>{alerta.emisora}</strong>. El boletín ampliado de esta alerta estará disponible próximamente.
              </p>
            )}

            {d && (
              <>
                <h3 className="mt-4 text-[10px] font-semibold uppercase text-slate-500">Municipios bajo máximo impacto y plan de contingencia fase 3</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {d.municipios.map((m) => (
                    <li key={m} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                      <IconoPin width={12} height={12} className="text-red-600" /> {m}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>

          {d && (
            <section className="tarjeta p-5" aria-labelledby="protocolo">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 id="protocolo" className="flex items-center gap-2 text-base font-extrabold"><IconoEscudoSimple className="text-oax-700" /> Indicaciones y Protocolo Inmediato</h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">Acciones de cumplimiento obligatorio para la población en zona roja</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{d.protocolo.length} pasos esenciales</span>
              </div>

              <ol className="mt-4 flex flex-col gap-3">
                {d.protocolo.map((p, i) => (
                  <li key={p.titulo} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                    <span className="mt-0.5 text-sm font-extrabold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-sm font-bold">{p.titulo}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => setVerTodo((v) => !v)} aria-expanded={verTodo}
                  className="inline-flex items-center gap-2 rounded-lg bg-oax-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-oax-700">
                  <IconoRuta /> Ver protocolo de evacuación completo <IconoChevronAbajo width={14} height={14} className={verTodo ? 'rotate-180' : ''} />
                </button>
                <Link to="/mapa" className="inline-flex items-center gap-1.5 text-xs font-semibold text-oax-700 hover:underline">
                  <IconoCasa width={14} height={14} /> Consultar albergues activos ({d.mapa.albergues})
                </Link>
              </div>
              {verTodo && (
                <p role="status" className="mt-3 rounded-lg bg-oax-50 p-3 text-xs text-oax-900">
                  El protocolo completo de evacuación (rutas, puntos de reunión y tiempos) se publicará en el módulo “Prepárate” (Sprint 3).
                </p>
              )}
            </section>
          )}

          {d && (
            <div className="tarjeta flex flex-wrap items-center gap-3 p-4 text-xs">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-oax-50 text-oax-700"><IconoCheck width={15} height={15} /></span>
              <p className="flex-1 leading-tight">
                <strong>Boletín Oficial Verificado</strong> <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold">{d.boletin.sello}</span>
                <span className="block text-slate-500">{d.boletin.texto}</span>
              </p>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50">
                <IconoImprimir width={13} height={13} /> Imprimir ficha
              </button>
            </div>
          )}
        </div>

        {d && (
          <aside className="flex flex-col gap-6">
            <section className="tarjeta p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-extrabold"><IconoPin className="text-oax-700" /> Zona de Impacto Crítico</h2>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Cuadrante Costa</span>
              </div>
              <MapaImpacto mapa={d.mapa} />
            </section>

            <section className="tarjeta p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-base font-extrabold"><IconoAntena className="text-oax-700" /> Monitoreo de Infraestructura</h2>
                <span className="text-[10px] text-slate-500">{d.infraCorte}</span>
              </div>
              <ul className="flex flex-col gap-2.5">
                {d.infraestructura.map((x, i) => {
                  const Icono = ICONO_INFRA[i] ?? IconoAntena
                  return (
                    <li key={x.nombre} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="flex items-center gap-2 text-xs font-bold"><Icono width={13} height={13} className="text-slate-500" /> {x.nombre}</h3>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${TONO[x.tono]}`}>{x.estado}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{x.texto}</p>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="tarjeta p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-oax-700 text-white"><IconoInstitucion /></span>
                <div className="leading-tight">
                  <h2 className="text-base font-extrabold">{d.comandancia.nombre}</h2>
                  <p className="text-[11px] text-slate-500">{d.comandancia.sede}</p>
                </div>
              </div>
              <a href={`tel:${d.comandancia.tel}`} className="mt-4 flex items-center gap-3 rounded-xl bg-slate-100 p-3 hover:bg-slate-200">
                <IconoTelefono className="text-oax-700" />
                <span className="flex-1 leading-tight"><span className="block text-[10px] font-semibold uppercase text-slate-500">Línea directa de base</span><strong className="text-sm">{d.comandancia.telefono}</strong></span>
              </a>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-100 p-3">
                <IconoMensaje className="text-oax-700" />
                <span className="leading-tight"><span className="block text-[10px] font-semibold uppercase text-slate-500">WhatsApp de auxilio ciudadano</span><strong className="text-sm">{d.comandancia.mensajeria}</strong></span>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">Para emergencias médicas o rescate inmediato: <a href="tel:911" className="font-bold text-red-600">Marcar al 911</a></p>
            </section>
          </aside>
        )}
      </div>
    </>
  )
}
