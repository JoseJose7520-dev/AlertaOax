import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ErrorHttp from '../utils/ErrorHttp.js'

/** Exige un token JWT válido: Authorization: Bearer <token>. Deja el usuario en req.usuario. */
export function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')
  if (tipo !== 'Bearer' || !token) {
    return next(new ErrorHttp(401, 'Falta el token de acceso. Inicia sesión.'))
  }
  try {
    const datos = jwt.verify(token, env.jwt.secreto)
    req.usuario = { id: Number(datos.sub), rol: datos.rol }
    next()
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Tu sesión expiró. Inicia sesión de nuevo.' : 'Token inválido.'
    next(new ErrorHttp(401, mensaje))
  }
}
