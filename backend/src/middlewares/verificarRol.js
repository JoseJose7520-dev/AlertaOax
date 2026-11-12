import ErrorHttp from '../utils/ErrorHttp.js'

/** Permite el paso solo a ciertos roles. Va después de verificarToken. Ej: verificarRol('autoridad', 'administrador') */
export const verificarRol = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    return next(new ErrorHttp(403, 'No tienes permiso para realizar esta acción.'))
  }
  next()
}
