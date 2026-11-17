import { Router } from 'express'
import ErrorHttp from '../utils/ErrorHttp.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { contarNoLeidas, listarDeUsuario, marcarLeida, marcarTodasLeidas } from '../models/notificacion.model.js'

const router = Router()
router.use(verificarToken)

// GET /api/notifications  →  { noLeidas, notificaciones: [...] }
router.get('/', asyncHandler(async (req, res) => {
  const [notificaciones, noLeidas] = await Promise.all([
    listarDeUsuario(req.usuario.id),
    contarNoLeidas(req.usuario.id),
  ])
  res.json({ noLeidas, notificaciones })
}))

// PATCH /api/notifications/leer-todas
router.patch('/leer-todas', asyncHandler(async (req, res) => {
  await marcarTodasLeidas(req.usuario.id)
  res.json({ mensaje: 'Notificaciones marcadas como leídas.' })
}))

// PATCH /api/notifications/:id/leida
router.patch('/:id/leida', asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  if (!(await marcarLeida(id, req.usuario.id))) throw new ErrorHttp(404, 'La notificación no existe.')
  res.json({ mensaje: 'Notificación marcada como leída.' })
}))

export default router
