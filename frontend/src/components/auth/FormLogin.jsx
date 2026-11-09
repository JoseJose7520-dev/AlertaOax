import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLES } from '../../utils/constantes.js'
import { IconoEntrar, IconoSobre } from '../Iconos.jsx'
import CampoPassword from './CampoPassword.jsx'

export default function FormLogin({ perfil }) {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(true)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const esAutoridad = perfil === ROLES.AUTORIDAD

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await iniciarSesion({ correo: correo.trim(), password, perfil, recordar })
      navegar(ubicacion.state?.desde?.pathname ?? '/alertas', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4" noValidate={false}>
      <div>
        <label htmlFor="correo" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
          Correo electrónico oficial o personal <span className="text-alerta">*</span>
        </label>
        <div className="campo">
          <IconoSobre className="shrink-0 text-slate-400" />
          <input
            id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@oaxaca.gob.mx o personal" autoComplete="username" required
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-[11px] font-semibold text-slate-700">
            Contraseña institucional / personal <span className="text-alerta">*</span>
          </label>
          {/* TODO: flujo de recuperación de contraseña (fuera del alcance del MVP) */}
          <button type="button" className="text-[11px] font-semibold text-oax-700 hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <CampoPassword
          id="password" valor={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu clave de acceso" autoComplete="current-password"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-slate-300 accent-oax-700"
        />
        Mantener sesión activa en este dispositivo seguro
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-alerta">{error}</p>
      )}

      <button type="submit" className="btn-primario" disabled={cargando}>
        <IconoEntrar />
        {cargando ? 'Verificando…' : `Iniciar sesión como ${esAutoridad ? 'Autoridad' : 'Ciudadano'}`}
      </button>
    </form>
  )
}
