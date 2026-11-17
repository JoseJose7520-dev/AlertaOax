import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import regionRoutes from './region.routes.js'
import alertaRoutes from './alerta.routes.js'
import notificacionRoutes from './notificacion.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/regions', regionRoutes)
router.use('/alerts', alertaRoutes)
router.use('/notifications', notificacionRoutes)

export default router
