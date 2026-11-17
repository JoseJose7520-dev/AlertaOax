import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { TIPOS_REPORTE } from '../utils/catalogos.js'
import { obtenerUbicacion } from '../utils/geo.js'
import Aviso from '../components/Aviso.jsx'
import Icono from '../components/Icono.jsx'

const PASOS = ['Tipo', 'Ubicación y detalles', 'Confirmar']

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
      if (descripcion.trim().length < 10) return setError('Describe lo que ves con al menos 10 caracteres.')
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
        <span className="flex size-18 items-center justify-center rounded-full bg-riesgo-bajo-fondo text-riesgo-bajo">
          <Icono nombre="palomita" tam={36} grosor={2.6} />
        </span>
        <h1 className="text-pantalla font-bold">Reporte enviado</h1>
        <p className="leading-relaxed text-barro-suave">Estado: <strong>Recibido</strong>. La autoridad de tu región lo revisará.</p>
        <Link to="/reportes" className="btn-principal mt-3 w-full">Ver mis reportes</Link>
        <button type="button" onClick={reiniciar} className="min-h-11 font-bold text-anil">Hacer otro reporte</button>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-pantalla font-bold">Reportar</h1>
        <Link to="/reportes" className="flex min-h-11 items-center font-bold">Mis reportes</Link>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-nota text-tenue">Paso {paso} de 3 · {PASOS[paso - 1]}</p>
        <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((n) => <span key={n} className={`h-1.5 rounded ${paso >= n ? 'bg-anil' : 'bg-arena'}`} />)}
        </div>
      </div>

      {paso === 1 && (
        <>
          <a href="tel:911" className="flex items-center gap-2.5 rounded-2xl bg-riesgo-critico-fondo px-3.5 py-3 text-texto leading-snug text-[#7F1414] no-underline">
            <Icono nombre="telefono" tam={22} className="text-riesgo-critico" />
            <span>Si alguien está en peligro, <strong>llama al 911</strong> primero.</span>
          </a>
          <fieldset>
            <legend className="mb-2.5 text-subtitulo font-bold">¿Qué está pasando?</legend>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(TIPOS_REPORTE).map(([id, nombre]) => {
                const activo = tipo === id
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setTipo(id)}
                    className={`flex min-h-24 flex-col items-start gap-2.5 rounded-2xl p-3.5 text-left ${activo ? 'border-2 border-anil bg-anil-suave text-anil-oscuro' : 'border border-arena bg-white'}`}
                  >
                    <Icono nombre={id} tam={28} />
                    <span className="font-bold">{nombre}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </>
      )}

      {paso === 2 && (
        <>
          <div className="tarjeta flex items-center gap-2.5 px-3.5 py-3">
            <Icono nombre="ubicacion" className="text-anil" />
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
            Referencia del lugar {ubicacion && <span className="font-normal text-tenue">(opcional)</span>}
            <input className="campo font-normal" maxLength={250} placeholder="Ej. Calle Guadalupe, frente a la tienda" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
          </label>
          <label className="etiqueta">
            Describe lo que ves
            <textarea className="campo min-h-28 py-3 font-normal" maxLength={1000} placeholder="Ej. Se cayó un árbol y bloquea la calle" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </label>
        </>
      )}

      {paso === 3 && (
        <>
          <h2 className="text-subtitulo font-bold">Revisa tu reporte</h2>
          <dl className="tarjeta flex flex-col gap-3 p-4">
            <div><dt className="text-nota text-tenue">Tipo</dt><dd className="font-bold">{TIPOS_REPORTE[tipo]}</dd></div>
            <div>
              <dt className="text-nota text-tenue">Ubicación</dt>
              <dd className="font-bold">{referencia || (ubicacion ? 'Mi ubicación actual' : '')}</dd>
            </div>
            <div><dt className="text-nota text-tenue">Descripción</dt><dd>{descripcion}</dd></div>
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
