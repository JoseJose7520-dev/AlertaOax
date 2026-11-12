import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ErrorHttp from '../utils/ErrorHttp.js'
import { buscarPorCorreo, buscarPorId, crearUsuario } from '../models/usuario.model.js'
import { buscarRegionPorNombre } from '../models/region.model.js'

const COSTO_BCRYPT = 10
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Hash de relleno: se compara aunque el correo no exista, para que el tiempo de respuesta no delate si la cuenta existe.
const HASH_FALSO = bcrypt.hashSync('relleno-sin-uso', COSTO_BCRYPT)

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '')

const datosPublicos = (u) => ({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol, region: u.region })

/**
 * POST /api/auth/register
 * Body: { nombre, correo, password, region, perfil: 'ciudadano' | 'autoridad', institucion? }
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
  // bcrypt solo usa los primeros 72 bytes de la contraseña
  if (typeof password !== 'string' || password.length < 6 || Buffer.byteLength(password) > 72) {
    throw new ErrorHttp(400, 'La contraseña debe tener entre 6 y 72 caracteres.')
  }
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
  if (!usuario || !coincide || !usuario.activo) throw new ErrorHttp(401, 'Correo o contraseña incorrectos.')

  if (perfil === 'ciudadano' && usuario.rol !== 'ciudadano') {
    throw new ErrorHttp(403, 'Esta cuenta no es de ciudadano. Elige el perfil de autoridad.')
  }
  if (perfil === 'autoridad' && usuario.rol === 'ciudadano') {
    throw new ErrorHttp(403, 'Esta cuenta es de ciudadano. Elige el perfil de ciudadano.')
  }

  if (usuario.rol === 'autoridad' && usuario.estado_validacion !== 'aprobada') {
    throw new ErrorHttp(
      403,
      usuario.estado_validacion === 'rechazada'
        ? 'Tu solicitud de autoridad fue rechazada. Contacta al administrador.'
        : 'Tu cuenta de autoridad está pendiente de validación por el administrador.',
    )
  }

  const token = jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, env.jwt.secreto, { expiresIn: env.jwt.expira })
  res.json({ token, usuario: datosPublicos(usuario) })
}

/** GET /api/auth/me — datos del usuario del token (sirve para restaurar la sesión). */
export async function perfilActual(req, res) {
  const usuario = await buscarPorId(req.usuario.id)
  if (!usuario || !usuario.activo) throw new ErrorHttp(401, 'La cuenta ya no está disponible.')
  res.json({ usuario: datosPublicos(usuario) })
}
