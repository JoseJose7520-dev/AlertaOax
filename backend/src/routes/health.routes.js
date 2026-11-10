import { Router } from 'express'

const router = Router()

// GET /api/health  →  comprueba que la API está arriba
router.get('/', (req, res) => {
  res.json({
    estado: 'ok',
    servicio: 'AlertaOax API',
    hora: new Date().toISOString(),
  })
})

export default router
