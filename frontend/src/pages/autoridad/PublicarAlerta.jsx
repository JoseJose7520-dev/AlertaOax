import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../services/api.js'
import { NIVELES, ORDEN_NIVELES, REGIONES, TIPOS_ALERTA, fechaCorta } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Confirmar from '../../components/Confirmar.jsx'
import Icono from '../../components/Icono.jsx'

/** Valor para <input type="datetime-local"> en hora local, N horas desde ahora. */
function enHoras(horas) {
  const d = new Date(Date.now() + horas * 3600e3)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function PublicarAlerta() {
  const { usuario } = useAuth()
  const inicial = { tipo: 'huracan', nivel: 'alto', region: usuario.region ?? 'Costa', titulo: '', descripcion: '', vigenteHasta: enHoras(12) }
  const [form, setForm] = useState(inicial)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const n = NIVELES[form.nivel]

  // Paso 1: revisar el formulario y pedir confirmación (la alerta llega a toda la región y no se puede deshacer)
  function revisar(e) {
    e.preventDefault()
    setError('')
    if (form.titulo.trim().length < 5) return setError('Escribe un título de al menos 5 caracteres.')
    if (form.descripcion.trim().length < 10) return setError('Escribe las indicaciones para la población (al menos 10 caracteres).')
    if (!form.vigenteHasta || new Date(form.vigenteHasta) <= new Date()) return setError('La vigencia debe ser una fecha futura.')
    setConfirmando(true)
  }

  // Paso 2: publicar de verdad
  async function publicar() {
    setEnviando(true)
    try {
      const r = await api.post('/alerts/publish', { ...form, vigenteHasta: new Date(form.vigenteHasta).toISOString() })
      setResultado(r)
      setForm(inicial)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
      setConfirmando(false)
    }
  }

  if (resultado) {
    return (
      <section className="flex max-w-xl flex-col items-start gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-riesgo-bajo-fondo text-riesgo-bajo">
          <Icono nombre="palomita" tam={32} grosor={2.6} />
        </span>
        <h1 className="text-pantalla font-bold">Alerta publicada</h1>
        <p className="text-barro-suave">{resultado.mensaje}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setResultado(null)} className="btn-principal">Publicar otra</button>
          <Link to="/autoridad/alertas" className="btn-neutro min-h-13">Ver mis alertas</Link>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-wrap items-start gap-7">
      <form onSubmit={revisar} className="tarjeta flex min-w-0 flex-[2_1_420px] flex-col gap-4.5 p-6" noValidate>
        <h1 className="text-titular font-bold">Nueva alerta</h1>

        <div className="flex flex-wrap gap-4">
          <label className="etiqueta flex-[1_1_200px]">
            Tipo de fenómeno
            <select className="campo font-normal" value={form.tipo} onChange={cambiar('tipo')}>
              {Object.entries(TIPOS_ALERTA).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
            </select>
          </label>
          <label className="etiqueta flex-[1_1_200px]">
            Región afectada
            <select className="campo font-normal" value={form.region} onChange={cambiar('region')}>
              {REGIONES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-texto font-bold">Nivel de riesgo</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[...ORDEN_NIVELES].map((clave) => {
              const nv = NIVELES[clave]
              const activo = form.nivel === clave
              return (
                <button
                  key={clave}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setForm((f) => ({ ...f, nivel: clave }))}
                  className={`min-h-13 rounded-xl border-2 font-bold ${activo ? `${nv.clases.solido} border-transparent text-white` : `${nv.clases.fondo} ${nv.clases.texto} border-transparent`}`}
                >
                  {nv.nombre}
                </button>
              )
            })}
          </div>
        </fieldset>

        <label className="etiqueta">
          Título corto
          <input className="campo font-normal" maxLength={200} placeholder="Ej. Huracán en la Costa: lluvias intensas y viento fuerte" value={form.titulo} onChange={cambiar('titulo')} />
        </label>
        <label className="etiqueta">
          Indicaciones para la población
          <textarea className="campo min-h-28 py-3 font-normal" maxLength={2000} placeholder="Qué debe hacer la gente, en frases cortas." value={form.descripcion} onChange={cambiar('descripcion')} />
        </label>
        <label className="etiqueta max-w-80">
          Vigente hasta
          <input className="campo font-normal" type="datetime-local" value={form.vigenteHasta} onChange={cambiar('vigenteHasta')} />
        </label>

        <Aviso tipo="error">{error}</Aviso>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-principal">Revisar y publicar</button>
          <span className="text-nota text-tenue">Se notificará a todas las personas registradas en <strong>{form.region}</strong>.</span>
        </div>
      </form>

      <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5" aria-label="Vista previa">
        <h2 className="font-bold text-tenue">Así la verá la población</h2>
        <div className={`flex flex-col gap-2.5 rounded-[20px] border-2 p-4.5 ${n.clases.fondo} ${n.clases.borde}`}>
          <span className={`text-nota font-bold tracking-wide ${n.clases.texto}`}>{n.texto}</span>
          <span className="text-subtitulo leading-tight font-bold">{form.titulo || 'Título de la alerta'}</span>
          <span className="text-texto leading-snug whitespace-pre-line text-barro-suave">{form.descripcion || 'Indicaciones para la población.'}</span>
          <span className="text-nota text-tenue">{TIPOS_ALERTA[form.tipo]} · Vigente hasta {fechaCorta(form.vigenteHasta)}</span>
        </div>
      </aside>

      <Confirmar
        abierto={confirmando}
        titulo={`¿Publicar alerta ${n.color.toLowerCase()} (riesgo ${n.nombre.toLowerCase()})?`}
        textoConfirmar="Sí, publicar"
        claseConfirmar={`inline-flex min-h-13 items-center justify-center rounded-2xl px-5 text-subtitulo font-bold text-white ${n.clases.solido} disabled:opacity-60`}
        enviando={enviando}
        onConfirmar={publicar}
        onCancelar={() => setConfirmando(false)}
      >
        <p>
          Se enviará a <strong className="text-barro">todas las personas registradas en {form.region}</strong> y no se puede deshacer.
        </p>
        <p><strong className="text-barro">{form.titulo}</strong></p>
        <p>{TIPOS_ALERTA[form.tipo]} · Vigente hasta {fechaCorta(form.vigenteHasta)}</p>
      </Confirmar>
    </div>
  )
}
