import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { listarRegiones } from '../models/region.model.js'

const router = Router()

// GET /api/regions  →  { regiones: [{ id, nombre }] }  (público: lo usa el formulario de registro)
router.get('/', asyncHandler(async (req, res) => {
  res.json({ regiones: await listarRegiones() })
}))

export default router
