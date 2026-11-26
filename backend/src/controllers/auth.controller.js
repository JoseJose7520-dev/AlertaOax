import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ErrorHttp from '../utils/ErrorHttp.js'
import crypto from 'node:crypto'
import {
  actualizarPerfil, borrarSinVerificar, buscarPorCorreo, buscarPorGoogle, buscarPorId, cambiarPassword,
  crearUsuario, marcarCorreoVerificado, vincularGoogle, cambiarAvisosCorreo, guardarSolicitudAutoridad,
  contarAlertasPublicadas, eliminarCuenta } from '../models/usuario.model.js'
import { buscarRegionPorNombre } from '../models/region.model.js'
import { crearRecuperacion, usarRecuperacion } from '../models/recuperacion.model.js'
import { comprobarCodigo, guardarCodigo, segundosDesdeEnvio } from '../models/verificacion.model.js'
import { enviarCodigoVerificacion, enviarRecuperacion } from '../utils/correo.js'
import { verificarCredencialGoogle } from '../utils/google.js'
import { errorInstitucion, errorNombre, errorPassword } from '../utils/validaciones.js'

const COSTO_BCRYPT = 10
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Dominios reservados para ejemplos y pruebas: nunca reciben correo (RFC 2606), como «tucorreo@ejemplo.com».
const DOMINIO_DE_EJEMPLO = /@((.+\.)?(example\.(com|net|org)|ejemplo\.(com|mx|org))|.+\.(test|example|invalid|localhost))$/
const MINUTOS_CODIGO = 10
const ESPERA_REENVIO_SEG = 60
// Hash de relleno: se compara aunque el correo no exista, para que el tiempo de respuesta no delate si la cuenta existe.
const HASH_FALSO = bcrypt.hashSync('relleno-sin-uso', COSTO_BCRYPT)

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

const datosPublicos = (u) => ({
  id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol, region: u.region,
  tienePassword: u.password_definida !== false, conGoogle: Boolean(u.google_sub),
  telefono: u.telefono ?? '', avisosCorreo: u.avisos_correo !== false, creadoEn: u.creado_en,
  // Un ciudadano que pidió ser autoridad ve en qué va su solicitud (pendiente o rechazada)
  solicitudAutoridad: u.rol === 'ciudadano' && u.estado_validacion
    ? { estado: u.estado_validacion, institucion: u.institucion }
    : null,
})
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex')
// El código se guarda con HMAC (y el id de la cuenta), así una copia de la base no basta para adivinarlo.
const hashCodigo = (usuarioId, codigo) => crypto.createHmac('sha256', env.jwt.secreto).update(`${usuarioId}:${codigo}`).digest('hex')

function validarCorreo(correo) {
  if (!REGEX_CORREO.test(correo) || correo.length > 160) throw new ErrorHttp(400, 'Escribe un correo electrónico válido.')
  if (DOMINIO_DE_EJEMPLO.test(correo)) {
    throw new ErrorHttp(400, 'Ese correo es de ejemplo y no puede recibir mensajes. Escribe tu correo real.')
  }
}

/** Reglas de contraseña nuevas (registro, recuperación y cambio): 8 a 32 caracteres con letras y números. */
function validarPassword(password, confirmacion) {
  const error = errorPassword(password)
  if (error) throw new ErrorHttp(400, error)
  if (confirmacion !== undefined && confirmacion !== password) {
    throw new ErrorHttp(400, 'Las contraseñas no coinciden.')
  }
}

/** Revisa que la cuenta pueda entrar (activa y, si es autoridad, aprobada) y emite el JWT. */
function emitirSesion(usuario) {
  if (!usuario.activo) throw new ErrorHttp(403, 'Tu cuenta está desactivada. Contacta al administrador.')
  if (usuario.rol === 'autoridad' && usuario.estado_validacion !== 'aprobada') {
    throw new ErrorHttp(
      403,
      usuario.estado_validacion === 'rechazada'
        ? 'Tu solicitud de autoridad fue rechazada. Contacta al administrador.'
        : 'Tu cuenta de autoridad está pendiente de validación por el administrador.',
    )
  }
  const token = jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, env.jwt.secreto, { expiresIn: env.jwt.expira })
  return { token, usuario: datosPublicos(usuario) }
}

/** Genera un código nuevo de 6 dígitos, guarda su hash y lo manda por correo. */
async function enviarCodigo(usuario) {
  const codigo = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  await guardarCodigo(usuario.id, hashCodigo(usuario.id, codigo), MINUTOS_CODIGO)
  try {
    await enviarCodigoVerificacion({ para: usuario.correo, nombre: usuario.nombre, codigo, minutos: MINUTOS_CODIGO })
  } catch (err) {
    console.error('[correo] no se pudo enviar el código:', err.message)
    throw new ErrorHttp(503, 'No pudimos enviar el código a tu correo en este momento. Inténtalo en unos minutos.')
  }
  return codigo
}

/**
 * POST /api/auth/register
 * Body: { nombre, correo, password, confirmarPassword?, region, perfil: 'ciudadano' | 'autoridad', institucion?, aceptaTerminos: true }
 * El rol administrador NO se puede crear por aquí (se crea con `npm run crear-admin`).
 * Quien elige «autoridad» entra como ciudadano con una solicitud pendiente: puede usar la app mientras
 * el administrador valida su cargo, y al aprobarla su cuenta pasa a ser de autoridad.
 */
export async function registrar(req, res) {
  const { password, perfil } = req.body ?? {}
  const nombre = texto(req.body?.nombre)
  const correo = texto(req.body?.correo).toLowerCase()
  const nombreRegion = texto(req.body?.region)
  const institucion = texto(req.body?.institucion)

  const errNombre = errorNombre(nombre)
  if (errNombre) throw new ErrorHttp(400, errNombre)
  validarCorreo(correo)
  validarPassword(password, req.body?.confirmarPassword)
  if (req.body?.aceptaTerminos !== true) throw new ErrorHttp(400, 'Debes aceptar los Términos y Condiciones y el Aviso de Privacidad.')
  if (perfil !== 'ciudadano' && perfil !== 'autoridad') throw new ErrorHttp(400, 'El perfil debe ser ciudadano o autoridad.')
  if (perfil === 'autoridad') {
    const errInst = errorInstitucion(institucion)
    if (errInst) throw new ErrorHttp(400, errInst)
  }

  const region = await buscarRegionPorNombre(nombreRegion)
  if (!region) throw new ErrorHttp(400, 'Elige una región válida.')

  const existente = await buscarPorCorreo(correo)
  if (existente?.correo_verificado) throw new ErrorHttp(409, 'Ya existe una cuenta con ese correo.')
  // Un registro anterior que nunca confirmó el correo se descarta: así se puede corregir un dato y volver a intentar.
  if (existente) await borrarSinVerificar(existente.id)

  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT)
  const id = await crearUsuario({
    nombre: nombre.replace(/\s+/g, ' '), correo, passwordHash, regionId: region.id,
    institucion: perfil === 'autoridad' ? institucion.replace(/\s+/g, ' ') : null, correoVerificado: false,
  })
  const codigo = await enviarCodigo({ id, correo, nombre })

  res.status(201).json({
    verificarCorreo: true,
    correo,
    ...(env.codigoPrueba ? { codigoPrueba: codigo } : {}),
    mensaje: `Te enviamos un código de 6 dígitos a ${correo}. Escríbelo para activar tu cuenta.`,
  })
}

/**
 * POST /api/auth/verificar   Body: { correo, codigo }
 * Confirma el correo con el código. Un ciudadano entra de inmediato; una autoridad queda en espera del administrador.
 */
export async function verificarCorreo(req, res) {
  const correo = texto(req.body?.correo).toLowerCase()
  const codigo = texto(req.body?.codigo).replace(/\s/g, '')
  if (!/^\d{6}$/.test(codigo)) throw new ErrorHttp(400, 'El código tiene 6 números.')

  const usuario = await buscarPorCorreo(correo)
  if (!usuario) throw new ErrorHttp(400, 'El código no es correcto.')
  if (usuario.correo_verificado) throw new ErrorHttp(400, 'Este correo ya está confirmado. Inicia sesión.')

  const resultado = await comprobarCodigo(usuario.id, hashCodigo(usuario.id, codigo))
  if (resultado === 'incorrecto') throw new ErrorHttp(400, 'El código no es correcto. Revísalo e inténtalo de nuevo.')
  if (resultado === 'vencido') {
    throw new ErrorHttp(400, 'El código venció o tuvo demasiados intentos. Pide uno nuevo.', { codigoVencido: true })
  }

  await marcarCorreoVerificado(usuario.id)
  const sesion = emitirSesion(await buscarPorId(usuario.id))
  if (usuario.estado_validacion === 'pendiente') {
    return res.json({
      ...sesion,
      pendiente: true,
      mensaje: 'Correo confirmado. Mientras el administrador valida tu cargo, puedes usar AlertaOax como ciudadano. Te avisaremos por correo.',
    })
  }
  res.json(sesion)
}

/** POST /api/auth/reenviar-codigo   Body: { correo }. Responde igual exista o no la cuenta. */
export async function reenviarCodigo(req, res) {
  const correo = texto(req.body?.correo).toLowerCase()
  if (!REGEX_CORREO.test(correo)) throw new ErrorHttp(400, 'Escribe un correo electrónico válido.')
  const usuario = await buscarPorCorreo(correo)
  if (usuario && !usuario.correo_verificado) {
    const seg = await segundosDesdeEnvio(usuario.id)
    if (seg !== null && seg < ESPERA_REENVIO_SEG) {
      throw new ErrorHttp(429, `Espera ${ESPERA_REENVIO_SEG - seg} segundos para pedir otro código.`, { esperar: ESPERA_REENVIO_SEG - seg })
    }
    await enviarCodigo(usuario)
  }
  res.json({ mensaje: 'Si la cuenta está pendiente de confirmar, te enviamos un código nuevo. Revisa también la carpeta de spam.' })
}

/**
 * POST /api/auth/login
 * Body: { correo, password, perfil? }  →  { token, usuario: { id, nombre, correo, rol, region } }
 * El perfil "autoridad" también admite al administrador (no hay una tercera opción en la pantalla de acceso).
 */
export async function iniciarSesion(req, res) {
  const { password, perfil } = req.body ?? {}
  const correo = texto(req.body?.correo).toLowerCase()
  if (!correo || typeof password !== 'string' || !password) {
    throw new ErrorHttp(400, 'Escribe tu correo y tu contraseña.')
  }

  const usuario = await buscarPorCorreo(correo)
  const coincide = await bcrypt.compare(password, usuario?.password_hash ?? HASH_FALSO)
  if (!usuario || !coincide) throw new ErrorHttp(401, 'Correo o contraseña incorrectos.')

  if (perfil === 'ciudadano' && usuario.rol !== 'ciudadano') {
    throw new ErrorHttp(403, 'Esta cuenta no es de ciudadano. Elige el perfil de autoridad.')
  }
  if (perfil === 'autoridad' && usuario.rol === 'ciudadano') {
    throw new ErrorHttp(403, usuario.estado_validacion === 'pendiente'
      ? 'Tu solicitud de autoridad sigue en revisión. Mientras tanto entra como ciudadano.'
      : 'Esta cuenta es de ciudadano. Elige el perfil de ciudadano.')
  }

  if (!usuario.correo_verificado) {
    // Se manda un código nuevo, salvo que se haya mandado uno hace menos de un minuto
    const seg = await segundosDesdeEnvio(usuario.id)
    if (seg === null || seg >= ESPERA_REENVIO_SEG) await enviarCodigo(usuario)
    throw new ErrorHttp(403, 'Antes de entrar confirma tu correo con el código de 6 dígitos que te enviamos.', { verificarCorreo: true, correo: usuario.correo })
  }

  res.json(emitirSesion(usuario))
}

/**
 * POST /api/auth/olvide   Body: { correo }
 * Siempre responde lo mismo, exista o no la cuenta, para no revelar qué correos están registrados.
 */
export async function olvidePassword(req, res) {
  const correo = texto(req.body?.correo).toLowerCase()
  if (!REGEX_CORREO.test(correo)) throw new ErrorHttp(400, 'Escribe un correo electrónico válido.')
  const usuario = await buscarPorCorreo(correo)
  if (usuario?.activo) {
    const token = crypto.randomBytes(32).toString('base64url')
    await crearRecuperacion(usuario.id, hashToken(token), 30)
    const enlace = `${env.appUrl}/restablecer?token=${token}`
    try {
      await enviarRecuperacion({ para: usuario.correo, nombre: usuario.nombre, enlace })
    } catch (err) {
      console.error('[correo] no se pudo enviar:', err.message)
      throw new ErrorHttp(503, 'No pudimos enviar el correo en este momento. Inténtalo en unos minutos.')
    }
  }
  res.json({ mensaje: 'Si el correo está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también la carpeta de spam.' })
}

/** POST /api/auth/restablecer   Body: { token, password, confirmarPassword } */
export async function restablecerPassword(req, res) {
  const token = texto(req.body?.token)
  if (token.length < 20) throw new ErrorHttp(400, 'El enlace no es válido.')
  validarPassword(req.body?.password, req.body?.confirmarPassword)
  const passwordHash = await bcrypt.hash(req.body.password, COSTO_BCRYPT)
  const usuarioId = await usarRecuperacion(hashToken(token), passwordHash)
  if (!usuarioId) throw new ErrorHttp(400, 'El enlace ya venció o ya se usó. Pide uno nuevo.')
  res.json({ mensaje: 'Listo. Ya puedes iniciar sesión con tu nueva contraseña.' })
}

/**
 * POST /api/auth/google   Body: { credential, region?, aceptaTerminos?, perfil?, institucion? }
 * - Si la cuenta ya existe (por Google o por el mismo correo), inicia sesión.
 * - Si es nueva, primero responde { registroPendiente, nombre, correo } para que la persona elija su perfil y región
 *   y acepte los términos. Con perfil «autoridad» se crea como ciudadano con la solicitud pendiente (igual que el
 *   formulario). No se pide el código de 6 dígitos: Google ya confirmó que el correo es de quien entra.
 */
export async function accesoGoogle(req, res) {
  const { sub, correo, nombre } = await verificarCredencialGoogle(req.body?.credential)

  let usuario = await buscarPorGoogle(sub)
  if (!usuario) {
    usuario = await buscarPorCorreo(correo)
    if (usuario) {
      const hashAleatorio = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), COSTO_BCRYPT)
      await vincularGoogle(usuario.id, sub, hashAleatorio)
      usuario = await buscarPorId(usuario.id)
    }
  }
  if (usuario) return res.json(emitirSesion(usuario))

  const region = await buscarRegionPorNombre(texto(req.body?.region))
  if (!region || req.body?.aceptaTerminos !== true) {
    return res.json({ registroPendiente: true, nombre, correo })
  }
  const esAutoridad = req.body?.perfil === 'autoridad'
  const institucion = texto(req.body?.institucion).replace(/\s+/g, ' ')
  if (esAutoridad) {
    const errInst = errorInstitucion(institucion)
    if (errInst) throw new ErrorHttp(400, errInst)
  }
  // Sin contraseña propia: se guarda un hash aleatorio; si después quiere entrar con correo, usa "¿Olvidaste tu contraseña?".
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), COSTO_BCRYPT)
  const id = await crearUsuario({
    nombre: nombre.slice(0, 120), correo, passwordHash, regionId: region.id, googleSub: sub, passwordDefinida: false,
    institucion: esAutoridad ? institucion : null,
  })
  const sesion = emitirSesion(await buscarPorId(id))
  res.status(201).json(esAutoridad
    ? { ...sesion, pendiente: true, mensaje: 'Tu solicitud de autoridad quedó en revisión. Mientras tanto puedes usar AlertaOax como ciudadano.' }
    : sesion)
}

/** GET /api/auth/me — datos del usuario del token (sirve para restaurar la sesión). */
export async function perfilActual(req, res) {
  const usuario = await buscarPorId(req.usuario.id)
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'La cuenta ya no está disponible.')
  res.json({ usuario: datosPublicos(usuario) })
}

/**
 * PATCH /api/auth/perfil   Body: { nombre, telefono?, region? }
 * Cualquier cuenta cambia su nombre. Solo el ciudadano cambia su región (la de una autoridad la valida el administrador).
 */
export async function editarPerfil(req, res) {
  const nombre = texto(req.body?.nombre).replace(/\s+/g, ' ')
  // La regla del nombre se aplica cuando se cambia (las cuentas viejas o de Google pueden traer un solo nombre)
  const actual = await buscarPorId(req.usuario.id)
  const errNombre = nombre === actual?.nombre ? (nombre ? '' : 'Escribe tu nombre.') : errorNombre(nombre)
  if (errNombre) throw new ErrorHttp(400, errNombre)
  const telefono = texto(req.body?.telefono).replace(/[\s-]/g, '')
  if (telefono && !/^\d{10}$/.test(telefono)) throw new ErrorHttp(400, 'El teléfono debe tener 10 dígitos, sin lada internacional.')

  let regionId
  if (req.body?.region !== undefined && req.usuario.rol === 'ciudadano') {
    const region = await buscarRegionPorNombre(texto(req.body.region))
    if (!region) throw new ErrorHttp(400, 'Elige una región válida.')
    regionId = region.id
  }
  await actualizarPerfil(req.usuario.id, { nombre, telefono, regionId })
  res.json({ mensaje: 'Tus datos se guardaron.', usuario: datosPublicos(await buscarPorId(req.usuario.id)) })
}

/**
 * POST /api/auth/password   Body: { actual?, password, confirmarPassword }
 * Pide la contraseña actual. Solo una cuenta creada con Google que nunca tuvo contraseña puede crear una sin ella.
 */
export async function cambiarMiPassword(req, res) {
  const usuario = await buscarPorId(req.usuario.id)
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'La cuenta ya no está disponible.')
  const { actual, password, confirmarPassword } = req.body ?? {}

  if (usuario.password_definida) {
    if (typeof actual !== 'string' || !actual) throw new ErrorHttp(400, 'Escribe tu contraseña actual.')
    if (!(await bcrypt.compare(actual, usuario.password_hash))) throw new ErrorHttp(400, 'La contraseña actual no es correcta.')
    if (actual === password) throw new ErrorHttp(400, 'La nueva contraseña debe ser distinta de la actual.')
  }
  validarPassword(password, confirmarPassword)

  await cambiarPassword(usuario.id, await bcrypt.hash(password, COSTO_BCRYPT))
  // cambiarPassword cierra todas las sesiones (sesiones_desde), incluida esta: hay que volver a entrar
  res.json({
    cerrarSesion: true,
    mensaje: usuario.password_definida
      ? 'Tu contraseña se cambió. Inicia sesión con la nueva contraseña.'
      : 'Listo. Inicia sesión con tu correo y tu nueva contraseña.',
  })
}

/**
 * PATCH /api/auth/avisos   Body: { avisosCorreo: boolean }
 * Activa o desactiva el aviso por correo cuando se publica una alerta crítica o alta en la región.
 */
export async function cambiarAvisos(req, res) {
  if (typeof req.body?.avisosCorreo !== 'boolean') throw new ErrorHttp(400, 'Indica si quieres recibir avisos por correo.')
  await cambiarAvisosCorreo(req.usuario.id, req.body.avisosCorreo)
  res.json({
    mensaje: req.body.avisosCorreo ? 'Te avisaremos por correo de las alertas críticas y altas de tu región.' : 'Ya no recibirás avisos de alertas por correo.',
    usuario: datosPublicos(await buscarPorId(req.usuario.id)),
  })
}

/**
 * POST /api/auth/solicitud-autoridad   (ciudadano)   Body: { institucion }
 * Un ciudadano pide que su cuenta pase a ser de autoridad en su región. Si ya tiene una solicitud en revisión
 * no puede mandar otra; si se la rechazaron, puede volver a intentarlo con datos corregidos.
 */
export async function solicitarAutoridad(req, res) {
  if (req.usuario.rol !== 'ciudadano') throw new ErrorHttp(400, 'Tu cuenta ya no es de ciudadano.')
  const institucion = texto(req.body?.institucion).replace(/\s+/g, ' ')
  const errInst = errorInstitucion(institucion)
  if (errInst) throw new ErrorHttp(400, errInst)
  const usuario = await buscarPorId(req.usuario.id)
  if (usuario?.estado_validacion === 'pendiente') throw new ErrorHttp(409, 'Ya tienes una solicitud en revisión.')
  if (!usuario?.region) throw new ErrorHttp(400, 'Elige primero tu región en «Mi perfil».')
  await guardarSolicitudAutoridad(req.usuario.id, institucion)
  res.status(201).json({
    mensaje: `Enviamos tu solicitud para ser autoridad en ${usuario.region}. Te avisaremos por correo cuando el administrador la revise.`,
    usuario: datosPublicos(await buscarPorId(req.usuario.id)),
  })
}

/** Palabra que escribe quien no tiene contraseña (cuenta de Google) para confirmar que quiere borrar su cuenta. */
export const PALABRA_ELIMINAR = 'ELIMINAR'

/**
 * DELETE /api/auth/cuenta   Body: { password }  (o { confirmacion: 'ELIMINAR' } si la cuenta es de Google y no tiene contraseña)
 * Cancelación de datos (derechos ARCO). El administrador no puede borrarse por aquí, y una autoridad
 * que ya publicó alertas oficiales tampoco: esas alertas son historial público y se pide al administrador desactivarla.
 */
export async function eliminarMiCuenta(req, res) {
  const usuario = await buscarPorId(req.usuario.id)
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'La cuenta ya no está disponible.')
  if (usuario.rol === 'administrador') {
    throw new ErrorHttp(403, 'La cuenta de administrador no se puede eliminar desde aquí. Pide a otro administrador que la dé de baja.')
  }

  const { password, confirmacion } = req.body ?? {}
  if (usuario.password_definida) {
    if (typeof password !== 'string' || !password) throw new ErrorHttp(400, 'Escribe tu contraseña para confirmar.')
    if (!(await bcrypt.compare(password, usuario.password_hash))) throw new ErrorHttp(400, 'La contraseña no es correcta.')
  } else if (texto(confirmacion).toUpperCase() !== PALABRA_ELIMINAR) {
    throw new ErrorHttp(400, `Escribe ${PALABRA_ELIMINAR} para confirmar.`)
  }

  if (usuario.rol === 'autoridad' && (await contarAlertasPublicadas(usuario.id)) > 0) {
    throw new ErrorHttp(409, 'Tu cuenta publicó alertas oficiales y deben quedar en el historial. Pide al administrador que desactive tu cuenta.')
  }

  await eliminarCuenta(usuario.id)
  res.json({ cerrarSesion: true, mensaje: 'Tu cuenta y tus datos personales se eliminaron. Tus reportes se conservan sin tu nombre.' })
}
