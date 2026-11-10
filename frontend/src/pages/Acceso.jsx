import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { inicioPorRol, useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { REGIONES } from '../utils/catalogos.js'
import Aviso from '../components/Aviso.jsx'
import Logo from '../components/Logo.jsx'

const VACIO = { nombre: '', correo: '', password: '', region: '', institucion: '' }

function Segmentado({ opciones, valor, onCambio, etiqueta }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className="grid grid-cols-2 gap-1 rounded-2xl bg-crema p-1">
      {opciones.map((o) => {
        const activo = valor === o.valor
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onCambio(o.valor)}
            className={`min-h-11 rounded-xl text-texto ${activo ? 'bg-white font-bold text-barro shadow-sm' : 'text-tenue'}`}
          >
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}

export default function Acceso() {
  const { usuario, iniciarSesion, registrar } = useAuth()
  const navegar = useNavigate()
  const desde = useLocation().state?.desde

  const [modo, setModo] = useState('entrar')
  const [perfil, setPerfil] = useState('ciudadano')
  const [form, setForm] = useState(VACIO)
  const [regiones, setRegiones] = useState(REGIONES)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    api.get('/regions').then((r) => setRegiones(r.regiones.map((x) => x.nombre))).catch(() => {})
  }, [])

  if (usuario) return <Navigate to={desde ?? inicioPorRol(usuario.rol)} replace />

  const esRegistro = modo === 'registro'
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setEnviando(true)
    try {
      if (esRegistro) {
        const r = await registrar({ ...form, perfil })
        if (r.pendiente) {
          setExito(r.mensaje + ' Te avisaremos cuando puedas entrar.')
          setModo('entrar')
          setForm((f) => ({ ...VACIO, correo: f.correo }))
          return
        }
      }
      // Al iniciar sesión no se pide el perfil: el servidor ya sabe el rol de cada cuenta
      const u = await iniciarSesion({ correo: form.correo, password: form.password })
      navegar(desde ?? inicioPorRol(u.rol), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-8">
      <div className="flex flex-col items-start gap-3.5">
        <Logo tam={48} conTexto={false} />
        <h1 className="text-titular leading-tight font-bold">Avisos de emergencia para tu comunidad</h1>
        <p className="text-tenue">Recibe las alertas de tu región, encuentra albergues y prepara a tu familia.</p>
      </div>

      <Segmentado
        etiqueta="¿Qué quieres hacer?"
        valor={modo}
        onCambio={(m) => { setModo(m); setError(''); setExito('') }}
        opciones={[{ valor: 'entrar', texto: 'Iniciar sesión' }, { valor: 'registro', texto: 'Crear cuenta' }]}
      />

      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        {esRegistro && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-texto font-bold">Soy…</legend>
            <Segmentado
              etiqueta="Perfil"
              valor={perfil}
              onCambio={setPerfil}
              opciones={[{ valor: 'ciudadano', texto: 'Ciudadano' }, { valor: 'autoridad', texto: 'Autoridad' }]}
            />
          </fieldset>
        )}

        {esRegistro && (
          <label className="etiqueta">
            Nombre completo
            <input className="campo font-normal" autoComplete="name" value={form.nombre} onChange={cambiar('nombre')} required />
          </label>
        )}
        <label className="etiqueta">
          Correo electrónico
          <input className="campo font-normal" type="email" autoComplete="email" inputMode="email" placeholder="tucorreo@ejemplo.com" value={form.correo} onChange={cambiar('correo')} required />
        </label>
        <label className="etiqueta">
          Contraseña
          <input className="campo font-normal" type="password" autoComplete={esRegistro ? 'new-password' : 'current-password'} placeholder={esRegistro ? 'Mínimo 6 caracteres' : ''} value={form.password} onChange={cambiar('password')} required />
        </label>
        {esRegistro && (
          <label className="etiqueta">
            {perfil === 'autoridad' ? '¿En qué región trabajas?' : '¿En qué región vives?'}
            <select className="campo font-normal" value={form.region} onChange={cambiar('region')} required>
              <option value="" disabled>Elige tu región</option>
              {regiones.map((r) => <option key={r}>{r}</option>)}
            </select>
            <span className="text-nota font-normal text-tenue">
              {perfil === 'autoridad' ? 'Verás los reportes ciudadanos de esta región.' : 'Solo te llegarán las alertas de esta región.'}
            </span>
          </label>
        )}
        {esRegistro && perfil === 'autoridad' && (
          <label className="etiqueta">
            Institución y cargo
            <input className="campo font-normal" placeholder="Ej. Protección Civil de Pochutla, coordinadora" value={form.institucion} onChange={cambiar('institucion')} required />
          </label>
        )}

        <Aviso tipo="error">{error}</Aviso>
        <Aviso tipo="exito">{exito}</Aviso>

        <button type="submit" className="btn-principal mt-1" disabled={enviando}>
          {enviando ? 'Un momento…' : esRegistro ? (perfil === 'autoridad' ? 'Enviar solicitud' : 'Crear mi cuenta') : 'Entrar'}
        </button>
      </form>

      <p className="mt-auto rounded-2xl bg-anil-claro px-4 py-3.5 text-nota leading-relaxed text-anil-oscuro">
        ¿Trabajas en Protección Civil? Crea tu cuenta como <strong>autoridad</strong>. El administrador revisará tu solicitud
        antes de que puedas publicar alertas.
      </p>
    </div>
  )
}
