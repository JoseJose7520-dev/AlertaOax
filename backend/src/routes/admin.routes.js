import { Router } from 'express'
import ErrorHttp from '../utils/ErrorHttp.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { verificarRol } from '../middlewares/verificarRol.js'
import { listarAutoridades, obtenerMetricas, validarAutoridad } from '../models/admin.model.js'

const router = Router()
router.use(verificarToken, verificarRol('administrador'))

const ESTADOS = ['pendiente', 'aprobada', 'rechazada']

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
  if (!(await validarAutoridad(id, decision, req.usuario.id))) throw new ErrorHttp(404, 'La solicitud de autoridad no existe.')
  res.json({ mensaje: decision === 'aprobada' ? 'Autoridad aprobada.' : 'Solicitud rechazada.' })
}))

export default router
