import { Router } from 'express'
import { env } from '../config/env.js'

const router = Router()

// GET /api/config  →  datos públicos que necesita el frontend (sin secretos)
router.get('/', (req, res) => {
  res.json({
    googleClientId: env.googleClientId || null,
    contacto: { whatsapp: env.contacto.whatsapp || null, correo: env.contacto.correo || null },
  })
})

export default router
