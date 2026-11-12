import { Link } from 'react-router-dom'
import { NIVELES, TIPOS_ALERTA, fechaCorta, haceCuanto } from '../utils/catalogos.js'
import Icono from './Icono.jsx'
import InsigniaNivel from './InsigniaNivel.jsx'

/** Alerta destacada de la región del usuario: grande, con acciones claras. */
export function AlertaDestacada({ alerta }) {
  const n = NIVELES[alerta.nivel] ?? NIVELES.vigilancia
  return (
    <section className={`flex flex-col gap-3 rounded-[20px] border-2 p-4.5 ${n.clases.fondo} ${n.clases.borde}`} aria-labelledby={`alerta-${alerta.id}`}>
      <p className={`flex items-center gap-2 text-nota font-bold tracking-wide ${n.clases.texto}`}>
        <Icono nombre="alerta" tam={20} grosor={2.2} /> {n.texto}
      </p>
      <h1 id={`alerta-${alerta.id}`} className="text-titular leading-tight font-bold">{alerta.titulo}</h1>
      <p className="line-clamp-3 leading-relaxed text-barro-suave">{alerta.descripcion}</p>
      <p className="text-nota text-tenue">
        {TIPOS_ALERTA[alerta.tipo]} · Vigente hasta {fechaCorta(alerta.vigente_hasta)} · {alerta.institucion}
      </p>
      <Link to={`/alertas/${alerta.id}`} className="btn-principal">
        Qué hacer ahora <Icono nombre="flecha" tam={20} grosor={2.4} />
      </Link>
      <Link to="/mapa?cerca=1" className="btn-secundario">Ver albergues cerca de ti</Link>
    </section>
  )
}

/** Alerta en lista (otras regiones o historial). */
export function AlertaCompacta({ alerta }) {
  return (
    <Link
      to={`/alertas/${alerta.id}`}
      className="tarjeta flex flex-col gap-1.5 px-4 py-3.5 text-barro no-underline hover:border-borde"
    >
      <InsigniaNivel nivel={alerta.nivel} className="self-start" />
      <span className="font-bold">{alerta.titulo}</span>
      <span className="text-nota text-tenue">{alerta.region} · {haceCuanto(alerta.emitida_en)}</span>
    </Link>
  )
}
