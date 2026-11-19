import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api.js'
import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import Icono from '../components/Icono.jsx'
import LayoutAcceso from '../components/layout/LayoutAcceso.jsx'
import { PASSWORD_MAX, PASSWORD_MIN, errorPassword } from '../utils/password.js'

/** Pantalla a la que llega el enlace del correo: crea la nueva contraseña. */
export default function RestablecerPassword() {
  const token = useSearchParams()[0].get('token') ?? ''
  const navegar = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const errPass = errorPassword(password)
  const errConf = confirmar !== password ? 'Las contraseñas no coinciden.' : ''

  async function enviar(e) {
    e.preventDefault()
    setIntento(true); setError('')
    if (errPass || errConf) return
    setEnviando(true)
    try {
      const r = await api.post('/auth/restablecer', { token, password, confirmarPassword: confirmar })
      navegar('/acceso', { replace: true, state: { exito: r.mensaje } })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <LayoutAcceso>
      <div className="flex flex-col gap-2">
        <span className="icono-caja size-14 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="candado" tam={30} /></span>
        <h2 className="mt-2 text-titular font-bold">Crea tu nueva contraseña</h2>
        <p className="text-tenue">Usa de {PASSWORD_MIN} a {PASSWORD_MAX} caracteres. Te recomendamos combinar letras y números.</p>
      </div>
      {!token ? (
        <>
          <Aviso tipo="error">El enlace está incompleto. Ábrelo de nuevo desde tu correo o pide uno nuevo.</Aviso>
          <Link to="/olvide" className="btn-principal">Pedir un enlace nuevo</Link>
        </>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
          <Campo etiqueta="Nueva contraseña" icono="candado" tipo="password" autoComplete="new-password"
            value={password} onChange={(e) => setPassword(e.target.value)} error={intento ? errPass : undefined} maxLength={PASSWORD_MAX} contador />
          <Campo etiqueta="Confirmar contraseña" icono="candado" tipo="password" autoComplete="new-password"
            value={confirmar} onChange={(e) => setConfirmar(e.target.value)} error={intento ? errConf : undefined} maxLength={PASSWORD_MAX} contador
            ayuda={confirmar && !errConf ? '✓ Las contraseñas coinciden' : undefined} />
          <Aviso tipo="error">{error}</Aviso>
          {error.includes('venció') && <Link to="/olvide" className="btn-neutro">Pedir un enlace nuevo</Link>}
          <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar contraseña'}</button>
        </form>
      )}
    </LayoutAcceso>
  )
}
