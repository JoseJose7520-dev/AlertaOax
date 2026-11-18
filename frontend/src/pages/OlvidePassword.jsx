import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../services/api.js'
import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import Icono from '../components/Icono.jsx'
import Trampa from '../components/Trampa.jsx'
import LayoutAcceso from '../components/layout/LayoutAcceso.jsx'

/** Pide el correo y el servidor envía un enlace para crear una nueva contraseña. */
export default function OlvidePassword() {
  const [correo, setCorreo] = useState(useLocation().state?.correo ?? '')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState('')
  const [trampa, setTrampa] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setError('')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) return setError('Escribe un correo válido.')
    setEnviando(true)
    try {
      const r = await api.post('/auth/olvide', { correo, sitio_web: trampa })
      setEnviado(r.mensaje)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAcceso>
      <Link to="/acceso" className="inline-flex items-center gap-1.5 self-start font-semibold no-underline"><Icono nombre="regresar" tam={18} peso="bold" /> Volver a iniciar sesión</Link>
      <div className="flex flex-col gap-2">
        <span className="icono-caja size-14 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="candado" tam={30} /></span>
        <h2 className="mt-2 text-titular font-bold">¿Olvidaste tu contraseña?</h2>
        <p className="text-tenue">Escribe el correo de tu cuenta. Te enviaremos un enlace para crear una nueva; vence en 30 minutos.</p>
      </div>
      {enviado ? (
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 rounded-2xl border border-riesgo-bajo/30 bg-riesgo-bajo-fondo p-4 text-ok-texto" role="status">
            <Icono nombre="correo" tam={26} peso="fill" />
            <p className="leading-relaxed">{enviado}</p>
          </div>
          <button type="button" onClick={() => setEnviado('')} className="btn-neutro">Enviar a otro correo</button>
        </div>
      ) : (
        <form onSubmit={enviar} className="relative flex flex-col gap-4" noValidate>
          <Trampa valor={trampa} onCambio={setTrampa} />
          <Campo etiqueta="Correo electrónico" icono="correo" tipo="email" autoComplete="email" inputMode="email"
            placeholder="tucorreo@ejemplo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <Aviso tipo="error">{error}</Aviso>
          <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar enlace'}</button>
        </form>
      )}
    </LayoutAcceso>
  )
}
