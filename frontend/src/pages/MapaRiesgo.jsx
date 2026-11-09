import { useEffect, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import {
  ALBERGUES, BASES, CAPAS, CORTES, CUENCAS, HOSPITALES, HURACAN, LOCALIDADES, SEMAFORO, SISMOS, ZONAS,
} from '../data/mapa.js'
import { NIVELES } from '../data/alertas.js'
import { CENTRO_OAXACA } from '../utils/constantes.js'

// Encuadre inicial: todo el estado, con la Costa visible
const CENTRO_ESTADO = [16.6, -96.6]
import {
  IconoAlerta, IconoBuscar, IconoCapas, IconoCasa, IconoCerrar, IconoDescargar, IconoGota, IconoHospital,
  IconoOnda, IconoRayo, IconoRuta, IconoTelefono, IconoCheck,
} from '../components/Iconos.jsx'

const ICONO_CAPA = { onda: IconoOnda, rayo: IconoRayo, gota: IconoGota, alerta: IconoAlerta, casa: IconoCasa, hospital: IconoHospital }

/** Mueve el mapa cuando el buscador elige una localidad. */
function VolarA({ destino }) {
  const map = useMap()
  useEffect(() => { if (destino) map.flyTo(destino.pos, destino.zoom) }, [destino, map])
  return null
}

function Interruptor({ activo, onChange, etiqueta }) {
  return (
    <button type="button" role="switch" aria-checked={activo} aria-label={etiqueta} onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${activo ? 'bg-oax-600' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${activo ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

export default function MapaRiesgo() {
  const [base, setBase] = useState('topo')
  const [niveles, setNiveles] = useState({ critico: true, alto: true, medio: true, vigilancia: true })
  const [capas, setCapas] = useState({ huracan: true, sismos: true, cuencas: false, cortes: true, albergues: true, hospitales: false })
  const [panel, setPanel] = useState(() => window.innerWidth >= 1024)
  const [busqueda, setBusqueda] = useState('')
  const [destino, setDestino] = useState(null)
  const [sinResultado, setSinResultado] = useState(false)
  const [refugio, setRefugio] = useState(null)

  const baseActual = BASES.find((b) => b.id === base)
  const alternar = (obj, set, k) => set({ ...obj, [k]: !obj[k] })

  function buscar(e) {
    e.preventDefault()
    const q = busqueda.trim().toLowerCase()
    const hallada = q && LOCALIDADES.find((l) => l.nombre.toLowerCase().includes(q))
    setSinResultado(!hallada)
    if (hallada) setDestino({ ...hallada })
  }

  return (
    <>
      <div className="relative h-[calc(100vh-17rem)] min-h-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <MapContainer center={CENTRO_ESTADO} zoom={8} zoomControl={false} className="h-full w-full">
          <TileLayer key={base} attribution={baseActual.atribucion} url={baseActual.url} />
          <ZoomControl position="topright" />
          <VolarA destino={destino} />

          {ZONAS.filter((z) => niveles[z.nivel]).map((z) => (
            <Circle key={z.id} center={z.centro} radius={z.radio}
              pathOptions={{ color: NIVELES[z.nivel].color, fillColor: NIVELES[z.nivel].color, fillOpacity: 0.16, weight: 1.5 }}>
              <Tooltip sticky>{z.nombre}</Tooltip>
            </Circle>
          ))}

          {capas.huracan && (
            <>
              <Polyline positions={HURACAN.trayectoria} pathOptions={{ color: '#c81e1e', weight: 3, dashArray: '8 8' }} />
              <Circle center={HURACAN.ojo} radius={HURACAN.radio} pathOptions={{ color: '#c81e1e', fillColor: '#c81e1e', fillOpacity: 0.22, dashArray: '6 6' }}>
                <Tooltip permanent direction="center">Ojo huracán Carlotta</Tooltip>
              </Circle>
            </>
          )}

          {capas.sismos && SISMOS.map((s) => (
            <CircleMarker key={s.id} center={s.pos} radius={s.magnitud * 2.2} pathOptions={{ color: '#fff', weight: 2, fillColor: '#1a77b3', fillOpacity: 0.85 }}>
              <Tooltip permanent direction="right">M{s.magnitud} {s.lugar} · {s.profundidad}</Tooltip>
            </CircleMarker>
          ))}

          {capas.cuencas && CUENCAS.map((c) => (
            <CircleMarker key={c.id} center={c.pos} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#0891b2', fillOpacity: 1 }}>
              <Tooltip direction="top">{c.nombre}: {c.nota}</Tooltip>
            </CircleMarker>
          ))}

          {capas.cortes && CORTES.map((c) => (
            <CircleMarker key={c.id} center={c.pos} radius={8} pathOptions={{ color: '#fff', weight: 2, fillColor: '#c81e1e', fillOpacity: 1 }}>
              <Tooltip permanent direction="top">{c.nombre}</Tooltip>
            </CircleMarker>
          ))}

          {capas.hospitales && HOSPITALES.map((h) => (
            <CircleMarker key={h.id} center={h.pos} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#12a150', fillOpacity: 1 }}>
              <Tooltip direction="top">{h.nombre}</Tooltip>
            </CircleMarker>
          ))}

          {capas.albergues && ALBERGUES.map((a) => (
            <CircleMarker key={a.id} center={a.pos} radius={8} eventHandlers={{ click: () => setRefugio(a) }}
              pathOptions={{ color: '#fff', weight: 2, fillColor: '#0b5c93', fillOpacity: 1 }}>
              <Tooltip direction="top">{a.nombre}</Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Selector de mapa base */}
        <div role="group" aria-label="Tipo de mapa" className="absolute left-3 top-14 z-[1000] flex gap-0.5 lg:left-auto lg:right-14 lg:top-3 rounded-lg bg-white p-1 text-[11px] font-semibold shadow">
          {BASES.map((b) => (
            <button key={b.id} type="button" onClick={() => setBase(b.id)} aria-pressed={base === b.id}
              className={`rounded-md px-2.5 py-1.5 ${base === b.id ? 'bg-oax-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {b.texto}
            </button>
          ))}
        </div>

        {/* Panel de capas */}
        <button type="button" onClick={() => setPanel((p) => !p)} aria-expanded={panel}
          className="absolute left-3 top-3 z-[1000] inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow lg:hidden">
          <IconoCapas width={14} height={14} /> {panel ? 'Ocultar capas' : 'Capas'}
        </button>

        {panel && (
          <aside aria-label="Capas GIS Oaxaca" className="absolute bottom-3 left-3 top-[6.5rem] z-[1000] w-[18.5rem] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl bg-white p-4 shadow-tarjeta lg:top-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-extrabold"><IconoCapas className="text-oax-700" /> Capas GIS Oaxaca</h2>
              <span className="rounded bg-oax-50 px-1.5 py-0.5 text-[9px] font-bold text-oax-700">V4.2 ACTIVO</span>
            </div>

            <form onSubmit={buscar} className="mt-3" role="search">
              <div className="campo">
                <input type="search" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setSinResultado(false) }} placeholder="Buscar localidad" aria-label="Buscar localidad o municipio" list="localidades" />
                <button type="submit" aria-label="Buscar" className="text-slate-500 hover:text-oax-700"><IconoBuscar /></button>
                <datalist id="localidades">{LOCALIDADES.map((l) => <option key={l.nombre} value={l.nombre} />)}</datalist>
              </div>
              {sinResultado && <p role="alert" className="mt-1.5 text-[11px] text-alerta">No encontramos esa localidad. Prueba con otra.</p>}
            </form>

            <h3 className="mt-4 text-[10px] font-semibold uppercase text-slate-500">Filtro de semáforo oficial</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SEMAFORO.map((s) => (
                <button key={s.id} type="button" onClick={() => alternar(niveles, setNiveles, s.id)} aria-pressed={niveles[s.id]}
                  className={`rounded-lg border p-2 text-left text-[11px] leading-tight transition ${niveles[s.id] ? s.fondo : 'border-slate-200 bg-white opacity-50'}`}>
                  <strong className="flex items-center gap-1.5" style={{ color: s.color }}><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.texto}</strong>
                  <span className="text-slate-500">{s.detalle}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase text-slate-500">Capas temáticas</h3>
              <button type="button" onClick={() => { setCapas({ huracan: true, sismos: true, cuencas: false, cortes: true, albergues: true, hospitales: false }); setNiveles({ critico: true, alto: true, medio: true, vigilancia: true }) }}
                className="text-[11px] font-bold text-oax-700 hover:underline">Restablecer</button>
            </div>
            <ul className="mt-2 flex flex-col gap-2">
              {CAPAS.map((c) => {
                const Icono = ICONO_CAPA[c.icono]
                return (
                  <li key={c.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
                    <Icono width={15} height={15} style={{ color: c.color }} className="shrink-0" />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-xs font-bold">{c.texto}</p>
                      <p className="truncate text-[10px] text-slate-500">{c.detalle}</p>
                    </div>
                    <Interruptor activo={capas[c.id]} onChange={() => alternar(capas, setCapas, c.id)} etiqueta={c.texto} />
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-[10px] text-slate-500">Actualización satelital continua</p>
          </aside>
        )}

        {/* Ficha del refugio seleccionado */}
        {refugio && (
          <section aria-label="Refugio temporal oficial" className="absolute bottom-3 right-3 z-[1000] w-80 max-w-[calc(100%-1.5rem)] overflow-hidden rounded-xl bg-white shadow-tarjeta">
            <header className="flex items-start justify-between gap-2 bg-oax-700 px-4 py-2.5 text-white">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase"><IconoCasa width={14} height={14} /> Refugio temporal oficial</p>
              <button type="button" onClick={() => setRefugio(null)} aria-label="Cerrar ficha"><IconoCerrar width={14} height={14} /></button>
            </header>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-extrabold leading-tight">{refugio.nombre}</h3>
                <span className="shrink-0 rounded bg-oax-100 px-2 py-0.5 text-[10px] font-bold text-oax-800">Habilitado</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{refugio.direccion}</p>

              {(() => {
                const libres = Math.round(((refugio.capacidad - refugio.ocupacion) / refugio.capacidad) * 100)
                return (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <p className="flex justify-between text-[11px]"><span className="font-semibold text-slate-600">Ocupación de camas:</span><strong>{refugio.ocupacion} / {refugio.capacidad} personas ({libres}% libre)</strong></p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-oax-600" style={{ width: `${100 - libres}%` }} /></div>
                  </div>
                )
              })()}

              <h4 className="mt-3 text-[10px] font-semibold uppercase text-slate-500">Servicios disponibles en instalación</h4>
              <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                {refugio.servicios.map((s) => <li key={s} className="flex items-center gap-1.5"><IconoCheck width={12} height={12} className="text-oax-700" />{s}</li>)}
              </ul>

              <a href={`https://www.google.com/maps/dir/?api=1&destination=${refugio.pos[0]},${refugio.pos[1]}`} target="_blank" rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-oax-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-oax-800">
                <IconoRuta /> Trazar ruta de evacuación segura
              </a>
            </div>
          </section>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 text-xs text-slate-600">
        <span className="flex items-center gap-2 font-bold text-slate-900"><span className="h-2 w-2 rounded-full bg-operativo" /> MONITOREO OPERATIVO ACTIVO 24/7</span>
        <span>Sincronizado con CENAPRED / SMN / SSN hace <strong>2 min</strong></span>
        <a href="tel:+529585870122" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700 sm:ml-auto">
          <IconoTelefono width={13} height={13} /> Línea Emergencias 911 / CEPCyGR: (958) 587 0122
        </a>
        {/* TODO: generar KML / PDF cuando exista el backend de capas */}
        <button type="button" disabled title="Disponible próximamente" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
          <IconoDescargar width={13} height={13} /> Descargar KML / PDF Offline
        </button>
      </div>
    </>
  )
}
