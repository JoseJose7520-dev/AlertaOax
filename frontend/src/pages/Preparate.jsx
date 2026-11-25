import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { GUIAS, MOCHILA } from '../utils/guias.js'
import { fechaCorta } from '../utils/catalogos.js'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'

const PESTANAS = [
  { id: 'guias', texto: 'Guías', icono: 'documento' },
  { id: 'mochila', texto: 'Mochila', icono: 'mochila' },
  { id: 'plan', texto: 'Plan familiar', icono: 'comunidad' },
]

const ETAPAS = [
  { clave: 'antes', titulo: 'Antes', icono: 'antes', clases: 'bg-acento-claro text-acento dark:text-acento-fuerte', borde: 'border-t-acento' },
  { clave: 'durante', titulo: 'Durante', icono: 'durante', clases: 'bg-riesgo-alto-fondo text-riesgo-alto-texto', borde: 'border-t-riesgo-alto' },
  { clave: 'despues', titulo: 'Después', icono: 'despues', clases: 'bg-riesgo-bajo-fondo text-ok-texto', borde: 'border-t-riesgo-bajo' },
]

function Guias() {
  const [actual, setActual] = useState(GUIAS[0].id)
  const g = GUIAS.find((x) => x.id === actual)
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="group" aria-label="Elige un fenómeno">
        {GUIAS.map((x) => {
          const activo = x.id === actual
          return (
            <button key={x.id} type="button" aria-pressed={activo} onClick={() => setActual(x.id)}
              className={`flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left transition ${activo ? 'border-acento bg-acento-suave' : 'border-linea bg-superficie hover:border-borde'}`}>
              <span className={`icono-caja size-10 ${activo ? 'bg-acento text-white' : 'bg-acento-claro text-acento dark:text-acento-fuerte'}`}><Icono nombre={x.id} tam={24} peso={activo ? 'fill' : 'duotone'} /></span>
              <span className="font-bold">{x.nombre}</span>
            </button>
          )
        })}
      </div>
      <p className="text-tinta-suave">{g.resumen}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {ETAPAS.map((e) => (
          <section key={e.clave} className={`tarjeta flex flex-col gap-3 border-t-4 p-4 ${e.borde}`}>
            <h3 className="flex items-center gap-2.5 text-subtitulo font-bold">
              <span className={`icono-caja size-10 ${e.clases}`}><Icono nombre={e.icono} tam={22} /></span>
              {e.titulo}
            </h3>
            <ul className="flex flex-col gap-2 leading-snug">
              {g[e.clave].map((p) => (
                <li key={p} className="flex items-start gap-2"><Icono nombre="palomita" tam={18} peso="bold" className="mt-0.5 text-ok-texto" />{p}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function Mochila({ marcados, alternar, guardando }) {
  const hechos = marcados.length
  return (
    <div className="flex flex-col gap-3">
      <section className="tarjeta flex flex-col gap-2.5 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="flex items-center gap-2 text-subtitulo font-bold"><Icono nombre="mochila" tam={24} className="text-acento dark:text-acento-fuerte" /> Tu mochila de emergencia</h2>
          <span className="text-pantalla font-bold">{hechos}<span className="text-texto text-tenue"> de {MOCHILA.length}</span></span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-hundido" role="progressbar" aria-valuemin={0} aria-valuemax={MOCHILA.length} aria-valuenow={hechos} aria-label="Avance de la mochila">
          <div className="h-full rounded-full transition-all" style={{ width: `${(hechos / MOCHILA.length) * 100}%`, backgroundImage: 'linear-gradient(90deg,#2563EB,#0891B2)' }} />
        </div>
        <p className="text-nota text-tenue">Debe alcanzar para 72 horas. Revísala cada 6 meses. {guardando && '· Guardando…'}</p>
      </section>
      <ul className="grid gap-2 sm:grid-cols-2">
        {MOCHILA.map((m) => {
          const ok = marcados.includes(m.id)
          return (
            <li key={m.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={ok}
                onClick={() => alternar(m.id)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left transition ${ok ? 'border-acento/60 bg-acento-suave' : 'border-linea bg-superficie hover:border-borde'}`}
              >
                <span className={`icono-caja size-11 ${ok ? 'bg-acento text-white' : 'bg-hundido text-tenue'}`}><Icono nombre={m.id} tam={24} peso={ok ? 'fill' : 'duotone'} /></span>
                <span className="flex flex-1 flex-col">
                  <span className="font-bold">{m.nombre}</span>
                  <span className="text-nota text-tenue">{m.detalle}</span>
                </span>
                <span className={`flex size-6.5 shrink-0 items-center justify-center rounded-lg border-2 ${ok ? 'border-acento bg-acento text-white' : 'border-borde bg-superficie'}`}>
                  {ok && <Icono nombre="palomita" tam={16} peso="bold" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** Texto del plan para mandarlo a la familia (WhatsApp, SMS, correo…). */
function textoPlan(plan) {
  const lineas = ['🏠 Nuestro plan familiar de emergencia (AlertaOax)']
  if (plan.punto_reunion) lineas.push(`📍 Punto de reunión: ${plan.punto_reunion}`)
  if (plan.albergue) lineas.push(`🏫 Albergue al que iremos: ${plan.albergue}`)
  if (plan.contacto_externo) lineas.push(`📞 Contacto fuera de la región: ${plan.contacto_externo}`)
  if (plan.necesidades) lineas.push(`🧑‍🦽 Quién necesita ayuda: ${plan.necesidades}`)
  lineas.push('En una emergencia llama primero al 911.')
  return lineas.join('\n')
}

function PlanFamiliar({ plan, albergues, guardar }) {
  const [form, setForm] = useState({
    puntoReunion: plan?.punto_reunion ?? '',
    albergueId: plan?.albergue_id ?? '',
    contactoExterno: plan?.contacto_externo ?? '',
    necesidades: plan?.necesidades ?? '',
  })
  const [estado, setEstado] = useState({ tipo: 'info', texto: '' })
  const [enviando, setEnviando] = useState(false)
  const [intento, setIntento] = useState(false)
  const cambiar = (c) => (e) => { setForm((f) => ({ ...f, [c]: e.target.value })); setEstado({ tipo: 'info', texto: '' }) }

  // Lo mínimo para que el plan sirva: dónde se reúnen y a quién llamar (revisión del Equipo 1, punto 3)
  const errores = {}
  if (form.puntoReunion.trim().length < 5) errores.puntoReunion = 'Escribe dónde se reunirán (al menos 5 caracteres).'
  if (form.contactoExterno.trim().length < 5) errores.contactoExterno = 'Escribe el nombre y teléfono de un contacto fuera de la región.'
  else if (!/\d{7,}/.test(form.contactoExterno.replace(/[\s-]/g, ''))) errores.contactoExterno = 'Incluye el teléfono del contacto.'
  const ver = (c) => (intento ? errores[c] : undefined)

  async function enviar(e) {
    e.preventDefault()
    setIntento(true)
    if (Object.keys(errores).length) return setEstado({ tipo: 'error', texto: 'Completa los datos marcados para guardar tu plan.' })
    setEnviando(true)
    try {
      await guardar(form)
      setIntento(false)
      setEstado({ tipo: 'exito', texto: 'Plan guardado. Ahora compártelo con tu familia.' })
    } catch (err) {
      setEstado({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  async function compartir() {
    const texto = textoPlan(plan)
    try {
      if (navigator.share) await navigator.share({ title: 'Plan familiar de emergencia', text: texto })
      else {
        await navigator.clipboard.writeText(texto)
        setEstado({ tipo: 'exito', texto: 'Plan copiado. Pégalo en WhatsApp o en un mensaje para tu familia.' })
      }
    } catch { /* la persona canceló */ }
  }

  const cambiosSinGuardar = plan && (
    form.puntoReunion !== (plan.punto_reunion ?? '') || String(form.albergueId) !== String(plan.albergue_id ?? '') ||
    form.contactoExterno !== (plan.contacto_externo ?? '') || form.necesidades !== (plan.necesidades ?? ''))
  const puedeCompartir = plan?.punto_reunion && !cambiosSinGuardar

  return (
    <form onSubmit={enviar} className="tarjeta flex flex-col gap-4 p-4 sm:p-5" noValidate>
      <p className="flex items-center gap-2 text-tinta-suave"><Icono nombre="comunidad" tam={22} className="text-acento dark:text-acento-fuerte" /> Acuerden en familia qué hacer. Se guarda en tu cuenta y lo puedes compartir.</p>
      <div className="grid gap-4 sm:grid-cols-2">
      <label className="etiqueta">
        Punto de reunión *
        <input className={`campo font-normal ${ver('puntoReunion') ? 'border-riesgo-critico' : ''}`} maxLength={250} placeholder="Ej. Parque central, frente a la iglesia" value={form.puntoReunion} onChange={cambiar('puntoReunion')} />
        {ver('puntoReunion') && <span className="text-nota font-semibold text-riesgo-critico-texto">{ver('puntoReunion')}</span>}
      </label>
      <label className="etiqueta">
        Albergue al que iremos
        <select className="campo font-normal" value={form.albergueId} onChange={cambiar('albergueId')}>
          <option value="">Sin elegir</option>
          {albergues.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </label>
      <label className="etiqueta">
        Contacto foráneo (fuera de la región) *
        <input className={`campo font-normal ${ver('contactoExterno') ? 'border-riesgo-critico' : ''}`} maxLength={160} placeholder="Ej. Tía Rosa 951 123 4567" value={form.contactoExterno} onChange={cambiar('contactoExterno')} />
        {ver('contactoExterno') && <span className="text-nota font-semibold text-riesgo-critico-texto">{ver('contactoExterno')}</span>}
      </label>
      <label className="etiqueta sm:col-span-2">
        ¿Quién necesita ayuda especial?
        <textarea className="campo min-h-24 py-3 font-normal" maxLength={500} placeholder="Ej. Abuela con bastón, bebé de 1 año" value={form.necesidades} onChange={cambiar('necesidades')} />
      </label>
      </div>
      <p className="text-nota text-tenue">* Obligatorio</p>
      <Aviso tipo={estado.tipo}>{estado.texto}</Aviso>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar plan'}</button>
        <button type="button" onClick={compartir} className="btn-neutro min-h-13" disabled={!puedeCompartir}
          title={puedeCompartir ? 'Enviar el plan por WhatsApp, mensaje o correo' : 'Guarda tu plan para poder compartirlo'}>
          <Icono nombre="compartir" tam={20} /> Compartir con mi familia
        </button>
      </div>
      {plan?.actualizado_en && <p className="text-nota text-tenue">Última actualización: {fechaCorta(plan.actualizado_en)}</p>}
    </form>
  )
}

export default function Preparate() {
  const { usuario } = useAuth()
  const [pestana, setPestana] = useState('mochila')
  const planApi = useApi('/plan')
  const alberguesApi = useApi(`/shelters?region=${encodeURIComponent(usuario.region ?? 'todas')}`)
  // null = todavía no hay cambios locales; se usa lo que viene del servidor
  const [mochilaLocal, setMochila] = useState(null)
  const [guardandoMochila, setGuardandoMochila] = useState(false)
  const [error, setError] = useState('')

  const plan = planApi.datos?.plan ?? null
  const mochila = mochilaLocal ?? plan?.mochila ?? []

  // La mochila y el plan se guardan juntos en /api/plan
  const datosPlan = (extra) => ({
    puntoReunion: plan?.punto_reunion ?? null,
    albergueId: plan?.albergue_id ?? null,
    contactoExterno: plan?.contacto_externo ?? null,
    necesidades: plan?.necesidades ?? null,
    mochila,
    ...extra,
  })

  async function alternar(id) {
    const nueva = mochila.includes(id) ? mochila.filter((x) => x !== id) : [...mochila, id]
    setMochila(nueva)
    setGuardandoMochila(true)
    setError('')
    try {
      await api.put('/plan', datosPlan({ mochila: nueva }))
    } catch (err) {
      setError(`No se guardó el cambio: ${err.message}`)
    } finally {
      setGuardandoMochila(false)
    }
  }

  async function guardarPlan(form) {
    await api.put('/plan', datosPlan({ ...form, albergueId: form.albergueId || null, seccion: 'plan' }))
    planApi.recargar()
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="rotulo text-tenue">Preparación familiar</p>
        <h1 className="text-titular font-bold">Prepárate</h1>
      </div>
      <div role="tablist" aria-label="Secciones de preparación" className="grid grid-cols-3 gap-1 rounded-full border border-linea bg-hundido p-1">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full text-nota font-semibold sm:text-texto ${pestana === p.id ? 'bg-superficie text-tinta shadow-tarjeta' : 'text-tenue hover:text-tinta'}`}
          >
            <Icono nombre={p.icono} tam={20} peso={pestana === p.id ? 'fill' : 'duotone'} className="max-[379px]:hidden" />{p.texto}
          </button>
        ))}
      </div>

      <Aviso tipo="error">{error || planApi.error}</Aviso>
      {planApi.cargando && !planApi.datos ? <Cargando /> : (
        <div role="tabpanel">
          {pestana === 'guias' && <Guias />}
          {pestana === 'mochila' && <Mochila marcados={mochila} alternar={alternar} guardando={guardandoMochila} />}
          {pestana === 'plan' && (
            <PlanFamiliar plan={plan} albergues={alberguesApi.datos?.albergues ?? []} guardar={guardarPlan} />
          )}
        </div>
      )}
    </div>
  )
}
