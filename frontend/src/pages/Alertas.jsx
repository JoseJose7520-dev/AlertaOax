import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ALERTAS, NIVELES, SINCRONIZACION, TELEFONOS, TIPOS } from '../data/alertas.js'
import InsigniaNivel from '../components/ui/InsigniaNivel.jsx'
import MiniMapaRiesgo from '../components/MiniMapaRiesgo.jsx'
import {
  IconoAlerta, IconoBrujula, IconoCheck, IconoCompartir, IconoEscudoSimple, IconoFlecha, IconoGota,
  IconoMapa, IconoPin, IconoRayo, IconoRefrescar, IconoReloj, IconoTelefono, IconoCasa,
} from '../components/Iconos.jsx'

const ICONO_TIPO = { sismo: IconoRayo, huracan: IconoAlerta, inundacion: IconoGota, deslizamiento: IconoPin }
const destacada = ALERTAS.find((a) => a.destacada)
const lista = ALERTAS.filter((a) => !a.destacada)

export default function Alertas() {
  const [tipo, setTipo] = useState('todos')
  const [copiado, setCopiado] = useState(false)

  const visibles = tipo === 'todos' ? lista : lista.filter((a) => a.tipo === tipo)
  const cuenta = (t) => lista.filter((a) => a.tipo === t).length

  async function compartir() {
    const url = `${window.location.origin}/alertas/${destacada.id}`
    try {
      if (navigator.share) await navigator.share({ title: destacada.titulo, url })
      else {
        await navigator.clipboard.writeText(url)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2500)
      }
    } catch { /* el usuario canceló */ }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-600">
        <span className="flex items-center gap-2 font-bold text-red-700"><span className="h-2 w-2 rounded-full bg-red-600" /> MONITOREO ESTATAL ACTIVO</span>
        <span>Red Sísmica y Meteorológica del Estado de Oaxaca</span>
        <span className="flex items-center gap-1.5 sm:ml-auto"><IconoRefrescar width={12} height={12} /> Sincronización: <strong className="text-slate-900">{SINCRONIZACION}</strong></span>
        <span className="flex items-center gap-1.5"><IconoEscudoSimple width={12} height={12} /> Protocolo SHA-256 Verificado</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Columna principal */}
        <div className="flex flex-col gap-8">
          <article className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
            <div className="bg-red-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-red-700 px-2.5 py-1 text-[11px] font-bold uppercase text-white">
                  <IconoAlerta width={12} height={12} /> Nivel crítico: rojo
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-700">
                  <IconoReloj width={12} height={12} /> Vigencia: <strong>{destacada.vigencia}</strong> ({destacada.proximaAct})
                </span>
              </div>
              <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight lg:text-[1.7rem]">{destacada.titulo}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                <IconoEscudoSimple width={13} height={13} className="text-oax-700" />
                Emitido por: <strong className="text-slate-900">{destacada.emisora}</strong>
              </p>
            </div>

            <div className="p-5">
              <p className="text-sm leading-relaxed text-slate-700">{destacada.resumen}</p>

              <dl className="mt-4 grid gap-3 rounded-xl bg-slate-100 p-3 text-xs sm:grid-cols-3">
                <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Región afectada</dt><dd className="mt-1 flex items-center gap-1.5 font-bold"><IconoPin width={13} height={13} className="text-red-600" />{destacada.region}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Precipitación estimada</dt><dd className="mt-1 flex items-center gap-1.5 font-bold"><IconoGota width={13} height={13} className="text-oax-600" />{destacada.precipitacion}</dd></div>
                <div><dt className="text-[10px] font-semibold uppercase text-slate-500">Refugios habilitados</dt><dd className="mt-1 flex items-center gap-1.5 font-bold"><IconoCasa width={13} height={13} className="text-oax-600" />{destacada.refugios}</dd></div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link to={`/alertas/${destacada.id}`} className="inline-flex items-center gap-2 rounded-lg bg-oax-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-oax-700">
                  <IconoEscudoSimple /> Ver protocolo de emergencia
                </Link>
                <button type="button" onClick={compartir} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  <IconoCompartir /> Compartir aviso oficial
                </button>
                {copiado && <span role="status" className="flex items-center gap-1 text-xs font-semibold text-operativo"><IconoCheck width={13} height={13} /> Enlace copiado</span>}
              </div>
            </div>
          </article>

          <section aria-labelledby="titulo-activas">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 id="titulo-activas" className="text-lg font-extrabold">Alertas activas en el Estado de Oaxaca</h2>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">{lista.length}</span>
              <span className="text-[11px] text-slate-500">Filtro regionalizado al instante</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de alerta">
              <button type="button" onClick={() => setTipo('todos')} aria-pressed={tipo === 'todos'}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tipo === 'todos' ? 'bg-oax-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Todos <span className="ml-1 opacity-70">{lista.length}</span>
              </button>
              {TIPOS.map((t) => {
                const Icono = ICONO_TIPO[t.id]
                const n = cuenta(t.id)
                return (
                  <button key={t.id} type="button" disabled={n === 0} onClick={() => setTipo(t.id)} aria-pressed={tipo === t.id}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${tipo === t.id ? 'bg-oax-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    <Icono width={13} height={13} /> {t.texto} <span className="opacity-70">{n}</span>
                  </button>
                )
              })}
            </div>

            <ul className="mt-4 flex flex-col gap-4">
              {visibles.map((a) => (
                <li key={a.id} className="tarjeta p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <InsigniaNivel nivel={a.nivel} />
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><IconoReloj width={12} height={12} /> {a.tiempo}</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold">{a.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.resumen}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500">Emisora: <strong className="text-slate-700">{a.emisora}</strong></span>
                    <Link to={`/alertas/${a.id}`} className="inline-flex items-center gap-1 font-bold text-oax-700 hover:underline">Ver detalles <IconoFlecha width={13} height={13} /></Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Columna lateral */}
        <aside className="flex flex-col gap-6">
          <section className="tarjeta p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-extrabold leading-tight"><IconoMapa className="text-oax-700" /> Mapa de Riesgo Estatal en Tiempo Real</h2>
              <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">● EN VIVO</span>
            </div>
            <div className="mt-4"><MiniMapaRiesgo /></div>

            <h3 className="mt-4 text-[10px] font-semibold uppercase text-slate-500">Semáforo oficial de Protección Civil</h3>
            <ul className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
              {[['critico', 'Rojo', 'Riesgo máximo'], ['alto', 'Naranja', 'Riesgo alto'], ['medio', 'Amarillo', 'Alerta media']].map(([n, t, d]) => (
                <li key={n} className="rounded-lg border border-slate-200 p-2">
                  <strong className="flex items-center gap-1" style={{ color: NIVELES[n].color }}><span className="h-2 w-2 rounded-full" style={{ background: NIVELES[n].color }} />{t}</strong>
                  <span className="text-slate-500">{d}</span>
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-[10px] font-semibold uppercase text-slate-500">Capas geoespaciales activas</h3>
            <ul className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <li className="flex items-center gap-1.5 rounded-lg bg-oax-50 px-2.5 py-1.5 font-semibold text-oax-800"><IconoCheck width={12} height={12} /> Zonas de evacuación</li>
              <li className="flex items-center gap-1.5 rounded-lg bg-oax-50 px-2.5 py-1.5 font-semibold text-oax-800"><IconoCheck width={12} height={12} /> Albergues (14)</li>
              <li className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-500">Hospitales</li>
            </ul>

            <Link to="/mapa" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-oax-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-oax-700">
              <IconoBrujula /> Abrir mapa completo interactivo
            </Link>
          </section>

          <section className="tarjeta p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-extrabold leading-tight"><IconoTelefono className="text-red-600" /> Teléfonos de Emergencia Oficiales</h2>
              <span className="text-[10px] font-bold text-slate-500">24 HORAS</span>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {TELEFONOS.map((t) => (
                <li key={t.tel} className={`flex items-center gap-3 rounded-xl p-3 ${t.principal ? 'bg-red-50' : 'bg-slate-50'}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${t.principal ? 'bg-red-600' : 'bg-oax-700'}`}><IconoTelefono width={14} height={14} /></span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="text-sm font-extrabold">{t.numero}</p>
                    <p className="truncate text-[11px] text-slate-500">{t.nombre}</p>
                  </div>
                  <a href={`tel:${t.tel}`} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${t.principal ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
                    <IconoTelefono width={12} height={12} /> Llamar
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-[11px] leading-relaxed text-slate-600">
              <IconoCheck width={14} height={14} className="mt-0.5 shrink-0 text-oax-700" />
              No difundas rumores en redes sociales. Todas las instrucciones válidas son autenticadas por el Centro de Mando Estatal C4 Oaxaca.
            </p>
          </section>
        </aside>
      </div>
    </>
  )
}
