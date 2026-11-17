import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import regionRoutes from './region.routes.js'
import alertaRoutes from './alerta.routes.js'
import notificacionRoutes from './notificacion.routes.js'
import mapaRoutes from './mapa.routes.js'
import reporteRoutes from './reporte.routes.js'
import planRoutes from './plan.routes.js'
import adminRoutes from './admin.routes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/regions', regionRoutes)
router.use('/alerts', alertaRoutes)
router.use('/notifications', notificacionRoutes)
router.use('/', mapaRoutes) // /shelters y /risk-zones
router.use('/reports', reporteRoutes)
router.use('/plan', planRoutes)
router.use('/admin', adminRoutes)

export default router
