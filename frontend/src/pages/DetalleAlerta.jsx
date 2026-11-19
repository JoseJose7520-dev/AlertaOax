import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { ICONO_TIPO, NIVELES, TIPOS_ALERTA, fechaCorta } from '../utils/catalogos.js'
import { EscalaNivel } from '../components/TarjetaAlerta.jsx'
import { QUE_HACER } from '../utils/indicaciones.js'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'

export default function DetalleAlerta() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { datos, cargando, error } = useApi(`/alerts/${id}`)
  const [copiado, setCopiado] = useState(false)

  if (cargando) return <Cargando />
  if (error) return <Aviso tipo="error">{error}</Aviso>

  const a = datos.alerta
  const n = NIVELES[a.nivel] ?? NIVELES.vigilancia
  const pasos = QUE_HACER[a.tipo] ?? QUE_HACER.otro

  async function compartir() {
    const texto = `${n.texto}: ${a.titulo}. ${a.descripcion} (AlertaOax)`
    try {
      if (navigator.share) await navigator.share({ title: a.titulo, text: texto })
      else {
        await navigator.clipboard.writeText(texto)
        setCopiado(true)
      }
    } catch { /* el usuario canceló */ }
  }

  return (
    <article className="flex flex-col gap-4">
      <button type="button" onClick={() => navegar(-1)} className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-xl pr-3 font-semibold text-tinta-suave hover:text-tinta" aria-label="Volver">
        <Icono nombre="regresar" tam={20} peso="bold" /> Volver
      </button>

      <div className="tarjeta overflow-hidden">
      <p className={`flex items-center gap-2.5 px-5 py-3 text-texto font-bold ${n.clases.solido} ${n.clases.sobre}`}>
        <Icono nombre={a.nivel === 'critico' ? 'critico' : 'alerta'} tam={22} peso="fill" /> Alerta {n.color}: {n.nombre.toLowerCase()}
        {!a.vigente && <span className="ml-auto rounded-full bg-black/20 px-2 py-0.5 text-nota">Terminó</span>}
      </p>

      <div className="topografia flex flex-col gap-5 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <span className={`icono-caja size-14 ${n.clases.fondo} ${n.clases.texto}`}><Icono nombre={ICONO_TIPO[a.tipo]} tam={32} /></span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-titular font-bold">{a.titulo}</h1>
            <p className="text-tenue">{TIPOS_ALERTA[a.tipo]} · Región {a.region}</p>
          </div>
        </div>
        <EscalaNivel nivel={a.nivel} />

        <dl className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-hundido p-3">
            <dt className="rotulo text-tenue">{a.vigente ? 'Vigente hasta' : 'Terminó'}</dt>
            <dd className="font-bold">{fechaCorta(a.vigente_hasta)}</dd>
          </div>
          <div className="rounded-xl bg-hundido p-3">
            <dt className="rotulo text-tenue">Publicó</dt>
            <dd className="flex items-center gap-1 font-bold"><Icono nombre="escudo" tam={16} peso="fill" className="text-ok-texto" /> {a.institucion}</dd>
          </div>
        </dl>

        <section className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-subtitulo font-bold"><Icono nombre="megafono" tam={22} className="text-acento dark:text-acento-fuerte" /> Indicaciones de la autoridad</h2>
          <p className="leading-relaxed whitespace-pre-line text-tinta-suave">{a.descripcion}</p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="flex items-center gap-2 text-subtitulo font-bold"><Icono nombre="objetivo" tam={22} className="text-acento dark:text-acento-fuerte" /> Qué hacer ahora</h2>
          <ol className="flex flex-col gap-2.5">
            {pasos.map(([fuerte, resto], i) => (
              <li key={fuerte} className="flex items-start gap-3 rounded-xl border border-linea bg-superficie p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-acento text-texto font-bold text-white">{i + 1}</span>
                <span className="leading-snug"><strong>{fuerte}</strong> {resto}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-2">
          <Link to="/mapa?cerca=1" className="btn-principal">
            <Icono nombre="navegar" tam={20} peso="fill" /> Ir al albergue más cercano
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/preparate" className="btn-neutro"><Icono nombre="mochila" tam={20} /> Ver mi mochila</Link>
            <button type="button" onClick={compartir} className="btn-neutro"><Icono nombre="compartir" tam={20} /> Compartir</button>
          </div>
          {copiado && <Aviso tipo="exito">Copiado. Pégalo en WhatsApp para avisar a tu familia.</Aviso>}
        </div>
      </div>
      </div>
    </article>
  )
}
