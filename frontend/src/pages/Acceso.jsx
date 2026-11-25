import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { inicioPorRol, useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import { useConfig } from '../hooks/useConfig.js'
import Trampa from '../components/Trampa.jsx'
import { REGIONES } from '../utils/catalogos.js'
import Aviso from '../components/Aviso.jsx'
import BotonGoogle from '../components/BotonGoogle.jsx'
import BotonTema from '../components/BotonTema.jsx'
import Campo from '../components/Campo.jsx'
import CodigoVerificacion from '../components/CodigoVerificacion.jsx'
import Icono from '../components/Icono.jsx'
import ModalTerminos from '../components/ModalTerminos.jsx'
import PanelIdentidad from '../components/PanelIdentidad.jsx'
import PieLegal from '../components/PieLegal.jsx'
import { PASSWORD_MAX, PASSWORD_MIN, errorPassword } from '../utils/password.js'
import { errorInstitucion, errorNombre } from '../utils/validaciones.js'

const VACIO = { nombre: '', correo: '', password: '', confirmar: '', region: '', institucion: '' }
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Dominios de ejemplo que nunca reciben correo (el servidor también los rechaza)
const DOMINIO_DE_EJEMPLO = /@((.+\.)?(example\.(com|net|org)|ejemplo\.(com|mx|org))|.+\.(test|example|invalid|localhost))$/i

/** Pestañas tipo píldora (Iniciar sesión / Crear cuenta). */
function Pestanas({ valor, onCambio }) {
  const opciones = [{ valor: 'entrar', texto: 'Iniciar sesión' }, { valor: 'registro', texto: 'Crear cuenta' }]
  return (
    <div role="tablist" aria-label="¿Qué quieres hacer?" className="grid grid-cols-2 gap-1 rounded-full border border-linea bg-hundido p-1">
      {opciones.map((o) => {
        const activo = valor === o.valor
        return (
          <button key={o.valor} type="button" role="tab" aria-selected={activo} onClick={() => onCambio(o.valor)}
            className={`min-h-11 rounded-full text-texto font-semibold transition ${activo ? 'bg-superficie text-tinta shadow-tarjeta' : 'text-tenue hover:text-tinta'}`}>
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}

/** Selector táctil de perfil con íconos. */
function SelectorPerfil({ valor, onCambio }) {
  const opciones = [
    { valor: 'ciudadano', texto: 'Ciudadano', detalle: 'Recibo alertas y reporto', icono: 'comunidad' },
    { valor: 'autoridad', texto: 'Autoridad', detalle: 'Protección Civil', icono: 'escudo' },
  ]
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-texto font-semibold">Soy…</legend>
      <div role="radiogroup" aria-label="Perfil" className="grid grid-cols-2 gap-2.5">
        {opciones.map((o) => {
          const activo = valor === o.valor
          return (
            <button key={o.valor} type="button" role="radio" aria-checked={activo} onClick={() => onCambio(o.valor)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${activo ? 'border-acento bg-acento-suave' : 'border-linea bg-superficie hover:border-borde'}`}>
              <span className={`icono-caja size-10 ${activo ? 'bg-acento text-white' : 'bg-hundido text-tenue'}`}><Icono nombre={o.icono} tam={22} peso={activo ? 'fill' : 'duotone'} /></span>
              <span className="flex flex-col">
                <span className="font-bold">{o.texto}</span>
                <span className="text-nota text-tenue">{o.detalle}</span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function CasillaTerminos({ marcado, onCambio, onLeer }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-linea bg-hundido/60 p-3.5">
      <input id="terminos" type="checkbox" checked={marcado} onChange={(e) => onCambio(e.target.checked)}
        className="mt-0.5 size-5.5 shrink-0 cursor-pointer accent-[var(--acento)]" />
      <label htmlFor="terminos" className="text-nota leading-relaxed text-tinta-suave">
        He leído y acepto los{' '}
        <button type="button" onClick={onLeer} className="font-bold text-acento underline underline-offset-2 dark:text-acento-fuerte">Términos y Condiciones, el Aviso Legal y la Política de Privacidad</button>{' '}
        de AlertaOax, y entiendo que es un canal complementario al 911.
      </label>
    </div>
  )
}

export default function Acceso() {
  const { usuario, iniciarSesion, registrar, verificarCorreo, accesoGoogle } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const desde = ubicacion.state?.desde

  const [modo, setModo] = useState(ubicacion.state?.modo ?? 'entrar')
  const [perfil, setPerfil] = useState('ciudadano')
  const [form, setForm] = useState(VACIO)
  const [acepta, setAcepta] = useState(false)
  const [verTerminos, setVerTerminos] = useState(false)
  const [regiones, setRegiones] = useState(REGIONES)
  const [pendienteGoogle, setPendienteGoogle] = useState(null) // { credential, nombre, correo }
  const [verificando, setVerificando] = useState(null) // { correo, password, aviso } mientras se escribe el código
  const [intento, setIntento] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [trampa, setTrampa] = useState('')
  const { googleClientId: googleId } = useConfig()
  const [error, setError] = useState('')
  const [exito, setExito] = useState(() => {
    try { return ubicacion.state?.exito ?? sessionStorage.getItem('avisoAcceso') ?? '' } catch { return ubicacion.state?.exito ?? '' }
  })
  // El aviso guardado (p. ej. «Tu contraseña se cambió») se muestra una sola vez
  useEffect(() => { try { sessionStorage.removeItem('avisoAcceso') } catch { /* sin almacenamiento */ } }, [])

  useEffect(() => {
    api.get('/regions').then((r) => setRegiones(r.regiones.map((x) => x.nombre))).catch(() => {})
  }, [])

  if (usuario) return <Navigate to={desde ?? inicioPorRol(usuario.rol)} replace />

  const esRegistro = modo === 'registro'
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  // Validación en el navegador (el servidor vuelve a validar todo)
  const errores = {}
  if (esRegistro) {
    if (errorNombre(form.nombre)) errores.nombre = errorNombre(form.nombre)
    if (!REGEX_CORREO.test(form.correo.trim())) errores.correo = 'Escribe un correo válido, por ejemplo nombre@gmail.com.'
    else if (DOMINIO_DE_EJEMPLO.test(form.correo.trim())) errores.correo = 'Ese correo es de ejemplo. Escribe tu correo real: te enviaremos un código.'
    if (errorPassword(form.password)) errores.password = errorPassword(form.password)
    if (form.confirmar !== form.password) errores.confirmar = 'Las contraseñas no coinciden.'
    if (!form.region) errores.region = 'Elige tu región.'
    if (perfil === 'autoridad' && errorInstitucion(form.institucion)) errores.institucion = errorInstitucion(form.institucion)
  } else {
    if (!REGEX_CORREO.test(form.correo.trim())) errores.correo = 'Escribe un correo válido.'
    if (!form.password) errores.password = 'Escribe tu contraseña.'
  }
  if (pendienteGoogle && perfil === 'autoridad' && errorInstitucion(form.institucion)) errores.institucion = errorInstitucion(form.institucion)
  const ver = (campo) => (intento ? errores[campo] : undefined)

  // Al cambiar entre «Iniciar sesión» y «Crear cuenta» se borra la contraseña escrita: la que se puso para
  // entrar no debe aparecer ya escrita en el registro (revisión del Equipo 1, punto 1)
  function cambiarModo(m) {
    setModo(m); setError(''); setExito(''); setIntento(false); setPendienteGoogle(null); setVerificando(null)
    setForm((f) => ({ ...f, password: '', confirmar: '' }))
  }

  // Al confirmar el código se entra directo. Quien pidió ser autoridad usa la app como ciudadano
  // mientras el administrador valida su cargo (en Inicio ve en qué va su solicitud).
  async function confirmarCodigo(codigo) {
    const r = await verificarCorreo(verificando.correo, codigo)
    navegar(desde ?? inicioPorRol(r.usuario.rol), { replace: true })
  }

  async function enviar(e) {
    e.preventDefault()
    setError(''); setExito(''); setIntento(true)
    if (Object.keys(errores).length) return
    setEnviando(true)
    try {
      if (esRegistro) {
        const r = await registrar({
          nombre: form.nombre, correo: form.correo, password: form.password, confirmarPassword: form.confirmar,
          region: form.region, institucion: form.institucion, perfil, aceptaTerminos: acepta, sitio_web: trampa,
        })
        if (r.verificarCorreo) {
          setVerificando({ correo: r.correo, aviso: r.mensaje })
          return
        }
      }
      const u = await iniciarSesion({ correo: form.correo, password: form.password })
      navegar(desde ?? inicioPorRol(u.rol), { replace: true })
    } catch (err) {
      // Cuenta creada pero sin confirmar: el servidor ya mandó un código nuevo
      if (err.datos?.verificarCorreo) {
        setVerificando({ correo: err.datos.correo, aviso: err.message })
        return
      }
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function conGoogle(credential, extra) {
    setError(''); setEnviando(true)
    try {
      const r = await accesoGoogle(credential, extra)
      if (r.registroPendiente) {
        setPendienteGoogle({ credential, nombre: r.nombre, correo: r.correo })
        setForm((f) => ({ ...f, region: '' })); setAcepta(false); setIntento(false)
        return
      }
      navegar(desde ?? inicioPorRol(r.usuario.rol), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  function terminarGoogle(e) {
    e.preventDefault()
    setIntento(true)
    if (!form.region || !acepta || (perfil === 'autoridad' && errorInstitucion(form.institucion))) return
    conGoogle(pendienteGoogle.credential, {
      region: form.region, aceptaTerminos: true, perfil,
      ...(perfil === 'autoridad' ? { institucion: form.institucion } : {}),
    })
  }

  const selectorRegion = (
    <label className="etiqueta">
      {perfil === 'autoridad' && (esRegistro || pendienteGoogle) ? '¿En qué región trabajas?' : '¿En qué región vives?'}
      <span className="relative">
        <Icono nombre="ubicacion" tam={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tenue" />
        <select className={`campo pl-11 font-normal ${ver('region') ? 'border-riesgo-critico' : ''}`} value={form.region} onChange={cambiar('region')} required>
          <option value="" disabled>Elige tu región</option>
          {regiones.map((r) => <option key={r}>{r}</option>)}
        </select>
      </span>
      <span className={`text-nota font-normal ${ver('region') ? 'font-semibold text-riesgo-critico-texto' : 'text-tenue'}`}>
        {ver('region') || (perfil === 'autoridad' && (esRegistro || pendienteGoogle) ? 'Verás los reportes ciudadanos de esta región.' : 'Solo te llegarán las alertas de esta región.')}
      </span>
    </label>
  )

  const camposAutoridad = (
    <>
      <Campo etiqueta="Institución y cargo" icono="escudo" placeholder="Ej. Protección Civil de San Pedro Pochutla, coordinadora"
        value={form.institucion} onChange={cambiar('institucion')} error={ver('institucion')} maxLength={160} />
      <Aviso tipo="info">Tu solicitud quedará <strong>pendiente de validación</strong>. Mientras el administrador confirma tu cargo puedes usar AlertaOax como ciudadano, y te avisaremos por correo cuando la revise.</Aviso>
    </>
  )

  return (
    <div className="min-h-[calc(100dvh-2rem)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="hidden lg:block lg:sticky lg:top-8 lg:h-[calc(100dvh-2rem)]">
        <PanelIdentidad accion={pendienteGoogle || verificando ? null : esRegistro
          ? { texto: 'Ya tengo cuenta: iniciar sesión', alHacer: () => cambiarModo('entrar') }
          : { texto: 'Crear mi cuenta gratis', alHacer: () => cambiarModo('registro') }} />
      </div>
      <div className="lg:hidden"><PanelIdentidad compacto /></div>

      <div className="relative flex flex-col px-5 pt-6 pb-24 sm:px-10 lg:min-h-[calc(100dvh-2rem)] lg:justify-center lg:py-12">
        <BotonTema className="absolute top-4 right-4 sm:top-6 sm:right-6" />
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          {verificando ? (
            <CodigoVerificacion
              key={verificando.correo}
              correo={verificando.correo}
              aviso={verificando.aviso}
              onVerificar={confirmarCodigo}
              onReenviar={() => api.post('/auth/reenviar-codigo', { correo: verificando.correo, sitio_web: trampa })}
              onCambiarCorreo={() => { setVerificando(null); setModo('registro'); setError(''); setExito('') }}
              onVolver={() => cambiarModo('entrar')}
            />
          ) : pendienteGoogle ? (
            <form onSubmit={terminarGoogle} className="flex flex-col gap-5" noValidate>
              <div>
                <p className="rotulo text-acento dark:text-acento-fuerte">Último paso</p>
                <h2 className="mt-1 text-pantalla font-bold">Completa tu registro</h2>
                <p className="mt-1.5 text-tenue">Entraste como <strong className="text-tinta">{pendienteGoogle.correo}</strong>. Elige tu perfil y tu región. Google ya confirmó tu correo, así que no necesitas código.</p>
              </div>
              <SelectorPerfil valor={perfil} onCambio={setPerfil} />
              {selectorRegion}
              {perfil === 'autoridad' && camposAutoridad}
              <CasillaTerminos marcado={acepta} onCambio={setAcepta} onLeer={() => setVerTerminos(true)} />
              {intento && !acepta && <p className="-mt-3 text-nota font-semibold text-riesgo-critico-texto">Debes aceptar los términos para continuar.</p>}
              <Aviso tipo="error">{error}</Aviso>
              <button type="submit" className="btn-principal" disabled={enviando || !acepta}>{enviando ? 'Un momento…' : perfil === 'autoridad' ? 'Enviar solicitud' : 'Crear mi cuenta'}</button>
              <button type="button" onClick={() => setPendienteGoogle(null)} className="btn-neutro">Cancelar</button>
            </form>
          ) : (
            <>
              <div className="pr-12">
                <h2 className="text-titular font-bold">{esRegistro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
                <p className="mt-1.5 text-tenue">{esRegistro ? 'Recibe las alertas de tu región y prepara a tu familia.' : 'Entra para ver las alertas de tu región.'}</p>
              </div>

              <Pestanas valor={modo} onCambio={cambiarModo} />

              <form onSubmit={enviar} className="relative flex flex-col gap-4" noValidate>
                <Trampa valor={trampa} onCambio={setTrampa} />
                {esRegistro && <SelectorPerfil valor={perfil} onCambio={setPerfil} />}
                {esRegistro && (
                  <Campo etiqueta="Nombre completo" icono="perfil" autoComplete="name" value={form.nombre} onChange={cambiar('nombre')} error={ver('nombre')} />
                )}
                <Campo etiqueta="Correo electrónico" icono="correo" tipo="email" autoComplete="email" inputMode="email"
                  placeholder="nombre@gmail.com" value={form.correo} onChange={cambiar('correo')} error={ver('correo')} />
                <Campo etiqueta="Contraseña" icono="candado" tipo="password" autoComplete={esRegistro ? 'new-password' : 'current-password'}
                  placeholder={esRegistro ? `${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres, con letras y números` : ''} value={form.password} onChange={cambiar('password')} error={ver('password')}
                  maxLength={esRegistro ? PASSWORD_MAX : undefined} contador={esRegistro}
                  extra={!esRegistro && <Link to="/olvide" state={{ correo: form.correo }} className="text-nota font-bold">¿Olvidaste tu contraseña?</Link>} />
                {esRegistro && (
                  <Campo etiqueta="Confirmar contraseña" icono="candado" tipo="password" autoComplete="new-password"
                    value={form.confirmar} onChange={cambiar('confirmar')} error={ver('confirmar')} maxLength={PASSWORD_MAX} contador
                    ayuda={form.confirmar && form.confirmar === form.password ? '✓ Las contraseñas coinciden' : undefined} />
                )}
                {esRegistro && selectorRegion}
                {esRegistro && perfil === 'autoridad' && camposAutoridad}
                {esRegistro && <CasillaTerminos marcado={acepta} onCambio={setAcepta} onLeer={() => setVerTerminos(true)} />}

                <Aviso tipo="error">{error}</Aviso>
                <Aviso tipo="exito">{exito}</Aviso>

                <button type="submit" className="btn-principal mt-1" disabled={enviando || (esRegistro && !acepta)}>
                  {enviando ? 'Un momento…' : esRegistro ? (perfil === 'autoridad' ? 'Enviar solicitud' : 'Crear mi cuenta') : <>Entrar a AlertaOax <Icono nombre="flecha" tam={20} peso="bold" /></>}
                </button>
              </form>

              {googleId && (
                <>
                  <div className="flex items-center gap-3 text-nota text-tenue" aria-hidden="true">
                    <span className="h-px flex-1 bg-linea" /> o accede con <span className="h-px flex-1 bg-linea" />
                  </div>
                  <BotonGoogle clientId={googleId} onCredencial={(c) => conGoogle(c)} texto={esRegistro ? 'signup_with' : 'continue_with'} />
                </>
              )}
            </>
          )}
          <PieLegal className="mt-4" />
        </div>
      </div>
      <ModalTerminos abierto={verTerminos} onCerrar={() => setVerTerminos(false)} onAceptar={() => { setAcepta(true); setVerTerminos(false) }} />
    </div>
  )
}
