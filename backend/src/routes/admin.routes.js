import { Router } from 'express'
import ErrorHttp from '../utils/ErrorHttp.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { verificarRol } from '../middlewares/verificarRol.js'
import { env } from '../config/env.js'
import { enviarResultadoAutoridad } from '../utils/correo.js'
import { cambiarActivo, listarAutoridades, listarUsuarios, obtenerMetricas, validarAutoridad } from '../models/admin.model.js'

const router = Router()
router.use(verificarToken, verificarRol('administrador'))

const ESTADOS = ['pendiente', 'aprobada', 'rechazada']
const ROLES = ['ciudadano', 'autoridad', 'administrador']

// GET /api/admin/users?rol=ciudadano&buscar=maria&pagina=1
router.get('/users', asyncHandler(async (req, res) => {
  const rol = typeof req.query.rol === 'string' ? req.query.rol : ''
  if (rol && !ROLES.includes(rol)) throw new ErrorHttp(400, 'Rol inválido.')
  const buscar = typeof req.query.buscar === 'string' ? req.query.buscar.trim().slice(0, 80) : ''
  const pagina = Math.max(1, Number.parseInt(req.query.pagina, 10) || 1)
  res.json(await listarUsuarios({ rol: rol || null, buscar, pagina }))
}))

// PATCH /api/admin/users/:id/activo   Body: { activo: true | false }
// Una cuenta desactivada no puede entrar y sus sesiones abiertas dejan de servir. Se puede volver a activar.
router.patch('/users/:id/activo', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  if (typeof req.body?.activo !== 'boolean') throw new ErrorHttp(400, 'Indica si la cuenta queda activa (true) o desactivada (false).')
  if (id === req.usuario.id) throw new ErrorHttp(400, 'No puedes desactivar tu propia cuenta.')
  const usuario = await cambiarActivo(id, req.body.activo)
  if (!usuario) throw new ErrorHttp(404, 'La cuenta no existe.')
  res.json({
    usuario,
    mensaje: usuario.activo
      ? `La cuenta de ${usuario.nombre} está activa de nuevo.`
      : `La cuenta de ${usuario.nombre} quedó desactivada y se cerraron sus sesiones.`,
  })
}))

// GET /api/admin/metrics
router.get('/metrics', asyncHandler(async (req, res) => {
  res.json({ metricas: await obtenerMetricas() })
}))

// GET /api/admin/authorities?estado=pendiente
router.get('/authorities', asyncHandler(async (req, res) => {
  const estado = typeof req.query.estado === 'string' ? req.query.estado : ''
  if (estado && !ESTADOS.includes(estado)) throw new ErrorHttp(400, 'Estado inválido.')
  res.json({ autoridades: await listarAutoridades(estado || null) })
}))

// PUT /api/admin/authorities/:id/validate   Body: { decision: 'aprobada' | 'rechazada' }
router.put('/authorities/:id/validate', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const decision = req.body?.decision
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  if (decision !== 'aprobada' && decision !== 'rechazada') throw new ErrorHttp(400, 'La decisión debe ser aprobada o rechazada.')
  const persona = await validarAutoridad(id, decision, req.usuario.id)
  if (!persona) throw new ErrorHttp(404, 'La solicitud de autoridad no existe.')
  // Se le avisa por correo en segundo plano: así sabe la respuesta sin tener que intentar entrar
  if (persona.correo) {
    enviarResultadoAutoridad({ para: persona.correo, nombre: persona.nombre, region: persona.region, aprobada: decision === 'aprobada', enlace: env.appUrl })
      .catch((err) => console.error('[correo] No se pudo avisar el resultado de la solicitud:', err.message))
  }
  res.json({
    mensaje: decision === 'aprobada'
      ? 'Autoridad aprobada. Le avisamos por correo y ya puede publicar alertas.'
      : 'Solicitud rechazada. Le avisamos por correo; su cuenta sigue activa como ciudadano.',
  })
}))

export default router
