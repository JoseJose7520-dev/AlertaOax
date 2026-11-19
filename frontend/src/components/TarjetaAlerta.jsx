import { Link } from 'react-router-dom'
import { ICONO_TIPO, NIVELES, TIPOS_ALERTA, fechaCorta, haceCuanto } from '../utils/catalogos.js'
import Icono from './Icono.jsx'
import InsigniaNivel from './InsigniaNivel.jsx'

/** Escalera de niveles (vigilancia → crítico) con el nivel actual resaltado. */
export function EscalaNivel({ nivel }) {
  const orden = ['vigilancia', 'medio', 'alto', 'critico']
  const i = orden.indexOf(nivel)
  return (
    <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
      {orden.map((n, k) => (
        <span key={n} className={`self-center rounded-full ${k <= i ? NIVELES[n].clases.solido : 'bg-linea'} ${k === i ? 'h-2.5' : 'h-1.5'}`} />
      ))}
    </div>
  )
}

/** Alerta de la región del usuario: tarjeta de alto impacto con el color del nivel. */
export function AlertaDestacada({ alerta }) {
  const n = NIVELES[alerta.nivel] ?? NIVELES.vigilancia
  const critica = alerta.nivel === 'critico'
  return (
    <section
      className={`topografia relative flex flex-col gap-4 overflow-hidden rounded-3xl border-2 bg-superficie p-5 shadow-tarjeta sm:p-6 ${n.clases.borde} ${critica ? 'halo-critico' : ''}`}
      aria-labelledby={`alerta-${alerta.id}`}
    >
      <span className={`absolute inset-x-0 top-0 h-2 ${n.clases.solido}`} aria-hidden="true" />
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className={`flex items-center gap-2 rounded-full px-3 py-1 text-nota font-bold ${n.clases.fondo} ${n.clases.texto}`}>
          <Icono nombre={critica ? 'critico' : 'alerta'} tam={18} peso="fill" /> {n.texto}
        </p>
        <span className="rotulo text-tenue">{haceCuanto(alerta.emitida_en)}</span>
      </div>
      <div className="flex items-start gap-4">
        <span className={`icono-caja size-14 ${n.clases.fondo} ${n.clases.texto}`}><Icono nombre={ICONO_TIPO[alerta.tipo]} tam={32} /></span>
        <div className="min-w-0">
          <h1 id={`alerta-${alerta.id}`} className="text-titular font-bold">{alerta.titulo}</h1>
          <p className="mt-1 text-nota font-semibold text-tenue">{TIPOS_ALERTA[alerta.tipo]} · Región {alerta.region}</p>
        </div>
      </div>
      <p className="line-clamp-3 leading-relaxed text-tinta-suave">{alerta.descripcion}</p>
      <EscalaNivel nivel={alerta.nivel} />
      <dl className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-hundido px-3 py-2.5">
          <dt className="rotulo text-tenue">Vigente hasta</dt>
          <dd className="font-semibold">{fechaCorta(alerta.vigente_hasta)}</dd>
        </div>
        <div className="rounded-xl bg-hundido px-3 py-2.5">
          <dt className="rotulo text-tenue">Emite</dt>
          <dd className="flex items-center gap-1 font-semibold"><Icono nombre="escudo" tam={16} peso="fill" className="text-ok-texto" /><span className="truncate">{alerta.institucion}</span></dd>
        </div>
      </dl>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Link to={`/alertas/${alerta.id}`} className="btn-principal">
          Qué hacer ahora <Icono nombre="flecha" tam={20} peso="bold" />
        </Link>
        <Link to="/mapa?cerca=1" className="btn-secundario min-h-13"><Icono nombre="casa" tam={20} /> Ver albergues cerca de ti</Link>
      </div>
    </section>
  )
}

/** Alerta en lista (otras regiones o historial). */
export function AlertaCompacta({ alerta }) {
  const n = NIVELES[alerta.nivel] ?? NIVELES.vigilancia
  return (
    <Link
      to={`/alertas/${alerta.id}`}
      className="tarjeta group relative flex items-center gap-3.5 overflow-hidden py-3.5 pr-4 pl-5 text-tinta no-underline transition hover:border-borde"
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${n.clases.solido}`} aria-hidden="true" />
      <span className={`icono-caja size-11 ${n.clases.fondo} ${n.clases.texto}`}><Icono nombre={ICONO_TIPO[alerta.tipo]} tam={24} /></span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <InsigniaNivel nivel={alerta.nivel} className="self-start" />
        <span className="font-semibold">{alerta.titulo}</span>
        <span className="text-nota text-tenue">{alerta.region} · {haceCuanto(alerta.emitida_en)}</span>
      </span>
      <Icono nombre="derecha" tam={20} className="text-tenue transition group-hover:translate-x-0.5" />
    </Link>
  )
}
