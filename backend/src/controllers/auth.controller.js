import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ErrorHttp from '../utils/ErrorHttp.js'
import crypto from 'node:crypto'
import { buscarPorCorreo, buscarPorGoogle, buscarPorId, crearUsuario, vincularGoogle } from '../models/usuario.model.js'
import { buscarRegionPorNombre } from '../models/region.model.js'
import { crearRecuperacion, usarRecuperacion } from '../models/recuperacion.model.js'
import { enviarRecuperacion } from '../utils/correo.js'
import { verificarCredencialGoogle } from '../utils/google.js'

const COSTO_BCRYPT = 10
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Hash de relleno: se compara aunque el correo no exista, para que el tiempo de respuesta no delate si la cuenta existe.
const HASH_FALSO = bcrypt.hashSync('relleno-sin-uso', COSTO_BCRYPT)

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

const datosPublicos = (u) => ({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol, region: u.region })
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex')

/** Reglas de contraseña nuevas (registro y recuperación). bcrypt solo usa los primeros 72 bytes. */
function validarPassword(password, confirmacion) {
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new ErrorHttp(400, 'La contraseña debe tener entre 8 y 72 caracteres.')
  }
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

/**
 * POST /api/auth/register
 * Body: { nombre, correo, password, confirmarPassword?, region, perfil: 'ciudadano' | 'autoridad', institucion?, aceptaTerminos: true }
 * El rol administrador NO se puede crear por aquí (se crea con `npm run crear-admin`).
 */
export async function registrar(req, res) {
  const { password, perfil } = req.body ?? {}
  const nombre = texto(req.body?.nombre)
  const correo = texto(req.body?.correo).toLowerCase()
  const nombreRegion = texto(req.body?.region)
  const institucion = texto(req.body?.institucion)

  if (nombre.length < 2 || nombre.length > 120) throw new ErrorHttp(400, 'Escribe tu nombre completo (2 a 120 caracteres).')
  if (!REGEX_CORREO.test(correo) || correo.length > 160) throw new ErrorHttp(400, 'Escribe un correo electrónico válido.')
  validarPassword(password, req.body?.confirmarPassword)
  if (req.body?.aceptaTerminos !== true) throw new ErrorHttp(400, 'Debes aceptar los Términos y Condiciones y el Aviso de Privacidad.')
  if (perfil !== 'ciudadano' && perfil !== 'autoridad') throw new ErrorHttp(400, 'El perfil debe ser ciudadano o autoridad.')
  if (perfil === 'autoridad' && (institucion.length < 3 || institucion.length > 160)) {
    throw new ErrorHttp(400, 'Indica tu institución y cargo.')
  }

  const region = await buscarRegionPorNombre(nombreRegion)
  if (!region) throw new ErrorHttp(400, 'Elige una región válida.')

  if (await buscarPorCorreo(correo)) throw new ErrorHttp(409, 'Ya existe una cuenta con ese correo.')

  const passwordHash = await bcrypt.hash(password, COSTO_BCRYPT)
  await crearUsuario({ nombre, correo, passwordHash, rol: perfil, regionId: region.id, institucion })

  const pendiente = perfil === 'autoridad'
  res.status(201).json({
    pendiente,
    mensaje: pendiente
      ? 'Solicitud enviada. El administrador validará tu acreditación.'
      : 'Cuenta creada. Ya puedes iniciar sesión.',
  })
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
    throw new ErrorHttp(403, 'Esta cuenta es de ciudadano. Elige el perfil de ciudadano.')
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
 * POST /api/auth/google   Body: { credential, region?, aceptaTerminos? }
 * - Si la cuenta ya existe (por Google o por el mismo correo), inicia sesión.
 * - Si es nueva, primero responde { registroPendiente, nombre, correo } para que la persona elija su región
 *   y acepte los términos; con esos datos se crea como ciudadano. Las autoridades se registran con formulario.
 */
export async function accesoGoogle(req, res) {
  const { sub, correo, nombre } = await verificarCredencialGoogle(req.body?.credential)

  let usuario = await buscarPorGoogle(sub)
  if (!usuario) {
    usuario = await buscarPorCorreo(correo)
    if (usuario) {
      await vincularGoogle(usuario.id, sub)
      usuario = await buscarPorId(usuario.id)
    }
  }
  if (usuario) return res.json(emitirSesion(usuario))

  const region = await buscarRegionPorNombre(texto(req.body?.region))
  if (!region || req.body?.aceptaTerminos !== true) {
    return res.json({ registroPendiente: true, nombre, correo })
  }
  // Sin contraseña propia: se guarda un hash aleatorio; si después quiere entrar con correo, usa "¿Olvidaste tu contraseña?".
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), COSTO_BCRYPT)
  const id = await crearUsuario({ nombre: nombre.slice(0, 120), correo, passwordHash, rol: 'ciudadano', regionId: region.id, googleSub: sub })
  res.status(201).json(emitirSesion(await buscarPorId(id)))
}

/** GET /api/auth/me — datos del usuario del token (sirve para restaurar la sesión). */
export async function perfilActual(req, res) {
  const usuario = await buscarPorId(req.usuario.id)
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'La cuenta ya no está disponible.')
  res.json({ usuario: datosPublicos(usuario) })
}
