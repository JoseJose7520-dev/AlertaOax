import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../hooks/useApi.js'
import { NIVELES, TIPOS_ALERTA, fechaCorta } from '../utils/catalogos.js'
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
    <article className="-mx-5 flex flex-col">
      <div className="flex items-center gap-2 px-3 pb-2">
        <button type="button" onClick={() => navegar(-1)} className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-crema" aria-label="Volver">
          <Icono nombre="atras" />
        </button>
        <span className="font-bold">Alerta</span>
      </div>

      <p className={`flex items-center gap-2.5 px-5 py-3 text-texto font-bold tracking-wide text-white ${n.clases.solido}`}>
        <Icono nombre="alerta" tam={22} grosor={2.2} /> {n.color} · {n.nombre.toUpperCase()}
        {!a.vigente && <span className="ml-auto rounded-full bg-white/25 px-2 py-0.5 text-nota">TERMINÓ</span>}
      </p>

      <div className="flex flex-col gap-5 px-5 py-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-titular leading-tight font-bold">{a.titulo}</h1>
          <p className="text-tenue">{TIPOS_ALERTA[a.tipo]} · Región {a.region}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2.5">
          <div className="tarjeta p-3">
            <dt className="text-nota text-tenue">{a.vigente ? 'Vigente hasta' : 'Terminó'}</dt>
            <dd className="font-bold">{fechaCorta(a.vigente_hasta)}</dd>
          </div>
          <div className="tarjeta p-3">
            <dt className="text-nota text-tenue">Publicó</dt>
            <dd className="font-bold">{a.institucion}</dd>
          </div>
        </dl>

        <section className="flex flex-col gap-2">
          <h2 className="text-subtitulo font-bold">Indicaciones de la autoridad</h2>
          <p className="leading-relaxed whitespace-pre-line text-barro-suave">{a.descripcion}</p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-subtitulo font-bold">Qué hacer ahora</h2>
          <ol className="flex flex-col gap-2.5">
            {pasos.map(([fuerte, resto], i) => (
              <li key={fuerte} className="flex items-start gap-3">
                <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-anil text-texto font-bold text-white">{i + 1}</span>
                <span className="leading-snug"><strong>{fuerte}</strong> {resto}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex flex-col gap-2">
          <Link to="/mapa?cerca=1" className="btn-principal">
            <Icono nombre="navegar" tam={20} grosor={2.2} /> Ir al albergue más cercano
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/preparate" className="btn-neutro">Ver mi mochila</Link>
            <button type="button" onClick={compartir} className="btn-neutro">Compartir</button>
          </div>
          {copiado && <Aviso tipo="exito">Copiado. Pégalo en WhatsApp para avisar a tu familia.</Aviso>}
        </div>
      </div>
    </article>
  )
}
