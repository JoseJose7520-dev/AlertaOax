import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { buscarRegionPorNombre } from '../models/region.model.js'
import { listarAlbergues, listarZonas } from '../models/mapa.model.js'

const router = Router()

/** ?region=Costa filtra; ?region=todas o sin parámetro devuelve todo Oaxaca. */
async function regionDeConsulta(req) {
  const nombre = typeof req.query.region === 'string' ? req.query.region.trim() : ''
  if (!nombre || nombre === 'todas') return null
  const region = await buscarRegionPorNombre(nombre)
  return region?.id ?? -1 // región inexistente → lista vacía
}

// GET /api/shelters?region=Costa
router.get('/shelters', verificarToken, asyncHandler(async (req, res) => {
  res.json({ albergues: await listarAlbergues(await regionDeConsulta(req)) })
}))

// GET /api/risk-zones?region=Costa
router.get('/risk-zones', verificarToken, asyncHandler(async (req, res) => {
  res.json({ zonas: await listarZonas(await regionDeConsulta(req)) })
}))

export default router
