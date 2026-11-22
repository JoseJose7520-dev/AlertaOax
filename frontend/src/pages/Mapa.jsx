import { useEffect, useMemo, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRegionActiva } from '../hooks/useRegionActiva.js'
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
    html: `<span style="display:flex;width:40px;height:40px;align-items:center;justify-content:center;border-radius:12px;border:3px solid #fff;box-shadow:0 4px 12px rgba(11,17,32,.35);background:${activo ? 'linear-gradient(135deg,#2563EB,#0891B2)' : '#fff'};color:${activo ? '#fff' : '#2563EB'}"><svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M216 120v96h-56v-56a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v56H40v-96a8 8 0 0 1 2.34-5.66l80-80a8 8 0 0 1 11.32 0l80 80A8 8 0 0 1 216 120Z" opacity=".25"/><path d="M219.31 108.68l-80-80a16 16 0 0 0-22.62 0l-80 80A15.87 15.87 0 0 0 32 120v96a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-56h32v56a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-96a15.87 15.87 0 0 0-4.69-11.32ZM208 208h-48v-56a8 8 0 0 0-8-8h-48a8 8 0 0 0-8 8v56H48v-88l80-80 80 80Z"/></svg></span>`,
  })

/** Estado del albergue según lugares libres: siempre con texto, no solo color. */
function estadoAlbergue(a) {
  if (a.capacidad == null) return { texto: 'ALBERGUE ABIERTO', clases: 'bg-riesgo-bajo text-abisal', barra: 'bg-riesgo-bajo', borde: 'border-l-riesgo-bajo' }
  if (a.libres <= 0) return { texto: 'ALBERGUE LLENO', clases: 'bg-riesgo-critico text-white', barra: 'bg-riesgo-critico', borde: 'border-l-riesgo-critico' }
  if (a.libres / a.capacidad < 0.2) return { texto: 'CASI LLENO', clases: 'bg-riesgo-alto text-abisal', barra: 'bg-riesgo-alto', borde: 'border-l-riesgo-alto' }
  return { texto: 'ALBERGUE ABIERTO', clases: 'bg-riesgo-bajo text-abisal', barra: 'bg-riesgo-bajo', borde: 'border-l-riesgo-bajo' }
}

/** Tarjeta de albergue: estado, ocupación, distancia y «Cómo llegar». */
function TarjetaAlbergue({ a, activo, masCercano, mostrarRegion, onElegir }) {
  const e = estadoAlbergue(a)
  const sinCupo = a.capacidad == null // Protección Civil no publicó el cupo
  const ocupado = sinCupo ? 0 : Math.round((1 - Math.max(a.libres, 0) / a.capacidad) * 100)
  return (
    <article
      className={`tarjeta flex flex-col gap-3 border-l-4 p-4 transition ${e.borde} ${activo ? 'ring-2 ring-acento' : ''}`}
      aria-current={activo ? 'true' : undefined}
    >
      <button type="button" onClick={onElegir} className="flex items-start gap-3 text-left" aria-label={`Ver ${a.nombre} en el mapa`}>
        <span className="icono-caja size-11 shrink-0 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="casa" tam={24} peso={activo ? 'fill' : 'duotone'} /></span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md px-2 py-0.5 text-mini font-bold ${e.clases}`}>{e.texto}</span>
            {a.es_ejemplo && <span className="rounded-md bg-riesgo-medio-fondo px-2 py-0.5 text-mini font-bold text-riesgo-medio-texto">Dato de ejemplo</span>}
            {masCercano && <span className="rotulo text-ok-texto">El más cercano</span>}
          </span>
          <span className="text-subtitulo font-bold leading-snug">{a.nombre}</span>
          <span className="text-nota text-tenue">{a.direccion}{mostrarRegion ? ` · ${a.region}` : ''}</span>
        </span>
        {!sinCupo && (
          <span className="flex shrink-0 flex-col items-end">
            <span className={`text-pantalla font-bold ${a.libres > 0 ? 'text-ok-texto' : 'text-riesgo-critico-texto'}`}>{Math.max(a.libres, 0)}</span>
            <span className="rotulo text-tenue">libres</span>
          </span>
        )}
      </button>
      {sinCupo ? (
        <p className="text-nota text-tenue">Cupo no reportado por Protección Civil{a.km !== undefined && ` · a ${textoDistancia(a.km)}`}</p>
      ) : (
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between gap-2 text-nota">
          <span className="text-tenue">Ocupación {ocupado}%{a.km !== undefined && ` · a ${textoDistancia(a.km)}`}</span>
          <strong>{a.capacidad - Math.max(a.libres, 0)} / {a.capacidad}</strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-hundido" role="progressbar" aria-valuenow={ocupado} aria-valuemin={0} aria-valuemax={100} aria-label={`Ocupación de ${a.nombre}`}>
          <div className={`h-full rounded-full ${e.barra}`} style={{ width: `${ocupado}%` }} />
        </div>
      </div>
      )}
      <div className="flex flex-wrap gap-2">
        <a href={enlaceRuta(a)} target="_blank" rel="noreferrer" className={`${sinCupo || a.libres > 0 ? 'btn-principal' : 'btn-neutro'} min-h-11 flex-1 text-texto`}>
          <Icono nombre="navegar" tam={20} peso="fill" /> Cómo llegar
        </a>
        {a.telefono && (
          <a href={`tel:${a.telefono}`} className="btn-neutro min-h-11 text-texto" aria-label={`Llamar a ${a.nombre}`}><Icono nombre="telefono" tam={20} /></a>
        )}
      </div>
      {a.fuente && <p className="text-mini text-tenue">Fuente: {a.fuente}</p>}
      {!sinCupo && a.libres <= 0 && <p className="text-nota font-semibold text-riesgo-critico-texto">Sin lugares: busca otro albergue cercano.</p>}
    </article>
  )
}

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
        <span className="flex size-4.5 items-center justify-center rounded bg-acento text-white" aria-hidden="true"><Icono nombre="casa" tam={12} peso="fill" /></span>
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
      className={`chip min-h-11 shrink-0 text-texto ${activo ? 'chip-activo' : ''}`}
    >
      <Icono nombre={icono} tam={20} peso={activo ? 'fill' : 'duotone'} /> {children}
    </button>
  )
}

export default function Mapa() {
  const { region } = useRegionActiva()
  // /mapa?cerca=1 (desde "Ir al albergue más cercano"): pide la ubicación de inmediato
  const [params] = useSearchParams()
  const cerca = params.get('cerca') === '1'
  const [todoOaxaca, setTodoOaxaca] = useState(false)
  const [verZonas, setVerZonas] = useState(true)
  const [verAlbergues, setVerAlbergues] = useState(true)
  const [ubicacion, setUbicacion] = useState(null)
  const [errorUbicacion, setErrorUbicacion] = useState('')
  const [seleccion, setSeleccion] = useState(null)

  const filtro = todoOaxaca ? 'todas' : encodeURIComponent(region ?? 'todas')
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
    if (seleccion && elegido) return { centro: [elegido.latitud, elegido.longitud], zoom: 14 }
    if (todoOaxaca) return { centro: CENTRO_OAXACA, zoom: 7 }
    return { centro: CENTRO_REGION[region] ?? CENTRO_OAXACA, zoom: 9 }
  }, [ubicacion, lista, todoOaxaca, region, seleccion, elegido])

  async function usarMiUbicacion() {
    setErrorUbicacion('')
    try {
      setUbicacion(await obtenerUbicacion())
      setSeleccion(null)
    } catch (err) {
      setErrorUbicacion(err.message)
    }
  }

  // Al cambiar de región en el encabezado, se quita la selección anterior
  useEffect(() => { setSeleccion(null) }, [region])

  useEffect(() => {
    if (cerca) usarMiUbicacion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cerca])

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="rotulo text-tenue">Mapa de {todoOaxaca ? 'Oaxaca' : region}</p>
        <h1 className="text-titular font-bold">Mapa de riesgos y albergues</h1>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        <Chip activo={verZonas} onClick={() => setVerZonas((v) => !v)} icono="alerta">Zonas de riesgo</Chip>
        <Chip activo={verAlbergues} onClick={() => setVerAlbergues((v) => !v)} icono="casa">Albergues</Chip>
        <Chip activo={todoOaxaca} onClick={() => { setTodoOaxaca((v) => !v); setSeleccion(null) }} icono="mapa">Todo Oaxaca</Chip>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex flex-col gap-3 lg:sticky lg:top-28">
        <div className="relative -mx-4 h-[52dvh] min-h-80 overflow-hidden border-y border-linea shadow-tarjeta sm:mx-0 sm:rounded-3xl sm:border lg:h-[calc(100dvh-14rem)] lg:min-h-[28rem]">
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
                pathOptions={{ color: '#fff', weight: 4, fillColor: '#2563EB', fillOpacity: 1 }}>
                <Tooltip permanent direction="top">Tú</Tooltip>
              </CircleMarker>
            )}
          </MapContainer>
          <button type="button" onClick={usarMiUbicacion} className="btn-principal absolute bottom-3 left-3 z-[500] min-h-12 text-texto sm:right-3 sm:left-auto">
            <Icono nombre="navegar" tam={20} peso="fill" /> Mi ubicación
          </button>
        </div>
          {verZonas && <Leyenda />}
          <Aviso tipo="error">{errorUbicacion}</Aviso>
        </div>

        <section className="flex flex-col gap-2.5" aria-label="Albergues">
          <div className="flex items-baseline justify-between">
            <h2 className="text-subtitulo font-bold">{ubicacion ? 'Albergues por cercanía' : 'Albergues'}</h2>
            <span className="rotulo text-tenue">{lista.length} abiertos</span>
          </div>
          {(albergues.cargando || zonas.cargando) && <Cargando texto="Cargando el mapa…" />}
          <Aviso tipo="error">{albergues.error || zonas.error}</Aviso>
          {verAlbergues && lista.map((a) => (
            <TarjetaAlbergue key={a.id} a={a} activo={elegido?.id === a.id} masCercano={a.km !== undefined && lista[0]?.id === a.id}
              mostrarRegion={todoOaxaca} onElegir={() => setSeleccion(a.id)} />
          ))}
          {!verAlbergues && <p className="tarjeta p-4 text-tenue">Activa la capa «Albergues» para ver la lista.</p>}
          {!albergues.cargando && lista.length === 0 && (
            <p className="tarjeta p-4 text-tenue">No hay albergues registrados {todoOaxaca ? 'en Oaxaca' : `en ${region}`} todavía.</p>
          )}
        </section>
      </div>
    </div>
  )
}
