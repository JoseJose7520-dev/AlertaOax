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
  { id: 'guias', texto: 'Guías' },
  { id: 'mochila', texto: 'Mochila' },
  { id: 'plan', texto: 'Plan familiar' },
]

function Guias() {
  const [abierta, setAbierta] = useState(null)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-barro-suave">Elige un fenómeno para ver qué hacer antes, durante y después.</p>
      {GUIAS.map((g) => {
        const activa = abierta === g.id
        return (
          <section key={g.id} className="tarjeta overflow-hidden">
            <button
              type="button"
              aria-expanded={activa}
              onClick={() => setAbierta(activa ? null : g.id)}
              className="flex min-h-19 w-full items-center gap-3.5 p-4 text-left"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-anil-claro text-anil">
                <Icono nombre={g.id} tam={26} />
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-subtitulo font-bold">{g.nombre}</span>
                <span className="text-nota text-tenue">{g.resumen}</span>
              </span>
              <Icono nombre="derecha" tam={20} className={`text-tenue transition ${activa ? 'rotate-90' : ''}`} />
            </button>
            {activa && (
              <div className="flex flex-col gap-4 border-t border-arena p-4">
                {[['Antes', g.antes], ['Durante', g.durante], ['Después', g.despues]].map(([titulo, pasos]) => (
                  <div key={titulo} className="flex flex-col gap-2">
                    <h3 className="font-bold text-anil">{titulo}</h3>
                    <ul className="flex list-disc flex-col gap-1.5 pl-5 leading-snug">
                      {pasos.map((p) => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function Mochila({ marcados, alternar, guardando }) {
  const hechos = marcados.length
  return (
    <div className="flex flex-col gap-3">
      <section className="tarjeta flex flex-col gap-2.5 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-subtitulo font-bold">Tu mochila de emergencia</h2>
          <span className="font-bold text-anil">{hechos} de {MOCHILA.length}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-crema" role="progressbar" aria-valuemin={0} aria-valuemax={MOCHILA.length} aria-valuenow={hechos} aria-label="Avance de la mochila">
          <div className="h-full rounded-full bg-anil transition-all" style={{ width: `${(hechos / MOCHILA.length) * 100}%` }} />
        </div>
        <p className="text-nota text-tenue">Debe alcanzar para 72 horas. Revísala cada 6 meses. {guardando && '· Guardando…'}</p>
      </section>
      <ul className="flex flex-col gap-2">
        {MOCHILA.map((m) => {
          const ok = marcados.includes(m.id)
          return (
            <li key={m.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={ok}
                onClick={() => alternar(m.id)}
                className={`flex min-h-15 w-full items-center gap-3.5 rounded-2xl border px-3.5 py-3 text-left ${ok ? 'border-[#C9C3EA] bg-anil-suave' : 'border-arena bg-white'}`}
              >
                <span className={`flex size-6.5 items-center justify-center rounded-lg border-2 ${ok ? 'border-anil bg-anil text-white' : 'border-[#8C8273] bg-white'}`}>
                  {ok && <Icono nombre="palomita" tam={16} grosor={3} />}
                </span>
                <span className="flex flex-col">
                  <span className="font-bold">{m.nombre}</span>
                  <span className="text-nota text-tenue">{m.detalle}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
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
  const cambiar = (c) => (e) => setForm((f) => ({ ...f, [c]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      await guardar(form)
      setEstado({ tipo: 'exito', texto: 'Plan guardado. Compártelo con tu familia.' })
    } catch (err) {
      setEstado({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <p className="text-barro-suave">Acuerden en familia qué hacer. Se guarda en tu cuenta.</p>
      <label className="etiqueta">
        Punto de reunión
        <input className="campo font-normal" maxLength={250} placeholder="Ej. Parque central, frente a la iglesia" value={form.puntoReunion} onChange={cambiar('puntoReunion')} />
      </label>
      <label className="etiqueta">
        Albergue al que iremos
        <select className="campo font-normal" value={form.albergueId} onChange={cambiar('albergueId')}>
          <option value="">Sin elegir</option>
          {albergues.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </label>
      <label className="etiqueta">
        Contacto fuera de la región
        <input className="campo font-normal" maxLength={160} placeholder="Nombre y teléfono" value={form.contactoExterno} onChange={cambiar('contactoExterno')} />
      </label>
      <label className="etiqueta">
        ¿Quién necesita ayuda especial?
        <textarea className="campo min-h-24 py-3 font-normal" maxLength={500} placeholder="Ej. Abuela con bastón, bebé de 1 año" value={form.necesidades} onChange={cambiar('necesidades')} />
      </label>
      <Aviso tipo={estado.tipo}>{estado.texto}</Aviso>
      <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar plan'}</button>
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
    await api.put('/plan', datosPlan({ ...form, albergueId: form.albergueId || null }))
    planApi.recargar()
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-pantalla font-bold">Prepárate</h1>
      <div role="tablist" aria-label="Secciones de preparación" className="grid grid-cols-3 gap-1 rounded-2xl bg-crema p-1">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={pestana === p.id}
            onClick={() => setPestana(p.id)}
            className={`min-h-11 rounded-xl text-texto ${pestana === p.id ? 'bg-white font-bold shadow-sm' : 'text-tenue'}`}
          >
            {p.texto}
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
