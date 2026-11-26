import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { GUIAS, MOCHILA } from '../utils/guias.js'
import { fechaCorta } from '../utils/catalogos.js'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Confirmar from '../components/Confirmar.jsx'
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
  const lineas = [`🏠 Plan familiar de emergencia «${plan.nombre}» (AlertaOax)`]
  if (plan.punto_reunion) lineas.push(`📍 Punto de reunión: ${plan.punto_reunion}`)
  if (plan.albergue) lineas.push(`🏫 Albergue al que iremos: ${plan.albergue}`)
  if (plan.contacto_externo) lineas.push(`📞 Contacto fuera de la región: ${plan.contacto_externo}`)
  if (plan.necesidades) lineas.push(`🧑‍🦽 Quién necesita ayuda: ${plan.necesidades}`)
  lineas.push('En una emergencia llama primero al 911.')
  return lineas.join('\n')
}

const VACIO = { nombre: '', puntoReunion: '', albergueId: '', contactoExterno: '', necesidades: '' }
const aFormulario = (p) => p
  ? { nombre: p.nombre ?? '', puntoReunion: p.punto_reunion ?? '', albergueId: p.albergue_id ?? '', contactoExterno: p.contacto_externo ?? '', necesidades: p.necesidades ?? '' }
  : VACIO

/** Crear o editar un plan. Lo mínimo para que sirva: nombre, dónde se reúnen y a quién llamar. */
function FormularioPlan({ plan, albergues, alGuardar, alCancelar }) {
  const [form, setForm] = useState(aFormulario(plan))
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [intento, setIntento] = useState(false)
  const cambiar = (c) => (e) => { setForm((f) => ({ ...f, [c]: e.target.value })); setError('') }

  const errores = {}
  if (form.nombre.trim().length < 2) errores.nombre = 'Ponle un nombre, por ejemplo «Casa» o «Trabajo de mamá».'
  if (form.puntoReunion.trim().length < 5) errores.puntoReunion = 'Escribe dónde se reunirán (al menos 5 caracteres).'
  if (form.contactoExterno.trim().length < 5) errores.contactoExterno = 'Escribe el nombre y teléfono de un contacto fuera de la región.'
  else if (!/\d{7,}/.test(form.contactoExterno.replace(/[\s-]/g, ''))) errores.contactoExterno = 'Incluye el teléfono del contacto.'
  const ver = (c) => (intento ? errores[c] : undefined)
  const borde = (c) => (ver(c) ? 'border-riesgo-critico' : '')

  async function enviar(e) {
    e.preventDefault()
    setIntento(true)
    if (Object.keys(errores).length) return setError('Completa los datos marcados para guardar el plan.')
    setEnviando(true)
    try {
      const cuerpo = { ...form, albergueId: form.albergueId || null }
      const r = plan ? await api.put(`/plan/planes/${plan.id}`, cuerpo) : await api.post('/plan/planes', cuerpo)
      alGuardar(r.plan, r.mensaje)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="tarjeta flex flex-col gap-4 p-4 sm:p-5" noValidate>
      <div className="flex items-center gap-2">
        <Icono nombre={plan ? 'editar' : 'mas'} tam={22} className="text-acento dark:text-acento-fuerte" />
        <h2 className="text-subtitulo font-bold">{plan ? `Editar «${plan.nombre}»` : 'Nuevo plan familiar'}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="etiqueta sm:col-span-2">
          Nombre del plan *
          <input className={`campo font-normal ${borde('nombre')}`} maxLength={60} placeholder="Ej. Casa, Trabajo de mamá, Casa de los abuelos" value={form.nombre} onChange={cambiar('nombre')} autoFocus />
          {ver('nombre') && <span className="text-nota font-semibold text-riesgo-critico-texto">{ver('nombre')}</span>}
        </label>
        <label className="etiqueta">
          Punto de reunión *
          <input className={`campo font-normal ${borde('puntoReunion')}`} maxLength={250} placeholder="Ej. Parque central, frente a la iglesia" value={form.puntoReunion} onChange={cambiar('puntoReunion')} />
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
          <input className={`campo font-normal ${borde('contactoExterno')}`} maxLength={160} placeholder="Ej. Tía Rosa 951 123 4567" value={form.contactoExterno} onChange={cambiar('contactoExterno')} />
          {ver('contactoExterno') && <span className="text-nota font-semibold text-riesgo-critico-texto">{ver('contactoExterno')}</span>}
        </label>
        <label className="etiqueta sm:col-span-2">
          ¿Quién necesita ayuda especial?
          <textarea className="campo min-h-24 py-3 font-normal" maxLength={500} placeholder="Ej. Abuela con bastón, bebé de 1 año" value={form.necesidades} onChange={cambiar('necesidades')} />
        </label>
      </div>
      <p className="text-nota text-tenue">* Obligatorio</p>
      <Aviso tipo="error">{error}</Aviso>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? 'Guardando…' : plan ? 'Guardar cambios' : 'Crear plan'}</button>
        <button type="button" className="btn-neutro min-h-13" onClick={alCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </form>
  )
}

function Dato({ icono, titulo, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="icono-caja size-10 shrink-0 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre={icono} tam={20} /></span>
      <div className="min-w-0">
        <p className="rotulo text-tenue">{titulo}</p>
        <p className="break-words font-semibold">{children}</p>
      </div>
    </div>
  )
}

/** Tarjeta de un plan guardado: se puede ver completo, editar, compartir y eliminar. */
function TarjetaPlan({ plan, abierto, alAlternar, alEditar, alEliminar, alCompartir }) {
  return (
    <article className="tarjeta flex flex-col gap-3 p-4 sm:p-5">
      <button type="button" onClick={alAlternar} aria-expanded={abierto} className="flex items-start justify-between gap-3 text-left">
        <span className="flex min-w-0 items-start gap-3">
          <span className="icono-caja size-11 shrink-0 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="comunidad" tam={24} /></span>
          <span className="min-w-0">
            <span className="block text-subtitulo font-bold">{plan.nombre}</span>
            <span className="block truncate text-nota text-tenue">📍 {plan.punto_reunion}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-nota font-bold text-acento dark:text-acento-fuerte">
          {abierto ? 'Ocultar' : 'Ver plan'} <Icono nombre="abajo" tam={18} peso="bold" className={abierto ? 'rotate-180' : ''} />
        </span>
      </button>
      {abierto && (
        <div className="flex flex-col gap-3 border-t border-linea pt-3">
          <Dato icono="ubicacion" titulo="Punto de reunión">{plan.punto_reunion}</Dato>
          <Dato icono="casa" titulo="Albergue al que iremos">{plan.albergue ?? 'Sin elegir'}</Dato>
          <Dato icono="telefono" titulo="Contacto fuera de la región">{plan.contacto_externo}</Dato>
          <Dato icono="salvavidas" titulo="Quién necesita ayuda especial">{plan.necesidades || 'Nadie anotado'}</Dato>
          <p className="text-nota text-tenue">Última actualización: {fechaCorta(plan.actualizado_en)}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <button type="button" onClick={alCompartir} className="btn-principal col-span-2 min-h-11 text-texto sm:flex-1"><Icono nombre="compartir" tam={20} /> Compartir</button>
        <button type="button" onClick={alEditar} className="btn-neutro min-h-11 text-texto" aria-label={`Editar el plan ${plan.nombre}`}><Icono nombre="editar" tam={20} /> Editar</button>
        <button type="button" onClick={alEliminar} className="btn-neutro min-h-11 text-texto text-riesgo-critico-texto" aria-label={`Eliminar el plan ${plan.nombre}`}><Icono nombre="eliminar" tam={20} /> Eliminar</button>
      </div>
    </article>
  )
}

/** Pestaña «Plan familiar»: lista de planes de la cuenta (AO-431). */
function PlanesFamiliares({ albergues }) {
  const planesApi = useApi('/plan/planes')
  const planes = planesApi.datos?.planes ?? []
  const maximo = planesApi.datos?.maximo ?? 10
  // null = lista; { plan: null } = nuevo; { plan } = editar
  const [edicion, setEdicion] = useState(null)
  const [abiertoId, setAbiertoId] = useState(null)
  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [aviso, setAviso] = useState({ tipo: 'info', texto: '' })

  async function compartir(plan) {
    const texto = textoPlan(plan)
    try {
      if (navigator.share) await navigator.share({ title: `Plan familiar: ${plan.nombre}`, text: texto })
      else {
        await navigator.clipboard.writeText(texto)
        setAviso({ tipo: 'exito', texto: 'Plan copiado. Pégalo en WhatsApp o en un mensaje para tu familia.' })
      }
    } catch { /* la persona canceló */ }
  }

  async function eliminar() {
    setEliminando(true)
    try {
      const r = await api.borrar(`/plan/planes/${porEliminar.id}`)
      setAviso({ tipo: 'exito', texto: `${r.mensaje} («${porEliminar.nombre}»)` })
      setPorEliminar(null)
      planesApi.recargar()
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
      setPorEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  if (edicion) {
    return (
      <FormularioPlan
        plan={edicion.plan}
        albergues={albergues}
        alCancelar={() => setEdicion(null)}
        alGuardar={(plan, mensaje) => { setEdicion(null); setAbiertoId(plan.id); setAviso({ tipo: 'exito', texto: mensaje }); planesApi.recargar() }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-tinta-suave">
          <Icono nombre="comunidad" tam={22} className="text-acento dark:text-acento-fuerte" />
          Acuerden en familia qué hacer. Puedes tener un plan por cada lugar donde están (casa, trabajo, escuela).
        </p>
        {planes.length > 0 && (
          <button type="button" className="btn-principal min-h-11 text-texto" disabled={planes.length >= maximo}
            title={planes.length >= maximo ? `Puedes guardar hasta ${maximo} planes` : undefined}
            onClick={() => { setAviso({ tipo: 'info', texto: '' }); setEdicion({ plan: null }) }}>
            <Icono nombre="mas" tam={20} /> Nuevo plan
          </button>
        )}
      </div>
      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
      <Aviso tipo="error">{planesApi.error}</Aviso>
      {planesApi.cargando && !planesApi.datos && <Cargando />}
      {planesApi.datos && planes.length === 0 && (
        <div className="tarjeta flex flex-col items-center gap-3 p-6 text-center">
          <span className="icono-caja size-14 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="comunidad" tam={30} /></span>
          <p className="text-subtitulo font-bold">Aún no tienes un plan familiar</p>
          <p className="text-tenue">Anota dónde se reunirán y a quién llamar si se separan. Toma 2 minutos.</p>
          <button type="button" className="btn-principal" onClick={() => setEdicion({ plan: null })}><Icono nombre="mas" tam={20} /> Crear mi primer plan</button>
        </div>
      )}
      {planes.map((p) => (
        <TarjetaPlan key={p.id} plan={p} abierto={abiertoId === p.id}
          alAlternar={() => setAbiertoId((id) => (id === p.id ? null : p.id))}
          alEditar={() => { setAviso({ tipo: 'info', texto: '' }); setEdicion({ plan: p }) }}
          alEliminar={() => setPorEliminar(p)}
          alCompartir={() => compartir(p)} />
      ))}
      {planes.length > 0 && <p className="text-nota text-tenue">{planes.length} de {maximo} planes guardados en tu cuenta.</p>}
      <Confirmar
        abierto={Boolean(porEliminar)}
        titulo={`¿Eliminar el plan «${porEliminar?.nombre ?? ''}»?`}
        tono="peligro"
        icono="eliminar"
        textoConfirmar="Sí, eliminar"
        textoCancelar="Cancelar"
        enviando={eliminando}
        onConfirmar={eliminar}
        onCancelar={() => setPorEliminar(null)}
      >
        <p>Se borrará de tu cuenta y no se puede deshacer. Si ya lo compartiste con tu familia, el mensaje que les mandaste no cambia.</p>
      </Confirmar>
    </div>
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

  // La mochila se guarda sola en /api/plan; los planes familiares van aparte en /api/plan/planes
  async function alternar(id) {
    const nueva = mochila.includes(id) ? mochila.filter((x) => x !== id) : [...mochila, id]
    setMochila(nueva)
    setGuardandoMochila(true)
    setError('')
    try {
      await api.put('/plan', { mochila: nueva })
    } catch (err) {
      setError(`No se guardó el cambio: ${err.message}`)
    } finally {
      setGuardandoMochila(false)
    }
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
            <PlanesFamiliares albergues={alberguesApi.datos?.albergues ?? []} />
          )}
        </div>
      )}
    </div>
  )
}
