import { Router } from 'express'
import { probarConexion } from '../config/db.js'

const router = Router()

// GET /api/health  →  estado de la API y de la base de datos
router.get('/', async (req, res) => {
  const hora = new Date().toISOString()
  try {
    await probarConexion()
    res.json({ estado: 'ok', servicio: 'AlertaOax API', baseDeDatos: 'conectada', hora })
  } catch {
    res.status(503).json({ estado: 'degradado', servicio: 'AlertaOax API', baseDeDatos: 'sin conexión', hora })
  }
})

export default router
