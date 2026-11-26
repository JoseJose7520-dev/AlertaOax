import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { REGIONES } from '../utils/catalogos.js'
import { PASSWORD_MAX, errorPassword } from '../utils/password.js'
import { INSTITUCION_MAX, errorInstitucion, errorNombre } from '../utils/validaciones.js'
import Aviso from '../components/Aviso.jsx'
import Campo from '../components/Campo.jsx'
import Confirmar from '../components/Confirmar.jsx'
import Icono from '../components/Icono.jsx'

const ROLES = { ciudadano: 'Ciudadano', autoridad: 'Autoridad', administrador: 'Administrador' }

const iniciales = (nombre = '') =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'

/** Nombre y (solo ciudadano) región. El correo se muestra pero no se cambia: es con el que se entra. */
function DatosPersonales() {
  const { usuario, actualizarUsuario } = useAuth()
  const esCiudadano = usuario.rol === 'ciudadano'
  const [nombre, setNombre] = useState(usuario.nombre)
  const [telefono, setTelefono] = useState(usuario.telefono ?? '')
  const [region, setRegion] = useState(usuario.region ?? '')
  const [regiones, setRegiones] = useState(REGIONES)
  const [intento, setIntento] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  useEffect(() => {
    if (!esCiudadano) return
    api.get('/regions').then((r) => setRegiones(r.regiones.map((x) => x.nombre))).catch(() => {})
  }, [esCiudadano])

  // La regla del nombre (nombre y apellido, solo letras) se aplica al cambiarlo
  const errNombre = nombre.trim() === usuario.nombre ? '' : errorNombre(nombre)
  const errTelefono = telefono && !/^\d{10}$/.test(telefono) ? 'Escribe 10 dígitos, por ejemplo 9511234567.' : ''
  const sinCambios = nombre.trim() === usuario.nombre && telefono === (usuario.telefono ?? '') &&
    (!esCiudadano || region === usuario.region)

  function cancelar() {
    setNombre(usuario.nombre); setTelefono(usuario.telefono ?? ''); setRegion(usuario.region ?? '')
    setIntento(false); setError(''); setExito('')
  }

  async function guardar(e) {
    e.preventDefault()
    setIntento(true); setError(''); setExito('')
    if (errNombre || errTelefono) return
    setGuardando(true)
    try {
      const r = await api.patch('/auth/perfil', esCiudadano ? { nombre, telefono, region } : { nombre, telefono })
      actualizarUsuario(r.usuario)
      setNombre(r.usuario.nombre); setTelefono(r.usuario.telefono ?? '')
      setExito(r.mensaje)
      setIntento(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-4 p-5" noValidate>
      <div>
        <h2 className="text-subtitulo font-bold">Información personal</h2>
        <p className="text-nota text-tenue">Estos datos aparecen en tu cuenta de AlertaOax.</p>
      </div>
      <Campo etiqueta="Nombre completo" icono="perfil" autoComplete="name" maxLength={120}
        value={nombre} onChange={(e) => { setNombre(e.target.value); setExito('') }} error={intento ? errNombre : undefined} />
      <Campo etiqueta="Teléfono (10 dígitos, opcional)" icono="telefono" tipo="tel" inputMode="numeric" autoComplete="tel-national"
        placeholder="9511234567" maxLength={10} value={telefono} error={intento ? errTelefono : undefined}
        onChange={(e) => { setTelefono(e.target.value.replace(/\D/g, '')); setExito('') }}
        ayuda="Solo lo ven las autoridades cuando atienden un reporte tuyo." />
      <Campo etiqueta="Correo electrónico" icono="correo" value={usuario.correo} readOnly disabled
        ayuda="Es el correo con el que entras; no se puede cambiar." />
      {esCiudadano && (
        <label className="etiqueta">
          Región donde vives
          <span className="relative">
            <Icono nombre="ubicacion" tam={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tenue" />
            <select className="campo pl-11 font-normal" value={region} onChange={(e) => { setRegion(e.target.value); setExito('') }}>
              {regiones.map((r) => <option key={r}>{r}</option>)}
            </select>
          </span>
          <span className="text-nota font-normal text-tenue">Te llegarán las alertas de esta región.</span>
        </label>
      )}
      <p className="text-nota text-tenue">
        ID de usuario: <strong className="text-tinta-suave">{usuario.id}</strong> (solo lectura)
        {usuario.creadoEn && <> · Cuenta creada el {new Date(usuario.creadoEn).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
      </p>
      <Aviso tipo="error">{error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-principal" disabled={guardando || sinCambios}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={cancelar} className="btn-neutro min-h-13" disabled={guardando || sinCambios}>
          Cancelar cambios
        </button>
      </div>
    </form>
  )
}

/**
 * Un ciudadano que trabaja en Protección Civil pide que su cuenta sea de autoridad.
 * Mientras el administrador decide, sigue usando la app como ciudadano.
 */
function SolicitudAutoridad() {
  const { usuario, actualizarUsuario } = useAuth()
  const solicitud = usuario.solicitudAutoridad
  const [abierto, setAbierto] = useState(false)
  const [institucion, setInstitucion] = useState('')
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const errInst = errorInstitucion(institucion)

  async function enviar(e) {
    e.preventDefault()
    setIntento(true); setError(''); setExito('')
    if (errInst) return
    setEnviando(true)
    try {
      const r = await api.post('/auth/solicitud-autoridad', { institucion })
      actualizarUsuario(r.usuario)
      setExito(r.mensaje); setAbierto(false); setInstitucion(''); setIntento(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="tarjeta flex flex-col gap-3 p-5" aria-labelledby="solicitud-titulo">
      <div className="flex items-start gap-3">
        <span className="icono-caja size-11 shrink-0 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="escudo" tam={22} /></span>
        <div>
          <h2 id="solicitud-titulo" className="text-subtitulo font-bold">¿Trabajas en Protección Civil?</h2>
          <p className="text-nota text-tenue">Solicita que tu cuenta sea de <strong>autoridad</strong> para publicar alertas y atender reportes en {usuario.region ? <>la región <strong>{usuario.region}</strong></> : 'tu región'}. El administrador validará tu cargo.</p>
        </div>
      </div>
      {solicitud?.estado === 'pendiente' ? (
        <Aviso tipo="info">Tu solicitud ({solicitud.institucion}) está en revisión. Te avisaremos por correo.</Aviso>
      ) : abierto ? (
        <form onSubmit={enviar} className="flex flex-col gap-3" noValidate>
          <Campo etiqueta="Institución y cargo" icono="escudo" maxLength={INSTITUCION_MAX}
            placeholder="Ej. Protección Civil de San Pedro Pochutla, coordinadora"
            value={institucion} onChange={(e) => setInstitucion(e.target.value)} error={intento ? errInst : undefined} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" className="btn-principal" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar solicitud'}</button>
            <button type="button" className="btn-neutro min-h-13" onClick={() => { setAbierto(false); setIntento(false) }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <>
          {solicitud?.estado === 'rechazada' && <Aviso tipo="info">Tu solicitud anterior no fue aprobada. Puedes enviar otra con tu institución y cargo completos.</Aviso>}
          <button type="button" className="btn-neutro self-start" onClick={() => { setAbierto(true); setExito('') }}>Solicitar cuenta de autoridad</button>
        </>
      )}
      <Aviso tipo="error">{error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>
    </section>
  )
}

/** Aviso por correo de alertas críticas y altas de la región. Se guarda al momento. */
function AvisosCorreo() {
  const { usuario, actualizarUsuario } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const activo = usuario.avisosCorreo !== false

  async function cambiar() {
    setGuardando(true); setError(''); setExito('')
    try {
      const r = await api.patch('/auth/avisos', { avisosCorreo: !activo })
      actualizarUsuario(r.usuario)
      setExito(r.mensaje)
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="tarjeta flex flex-col gap-3 p-5" aria-labelledby="avisos-titulo">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="icono-caja size-11 shrink-0 bg-riesgo-critico-fondo text-riesgo-critico-texto"><Icono nombre="correo" tam={22} /></span>
          <div>
            <h2 id="avisos-titulo" className="text-subtitulo font-bold">Avisos por correo</h2>
            <p className="text-nota text-tenue">Recibe un correo cuando se publique una alerta <strong>crítica o alta</strong> en {usuario.region ? <>la región <strong>{usuario.region}</strong></> : 'tu región'}, aunque no tengas la app abierta.</p>
          </div>
        </div>
        <button
          type="button" role="switch" aria-checked={activo} aria-labelledby="avisos-titulo" onClick={cambiar} disabled={guardando}
          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition ${activo ? 'bg-acento' : 'bg-linea-fuerte'} disabled:opacity-60`}
        >
          <span className={`inline-block size-6 rounded-full bg-white shadow transition ${activo ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
      <p className="text-nota font-semibold">{activo ? 'Activados' : 'Desactivados'}</p>
      <Aviso tipo="error">{error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>
    </section>
  )
}

/** Cambio de contraseña. Una cuenta creada con Google que nunca tuvo contraseña la crea sin escribir la actual. */
function CambiarPassword() {
  const { usuario, cerrarSesion } = useAuth()
  const tiene = usuario.tienePassword !== false
  const [mostrar, setMostrar] = useState(false)
  const tipo = mostrar ? 'text' : 'password'
  const vacio = { actual: '', nueva: '', confirmar: '' }
  const [f, setF] = useState(vacio)
  const [intento, setIntento] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const cambiar = (campo) => (e) => { setF((x) => ({ ...x, [campo]: e.target.value })); setExito('') }

  const errores = {}
  if (tiene && !f.actual) errores.actual = 'Escribe tu contraseña actual.'
  if (errorPassword(f.nueva)) errores.nueva = errorPassword(f.nueva)
  else if (tiene && f.nueva === f.actual) errores.nueva = 'Debe ser distinta de la actual.'
  if (f.confirmar !== f.nueva) errores.confirmar = 'Las contraseñas no coinciden.'
  const ver = (c) => (intento ? errores[c] : undefined)

  async function guardar(e) {
    e.preventDefault()
    setIntento(true); setError(''); setExito('')
    if (Object.keys(errores).length) return
    setGuardando(true)
    try {
      const r = await api.post('/auth/password', { actual: tiene ? f.actual : undefined, password: f.nueva, confirmarPassword: f.confirmar })
      // El servidor cerró todas las sesiones: se vuelve a entrar con la contraseña nueva
      // El aviso se deja en sessionStorage: al borrar la sesión, la ruta protegida manda a /acceso y ahí se muestra
      try { sessionStorage.setItem('avisoAcceso', r.mensaje) } catch { /* sin almacenamiento */ }
      cerrarSesion()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="tarjeta flex flex-col gap-4 p-5" noValidate>
      <div>
        <h2 className="text-subtitulo font-bold">{tiene ? 'Cambiar contraseña' : 'Crear contraseña'}</h2>
        <p className="text-nota text-tenue">
          {tiene
            ? 'Esta operación es independiente de los datos personales.'
            : 'Tu cuenta se creó con Google. Crea una contraseña si también quieres entrar con tu correo.'}
        </p>
      </div>
      {tiene && (
        <Campo etiqueta="Contraseña actual" icono="candado" tipo={tipo} autoComplete="current-password"
          value={f.actual} onChange={cambiar('actual')} error={ver('actual')}
          extra={<Link to="/olvide" state={{ correo: usuario.correo }} className="text-nota font-bold">¿No la recuerdas?</Link>} />
      )}
      <Campo etiqueta="Nueva contraseña" icono="candado" tipo={tipo} autoComplete="new-password"
        value={f.nueva} onChange={cambiar('nueva')} error={ver('nueva')} maxLength={PASSWORD_MAX} contador />
      <Campo etiqueta="Confirmar nueva contraseña" icono="candado" tipo={tipo} autoComplete="new-password"
        value={f.confirmar} onChange={cambiar('confirmar')} error={ver('confirmar')} maxLength={PASSWORD_MAX} contador
        ayuda={f.confirmar && f.confirmar === f.nueva ? '✓ Las contraseñas coinciden' : undefined} />
      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-medium">
        <input type="checkbox" checked={mostrar} onChange={(e) => setMostrar(e.target.checked)} className="size-5 accent-acento" />
        Mostrar contraseñas
      </label>
      <p className="text-nota text-tenue">Al cambiar la contraseña se cerrará tu sesión en todos tus dispositivos y tendrás que entrar de nuevo.</p>
      <Aviso tipo="error">{error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>
      <button type="submit" className="btn-principal self-start" disabled={guardando}>
        {guardando ? 'Guardando…' : tiene ? 'Cambiar contraseña' : 'Crear contraseña'}
      </button>
    </form>
  )
}

const PALABRA_ELIMINAR = 'ELIMINAR'

/**
 * AO-425: cancelación de datos (derechos ARCO). Pide la contraseña, o escribir ELIMINAR si la cuenta es de Google
 * y nunca tuvo contraseña. Los reportes se conservan sin nombre para no perder el historial de Protección Civil.
 */
function EliminarCuenta() {
  const { usuario, cerrarSesion } = useAuth()
  const tiene = usuario.tienePassword !== false
  const [abierto, setAbierto] = useState(false)
  const [valor, setValor] = useState('')
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const errValor = tiene
    ? (valor ? '' : 'Escribe tu contraseña.')
    : (valor.trim().toUpperCase() === PALABRA_ELIMINAR ? '' : `Escribe ${PALABRA_ELIMINAR} para confirmar.`)

  function abrir() { setValor(''); setIntento(false); setError(''); setAbierto(true) }

  async function confirmar() {
    setIntento(true); setError('')
    if (errValor) return
    setEnviando(true)
    try {
      const r = await api.borrar('/auth/cuenta', tiene ? { password: valor } : { confirmacion: valor.trim() })
      try { sessionStorage.setItem('avisoAcceso', r.mensaje) } catch { /* sin almacenamiento */ }
      setAbierto(false)
      cerrarSesion()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="tarjeta flex flex-col gap-3 border border-riesgo-critico/30 p-5" aria-labelledby="eliminar-titulo">
      <div className="flex items-start gap-3">
        <span className="icono-caja size-11 shrink-0 bg-riesgo-critico-fondo text-riesgo-critico-texto"><Icono nombre="eliminar" tam={22} /></span>
        <div>
          <h2 id="eliminar-titulo" className="text-subtitulo font-bold">Eliminar mi cuenta</h2>
          <p className="text-nota text-tenue">
            Se borran tu cuenta, tus planes familiares, tu mochila y tus notificaciones. No se puede deshacer.
            Los reportes que enviaste se conservan <strong>sin tu nombre</strong> para que Protección Civil no pierda el historial.
          </p>
        </div>
      </div>
      <button type="button" onClick={abrir}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-2xl border border-riesgo-critico/50 px-4 font-bold text-riesgo-critico-texto hover:bg-riesgo-critico-fondo">
        <Icono nombre="eliminar" tam={20} /> Eliminar mi cuenta
      </button>
      <Confirmar
        abierto={abierto}
        titulo="¿Eliminar tu cuenta para siempre?"
        tono="peligro"
        icono="eliminar"
        textoConfirmar="Sí, eliminar mi cuenta"
        textoCancelar="Cancelar"
        enviando={enviando}
        onConfirmar={confirmar}
        onCancelar={() => setAbierto(false)}
      >
        <p>Se borrará la cuenta <strong>{usuario.correo}</strong> y no podrás recuperarla. Si después quieres usar AlertaOax, tendrás que registrarte de nuevo.</p>
        {tiene ? (
          <Campo etiqueta="Escribe tu contraseña para confirmar" icono="candado" tipo="password" autoComplete="current-password"
            value={valor} onChange={(e) => setValor(e.target.value)} error={intento ? errValor : undefined} />
        ) : (
          <Campo etiqueta={`Tu cuenta es de Google. Escribe ${PALABRA_ELIMINAR} para confirmar`} icono="alerta" autoComplete="off"
            value={valor} onChange={(e) => setValor(e.target.value)} error={intento ? errValor : undefined} />
        )}
        <Aviso tipo="error">{error}</Aviso>
      </Confirmar>
    </section>
  )
}

/** «Mi perfil»: misma página para ciudadano, autoridad y administrador. */
export default function Perfil() {
  const { usuario, cerrarSesion } = useAuth()
  if (!usuario) return null
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div>
        <p className="rotulo text-tenue">Tu cuenta</p>
        <h1 className="text-titular font-bold">Mi perfil</h1>
      </div>

      <section className="tarjeta flex items-center gap-4 p-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-acento text-pantalla font-bold text-white" aria-hidden="true">
          {iniciales(usuario.nombre)}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate text-subtitulo font-bold">{usuario.nombre}</p>
          <p className="truncate text-nota text-tenue">{usuario.correo}</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-acento-claro px-2.5 py-0.5 text-nota font-bold text-acento dark:text-acento-fuerte">{ROLES[usuario.rol]}</span>
            <span className="rounded-full bg-riesgo-bajo-fondo px-2.5 py-0.5 text-nota font-semibold text-ok-texto">Cuenta activa</span>
            {usuario.region && <span className="rounded-full bg-hundido px-2.5 py-0.5 text-nota font-semibold text-tinta-suave">{usuario.region}</span>}
            {usuario.conGoogle && <span className="rounded-full bg-hundido px-2.5 py-0.5 text-nota font-semibold text-tinta-suave">Vinculada con Google</span>}
          </div>
        </div>
      </section>

      <DatosPersonales />
      <AvisosCorreo />
      {usuario.rol === 'ciudadano' && <SolicitudAutoridad />}
      <CambiarPassword />
      {usuario.rol !== 'administrador' && <EliminarCuenta />}

      <button type="button" onClick={cerrarSesion} className="btn-neutro self-start">
        <Icono nombre="salir" tam={20} /> Cerrar sesión
      </button>
    </div>
  )
}
