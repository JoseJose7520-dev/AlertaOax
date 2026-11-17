import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { verificarRol } from '../middlewares/verificarRol.js'
import { activas, detalle, finalizar, mias, publicar } from '../controllers/alerta.controller.js'

const router = Router()

router.post('/publish', verificarToken, verificarRol('autoridad', 'administrador'), asyncHandler(publicar))
router.get('/active', verificarToken, asyncHandler(activas))
router.get('/mine', verificarToken, verificarRol('autoridad', 'administrador'), asyncHandler(mias))
router.get('/:id', verificarToken, asyncHandler(detalle))
router.patch('/:id/finalizar', verificarToken, verificarRol('autoridad', 'administrador'), asyncHandler(finalizar))

export default router
