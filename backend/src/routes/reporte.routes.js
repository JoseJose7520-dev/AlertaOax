import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { verificarRol } from '../middlewares/verificarRol.js'
import { cambiarEstado, crear, exportarCsv, mios, paraAutoridad } from '../controllers/reporte.controller.js'

const router = Router()
router.use(verificarToken)

// Evita que una sola cuenta llene la base de reportes
const limitarReportes = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Has enviado muchos reportes. Espera un momento.' },
})

router.post('/', verificarRol('ciudadano'), limitarReportes, asyncHandler(crear))
router.get('/mine', verificarRol('ciudadano'), asyncHandler(mios))
router.get('/', verificarRol('autoridad', 'administrador'), asyncHandler(paraAutoridad))
router.get('/export', verificarRol('autoridad', 'administrador'), asyncHandler(exportarCsv))
router.patch('/:id/estado', verificarRol('autoridad', 'administrador'), asyncHandler(cambiarEstado))

export default router
