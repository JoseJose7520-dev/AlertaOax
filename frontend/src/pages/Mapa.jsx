import { useEffect, useMemo, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { NIVELES, ORDEN_NIVELES, TIPOS_ALERTA } from '../utils/catalogos.js'
import { CENTRO_OAXACA, CENTRO_REGION, distanciaKm, enlaceRuta, obtenerUbicacion, textoDistancia } from '../utils/geo.js'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'

// Ícono de albergue (casita) con el color de la marca; resaltado cuando está seleccionado.
const iconoAlbergue = (activo) =>
  L.divIcon({
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<span style="display:flex;width:40px;height:40px;align-items:center;justify-content:center;border-radius:12px;border:3px solid #fff;box-shadow:0 2px 6px rgba(31,27,22,.3);background:${activo ? '#3B3486' : '#fff'};color:${activo ? '#fff' : '#3B3486'}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7v9H3z"/></svg></span>`,
  })

function MoverMapa({ centro, zoom, limites }) {
  const mapa = useMap()
  useEffect(() => {
    if (limites) mapa.fitBounds(limites, { padding: [48, 48], maxZoom: 15 })
    else mapa.setView(centro, zoom)
  }, [mapa, centro, zoom, limites])
  return null
}

/** Leyenda fija: el nivel de cada zona se explica con texto, no solo con color. */
function Leyenda() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-nota" aria-label="Leyenda del mapa">
      {[...ORDEN_NIVELES].reverse().map((clave) => (
        <li key={clave} className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-full border-2 border-dashed" style={{ borderColor: NIVELES[clave].hex, background: `${NIVELES[clave].hex}33` }} aria-hidden="true" />
          Riesgo {NIVELES[clave].nombre.toLowerCase()}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="flex size-4 items-center justify-center rounded bg-anil text-white" aria-hidden="true"><Icono nombre="casa" tam={11} grosor={3} /></span>
        Albergue
      </li>
    </ul>
  )
}

function Chip({ activo, onClick, icono, children }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-texto ${
        activo ? 'border-anil bg-anil font-bold text-white' : 'border-borde bg-white text-barro'
      }`}
    >
      <Icono nombre={icono} tam={16} grosor={2.4} /> {children}
    </button>
  )
}

export default function Mapa() {
  const { usuario } = useAuth()
  // /mapa?cerca=1 (desde "Ir al albergue más cercano"): pide la ubicación de inmediato
  const [params] = useSearchParams()
  const cerca = params.get('cerca') === '1'
  const [todoOaxaca, setTodoOaxaca] = useState(false)
  const [verZonas, setVerZonas] = useState(true)
  const [verAlbergues, setVerAlbergues] = useState(true)
  const [ubicacion, setUbicacion] = useState(null)
  const [errorUbicacion, setErrorUbicacion] = useState('')
  const [seleccion, setSeleccion] = useState(null)

  const filtro = todoOaxaca ? 'todas' : encodeURIComponent(usuario.region ?? 'todas')
  const albergues = useApi(`/shelters?region=${filtro}`)
  const zonas = useApi(`/risk-zones?region=${filtro}`)

  // Albergues ordenados por cercanía si conocemos la ubicación
  const lista = useMemo(() => {
    const base = albergues.datos?.albergues ?? []
    if (!ubicacion) return base
    return base
      .map((a) => ({ ...a, km: distanciaKm(ubicacion, a) }))
      .sort((x, y) => x.km - y.km)
  }, [albergues.datos, ubicacion])

  const elegido = lista.find((a) => a.id === seleccion) ?? lista[0] ?? null

  const vista = useMemo(() => {
    // Con ubicación: encuadra a la persona y al albergue más cercano
    if (ubicacion && lista[0]) {
      return { limites: [[ubicacion.latitud, ubicacion.longitud], [lista[0].latitud, lista[0].longitud]] }
    }
    if (ubicacion) return { centro: [ubicacion.latitud, ubicacion.longitud], zoom: 13 }
    if (todoOaxaca) return { centro: CENTRO_OAXACA, zoom: 7 }
    return { centro: CENTRO_REGION[usuario.region] ?? CENTRO_OAXACA, zoom: 9 }
  }, [ubicacion, lista, todoOaxaca, usuario.region])

  async function usarMiUbicacion() {
    setErrorUbicacion('')
    try {
      setUbicacion(await obtenerUbicacion())
      setSeleccion(null)
    } catch (err) {
      setErrorUbicacion(err.message)
    }
  }

  useEffect(() => {
    if (cerca) usarMiUbicacion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cerca])

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-pantalla font-bold">Mapa de riesgos y albergues</h1>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        <Chip activo={verZonas} onClick={() => setVerZonas((v) => !v)} icono="alerta">Zonas de riesgo</Chip>
        <Chip activo={verAlbergues} onClick={() => setVerAlbergues((v) => !v)} icono="casa">Albergues</Chip>
        <Chip activo={todoOaxaca} onClick={() => { setTodoOaxaca((v) => !v); setSeleccion(null) }} icono="mapa">Todo Oaxaca</Chip>
      </div>

      <div className="relative -mx-5 h-[52dvh] min-h-80 overflow-hidden border-y border-arena sm:mx-0 sm:rounded-2xl sm:border">
        <MapContainer center={vista.centro ?? CENTRO_OAXACA} zoom={vista.zoom ?? 9} className="h-full w-full" scrollWheelZoom={false}>
          <MoverMapa centro={vista.centro} zoom={vista.zoom} limites={vista.limites} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {verZonas && zonas.datos?.zonas.map((z) => {
            const n = NIVELES[z.nivel] ?? NIVELES.vigilancia
            return (
              <Circle key={z.id} center={[z.latitud, z.longitud]} radius={z.radio_m}
                pathOptions={{ color: n.hex, fillColor: n.hex, fillOpacity: 0.2, weight: 2, dashArray: '6 4' }}>
                <Popup>
                  <strong>{z.nombre}</strong><br />{TIPOS_ALERTA[z.tipo]} · Riesgo {n.nombre.toLowerCase()}
                </Popup>
              </Circle>
            )
          })}
          {verAlbergues && lista.map((a) => (
            <Marker key={a.id} position={[a.latitud, a.longitud]} icon={iconoAlbergue(elegido?.id === a.id)}
              eventHandlers={{ click: () => setSeleccion(a.id) }} title={a.nombre} alt={`Albergue ${a.nombre}`} />
          ))}
          {ubicacion && (
            <CircleMarker center={[ubicacion.latitud, ubicacion.longitud]} radius={9}
              pathOptions={{ color: '#fff', weight: 4, fillColor: '#3B3486', fillOpacity: 1 }}>
              <Tooltip permanent direction="top">Tú</Tooltip>
            </CircleMarker>
          )}
        </MapContainer>
        <button type="button" onClick={usarMiUbicacion} className="btn-neutro absolute right-3 bottom-3 z-[500] shadow-md">
          <Icono nombre="navegar" tam={18} /> Mi ubicación
        </button>
      </div>

      {verZonas && <Leyenda />}
      <Aviso tipo="error">{errorUbicacion}</Aviso>
      {(albergues.cargando || zonas.cargando) && <Cargando texto="Cargando el mapa…" />}
      <Aviso tipo="error">{albergues.error || zonas.error}</Aviso>

      {elegido && (
        <section className="tarjeta flex flex-col gap-2.5 p-4" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-nota font-bold text-riesgo-bajo">ALBERGUE ABIERTO{elegido.km !== undefined && lista[0]?.id === elegido.id ? ' · EL MÁS CERCANO' : ''}</span>
              <h2 className="text-subtitulo font-bold">{elegido.nombre}</h2>
              <span className="text-nota text-tenue">{elegido.direccion}</span>
            </div>
            {elegido.km !== undefined && <span className="shrink-0 font-bold">{textoDistancia(elegido.km)}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-nota">
              <span className="text-tenue">Lugares libres</span>
              <strong>{elegido.libres} de {elegido.capacidad}</strong>
            </div>
            <div className="h-2 overflow-hidden rounded bg-crema" aria-hidden="true">
              <div
                className={`h-full ${elegido.libres / elegido.capacidad < 0.3 ? 'bg-riesgo-alto' : 'bg-riesgo-bajo'}`}
                style={{ width: `${Math.round((elegido.libres / elegido.capacidad) * 100)}%` }}
              />
            </div>
          </div>
          <a href={enlaceRuta(elegido)} target="_blank" rel="noreferrer" className="btn-principal">
            <Icono nombre="navegar" tam={20} grosor={2.2} /> Cómo llegar
          </a>
        </section>
      )}

      {lista.length > 1 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-subtitulo font-bold">{ubicacion ? 'Albergues por cercanía' : 'Albergues'}</h2>
          <ul className="flex flex-col gap-2">
            {lista.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSeleccion(a.id)}
                  aria-pressed={elegido?.id === a.id}
                  className={`tarjeta flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left ${elegido?.id === a.id ? 'border-anil bg-anil-suave' : ''}`}
                >
                  <Icono nombre="casa" className="text-anil" />
                  <span className="flex flex-1 flex-col">
                    <span className="font-bold">{a.nombre}</span>
                    <span className="text-nota text-tenue">{a.libres} lugares libres{todoOaxaca ? ` · ${a.region}` : ''}</span>
                  </span>
                  {a.km !== undefined && <span className="text-nota font-bold">{textoDistancia(a.km)}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!albergues.cargando && lista.length === 0 && (
        <p className="text-tenue">No hay albergues registrados {todoOaxaca ? 'en Oaxaca' : `en ${usuario.region}`} todavía.</p>
      )}
    </div>
  )
}
