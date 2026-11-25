import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { TIPOS_REPORTE } from '../utils/catalogos.js'
import { obtenerUbicacion } from '../utils/geo.js'
import Aviso from '../components/Aviso.jsx'
import Icono from '../components/Icono.jsx'
import { errorDescripcionReporte } from '../utils/validaciones.js'

const PASOS = ['Tipo', 'Ubicación', 'Confirmar']

// Tinte de cada tipo de incidente (el nombre siempre acompaña al color)
const TINTE = {
  inundacion: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  deslave: 'bg-amber-500/14 text-amber-800 dark:text-amber-300',
  arbol: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  cable: 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300',
  vivienda: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
  otro: 'bg-slate-500/12 text-slate-700 dark:text-slate-300',
}
const AYUDA_TIPO = {
  inundacion: 'Calles o casas con agua',
  deslave: 'Tierra o rocas sobre el camino',
  arbol: 'Bloquea calle o cables',
  cable: 'Cables de luz en el suelo',
  vivienda: 'Grietas, techo o muros',
  otro: 'Cualquier otro peligro',
}

export default function Reportar() {
  const [paso, setPaso] = useState(1)
  const [tipo, setTipo] = useState('')
  const [ubicacion, setUbicacion] = useState(null)
  const [referencia, setReferencia] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  function siguiente() {
    setError('')
    if (paso === 1 && !tipo) return setError('Elige qué está pasando.')
    if (paso === 2) {
      if (!ubicacion && referencia.trim().length < 3) return setError('Usa tu ubicación o escribe una referencia del lugar.')
      // Obligatoria pero sin mínimo: en una emergencia basta con pocas palabras (p. ej. «Herido»)
      if (errorDescripcionReporte(descripcion)) return setError(errorDescripcionReporte(descripcion))
    }
    setPaso((p) => p + 1)
  }

  async function usarUbicacion() {
    setError('')
    setBuscando(true)
    try {
      setUbicacion(await obtenerUbicacion())
    } catch (err) {
      setError(err.message)
    } finally {
      setBuscando(false)
    }
  }

  async function enviar() {
    setError('')
    setEnviando(true)
    try {
      await api.post('/reports', {
        tipo,
        descripcion: descripcion.trim(),
        referencia: referencia.trim() || undefined,
        latitud: ubicacion?.latitud,
        longitud: ubicacion?.longitud,
      })
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function reiniciar() {
    setPaso(1); setTipo(''); setUbicacion(null); setReferencia(''); setDescripcion(''); setEnviado(false); setError('')
  }

  if (enviado) {
    return (
      <section className="flex flex-col items-center gap-3 pt-14 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-riesgo-bajo-fondo text-ok-texto ring-8 ring-riesgo-bajo-fondo/50">
          <Icono nombre="ok" tam={44} peso="fill" />
        </span>
        <h1 className="text-titular font-bold">Reporte enviado</h1>
        <p className="leading-relaxed text-tinta-suave">Estado: <strong>Recibido</strong>. La autoridad de tu región lo revisará.</p>
        <Link to="/reportes" className="btn-principal mt-3 w-full">Ver mis reportes</Link>
        <button type="button" onClick={reiniciar} className="btn-neutro w-full">Hacer otro reporte</button>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="rotulo text-tenue">Reporte ciudadano</p>
          <h1 className="text-titular font-bold">Reportar un incidente</h1>
        </div>
        <Link to="/reportes" className="btn-neutro"><Icono nombre="reporte" tam={20} /> Mis reportes</Link>
      </div>

      <ol className="grid grid-cols-3 gap-2" aria-label={`Paso ${paso} de 3: ${PASOS[paso - 1]}`}>
        {PASOS.map((t, k) => {
          const n = k + 1
          const hecho = paso > n
          const actual = paso === n
          return (
            <li key={t} className="flex flex-col gap-1.5">
              <span className={`h-2 rounded-full ${paso >= n ? 'bg-acento' : 'bg-linea'}`} aria-hidden="true" />
              <span className={`flex items-center gap-1.5 text-nota ${actual ? 'font-bold text-tinta' : 'text-tenue'}`}>
                <span className={`flex size-5 items-center justify-center rounded-full text-mini font-bold ${hecho || actual ? 'bg-acento text-white' : 'bg-linea text-tenue'}`}>{hecho ? '✓' : n}</span>
                <span className="truncate">{t}</span>
              </span>
            </li>
          )
        })}
      </ol>

      {paso === 1 && (
        <>
          <a href="tel:911" className="flex items-center gap-3 rounded-2xl border border-riesgo-critico/30 bg-riesgo-critico-fondo px-3.5 py-3 text-texto leading-snug text-riesgo-critico-texto no-underline">
            <Icono nombre="telefono" tam={22} peso="fill" />
            <span>Si alguien está en peligro, <strong>llama al 911</strong> primero.</span>
          </a>
          <fieldset>
            <legend className="mb-2.5 text-subtitulo font-bold">¿Qué está pasando?</legend>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {Object.entries(TIPOS_REPORTE).map(([id, nombre]) => {
                const activo = tipo === id
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setTipo(id)}
                    className={`flex min-h-28 flex-col items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition ${activo ? 'border-acento bg-acento-suave' : 'border-linea bg-superficie hover:border-borde'}`}
                  >
                    <span className={`icono-caja size-12 ${activo ? 'bg-acento text-white' : TINTE[id]}`}><Icono nombre={id} tam={28} peso={activo ? 'fill' : 'duotone'} /></span>
                    <span className="flex flex-col">
                      <span className="font-bold">{nombre}</span>
                      <span className="text-nota leading-snug text-tenue">{AYUDA_TIPO[id]}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </>
      )}

      {paso === 2 && (
        <>
          <div className={`tarjeta flex items-center gap-3 px-3.5 py-3 ${ubicacion ? 'border-riesgo-bajo/50' : ''}`}>
            <span className={`icono-caja size-11 ${ubicacion ? 'bg-riesgo-bajo-fondo text-ok-texto' : 'bg-acento-claro text-acento dark:text-acento-fuerte'}`}><Icono nombre={ubicacion ? 'ok' : 'objetivo'} tam={24} peso={ubicacion ? 'fill' : 'duotone'} /></span>
            <span className="flex flex-1 flex-col">
              <span className="font-bold">{ubicacion ? 'Ubicación agregada' : 'Usar mi ubicación actual'}</span>
              <span className="text-nota text-tenue">
                {ubicacion ? `${ubicacion.latitud.toFixed(4)}, ${ubicacion.longitud.toFixed(4)}` : 'Ayuda a que lleguen más rápido'}
              </span>
            </span>
            <button type="button" onClick={usarUbicacion} disabled={buscando} className="btn-neutro min-h-11 text-nota">
              {buscando ? 'Buscando…' : ubicacion ? 'Actualizar' : 'Usar'}
            </button>
          </div>
          <label className="etiqueta">
            <span>Referencia del lugar {ubicacion && <span className="font-normal text-tenue">(opcional)</span>}</span>
            <input className="campo font-normal" maxLength={250} placeholder="Ej. Calle Guadalupe, frente a la tienda" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
          </label>
          <label className="etiqueta">
            <span>Describe lo que ves <span className="font-normal text-tenue">(obligatorio; basta con pocas palabras)</span></span>
            <textarea className="campo min-h-28 py-3 font-normal" maxLength={1000} placeholder="Ej. Persona herida, árbol caído en la calle" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>
        </>
      )}

      {paso === 3 && (
        <>
          <h2 className="text-subtitulo font-bold">Revisa tu reporte</h2>
          <dl className="tarjeta flex flex-col gap-3 p-4">
            <div><dt className="rotulo text-tenue">Tipo</dt><dd className="font-bold">{TIPOS_REPORTE[tipo]}</dd></div>
            <div>
              <dt className="rotulo text-tenue">Ubicación</dt>
              <dd className="font-bold">{referencia || (ubicacion ? 'Mi ubicación actual' : '')}</dd>
            </div>
            <div><dt className="rotulo text-tenue">Descripción</dt><dd>{descripcion}</dd></div>
          </dl>
          <p className="text-nota text-tenue">Lo recibirá la autoridad de tu región. Podrás ver su estado en Mis reportes.</p>
        </>
      )}

      <Aviso tipo="error">{error}</Aviso>

      <div className="flex gap-2.5">
        {paso > 1 && (
          <button type="button" onClick={() => { setError(''); setPaso((p) => p - 1) }} className="btn-neutro min-h-13">Atrás</button>
        )}
        {paso < 3 ? (
          <button type="button" onClick={siguiente} className="btn-principal flex-1">Continuar</button>
        ) : (
          <button type="button" onClick={enviar} disabled={enviando} className="btn-principal flex-1">
            {enviando ? 'Enviando…' : 'Enviar reporte'}
          </button>
        )}
      </div>
    </div>
  )
}
