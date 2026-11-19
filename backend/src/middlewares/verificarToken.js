import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ErrorHttp from '../utils/ErrorHttp.js'
import { consulta } from '../config/db.js'

/**
 * Exige un token JWT válido: Authorization: Bearer <token>. Deja el usuario en req.usuario.
 * Además de la firma, revisa la cuenta en la base en cada petición: si el administrador la desactivó,
 * rechazó a la autoridad o le cambió el rol, el token viejo deja de servir de inmediato
 * (el rol que cuenta es el de la base, no el que venía en el token). También cierra las sesiones
 * abiertas antes del último cambio de contraseña.
 */
export async function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')
  if (tipo !== 'Bearer' || !token) {
    return next(new ErrorHttp(401, 'Falta el token de acceso. Inicia sesión.'))
  }
  let datos
  try {
    datos = jwt.verify(token, env.jwt.secreto)
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Tu sesión expiró. Inicia sesión de nuevo.' : 'Token inválido.'
    return next(new ErrorHttp(401, mensaje))
  }
  try {
    const { rows } = await consulta(
      `SELECT u.rol, u.activo, a.estado_validacion, FLOOR(EXTRACT(EPOCH FROM u.sesiones_desde))::bigint AS sesiones_desde
       FROM usuarios u LEFT JOIN autoridades a ON a.usuario_id = u.id
       WHERE u.id = $1`,
      [Number(datos.sub)],
    )
    const cuenta = rows[0]
    if (!cuenta || !cuenta.activo) return next(new ErrorHttp(401, 'Tu cuenta ya no está disponible. Inicia sesión de nuevo.'))
    // Token emitido antes de cambiar la contraseña: esa sesión ya se cerró
    if (cuenta.sesiones_desde && datos.iat < Number(cuenta.sesiones_desde)) {
      return next(new ErrorHttp(401, 'Tu contraseña cambió. Inicia sesión de nuevo.'))
    }
    if (cuenta.rol === 'autoridad' && cuenta.estado_validacion !== 'aprobada') {
      return next(new ErrorHttp(401, 'Tu acreditación de autoridad ya no está vigente. Contacta al administrador.'))
    }
    req.usuario = { id: Number(datos.sub), rol: cuenta.rol }
    next()
  } catch (err) {
    next(err)
  }
}
