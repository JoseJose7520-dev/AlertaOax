import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { REGIONES, ROLES } from '../../utils/constantes.js'
import { IconoPin, IconoSobre, IconoUsuario, IconoUsuarioMas } from '../Iconos.jsx'
import CampoPassword from './CampoPassword.jsx'

export default function FormRegistro({ perfil, onRegistrado }) {
  const { registrar } = useAuth()
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [region, setRegion] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const esAutoridad = perfil === ROLES.AUTORIDAD

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const r = await registrar({
        nombre: nombre.trim(), correo: correo.trim(), password, region, perfil,
        ...(esAutoridad ? { institucion: institucion.trim() } : {}),
      })
      setResultado(r)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  if (resultado) {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-oax-50 p-5 text-sm" role="status">
        <p className="font-semibold text-oax-800">
          {resultado.pendiente ? 'Solicitud enviada' : 'Cuenta creada'}
        </p>
        <p className="text-slate-600">
          {resultado.pendiente
            ? 'El administrador verificará tu acreditación. Te avisaremos por correo cuando tu cuenta de autoridad esté activa.'
            : 'Ya puedes iniciar sesión con tu correo y contraseña.'}
        </p>
        <button type="button" className="btn-primario" onClick={onRegistrado}>Ir a iniciar sesión</button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
          Nombre completo <span className="text-alerta">*</span>
        </label>
        <div className="campo">
          <IconoUsuario className="shrink-0 text-slate-400" />
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre y apellidos" autoComplete="name" required />
        </div>
      </div>

      <div>
        <label htmlFor="correo-reg" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
          Correo electrónico <span className="text-alerta">*</span>
        </label>
        <div className="campo">
          <IconoSobre className="shrink-0 text-slate-400" />
          <input id="correo-reg" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="ejemplo@oaxaca.gob.mx o personal" autoComplete="email" required />
        </div>
      </div>

      <div>
        <label htmlFor="password-reg" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
          Contraseña <span className="text-alerta">*</span>
        </label>
        <CampoPassword id="password-reg" valor={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
      </div>

      <div>
        <label htmlFor="region" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
          Región donde vives <span className="text-alerta">*</span>
        </label>
        <div className="campo">
          <IconoPin className="shrink-0 text-slate-400" />
          <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} required>
            <option value="" disabled>Elige tu región</option>
            {REGIONES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {esAutoridad && (
        <div>
          <label htmlFor="institucion" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
            Institución y cargo <span className="text-alerta">*</span>
          </label>
          <div className="campo">
            <input id="institucion" value={institucion} onChange={(e) => setInstitucion(e.target.value)} placeholder="Ej. Protección Civil municipal — Coordinador" required />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">Tu cuenta quedará pendiente hasta que el administrador valide tu acreditación.</p>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-alerta">{error}</p>}

      <button type="submit" className="btn-primario" disabled={cargando}>
        <IconoUsuarioMas />
        {cargando ? 'Enviando…' : esAutoridad ? 'Solicitar cuenta de autoridad' : 'Crear cuenta ciudadana'}
      </button>
    </form>
  )
}
