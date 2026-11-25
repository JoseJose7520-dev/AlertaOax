import { Router } from 'express'
import ErrorHttp from '../utils/ErrorHttp.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { verificarRol } from '../middlewares/verificarRol.js'
import { consulta } from '../config/db.js'
import { existeAlbergue } from '../models/mapa.model.js'

const router = Router()
router.use(verificarToken, verificarRol('ciudadano'))

// Artículos válidos de la mochila de emergencia (mismos ids que el frontend)
const ARTICULOS = ['agua', 'comida', 'linterna', 'radio', 'botiquin', 'documentos', 'ropa', 'efectivo']
const texto = (v, max, campo) => {
  if (v === undefined || v === null) return null
  if (typeof v !== 'string') throw new ErrorHttp(400, `El campo ${campo} no es válido.`)
  const t = v.trim()
  if (t.length > max) throw new ErrorHttp(400, `El campo ${campo} es muy largo (máximo ${max}).`)
  return t || null
}

// GET /api/plan  →  { plan } (null si aún no lo guarda)
router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await consulta(
    `SELECT p.punto_reunion, p.albergue_id, a.nombre AS albergue, p.contacto_externo, p.necesidades,
            p.mochila, p.actualizado_en
     FROM planes_familiares p LEFT JOIN albergues a ON a.id = p.albergue_id
     WHERE p.usuario_id = $1`,
    [req.usuario.id],
  )
  res.json({ plan: rows[0] ?? null })
}))

// PUT /api/plan  Body: { puntoReunion?, albergueId?, contactoExterno?, necesidades?, mochila?: ['agua', ...], seccion?: 'plan' }
router.put('/', asyncHandler(async (req, res) => {
  const b = req.body ?? {}
  const puntoReunion = texto(b.puntoReunion, 250, 'punto de reunión')
  const contactoExterno = texto(b.contactoExterno, 160, 'contacto')
  const necesidades = texto(b.necesidades, 500, 'necesidades')
  let albergueId = null
  if (b.albergueId !== undefined && b.albergueId !== null && b.albergueId !== '') {
    albergueId = Number(b.albergueId)
    if (!Number.isInteger(albergueId) || !(await existeAlbergue(albergueId))) throw new ErrorHttp(400, 'El albergue no existe.')
  }
  // Al guardar el plan desde su pestaña (seccion: 'plan') se piden los datos mínimos para que sirva en una emergencia.
  // La mochila usa el mismo endpoint y se guarda sola, por eso ahí no se exigen.
  if (b.seccion === 'plan') {
    if (!puntoReunion || puntoReunion.length < 5) throw new ErrorHttp(400, 'Escribe el punto de reunión de tu familia (al menos 5 caracteres).')
    if (!contactoExterno || contactoExterno.length < 5) throw new ErrorHttp(400, 'Escribe un contacto fuera de la región (nombre y teléfono).')
    if (!/\d{7,}/.test(contactoExterno.replace(/[\s-]/g, ''))) throw new ErrorHttp(400, 'Incluye el teléfono del contacto fuera de la región.')
  }
  const mochila = Array.isArray(b.mochila) ? [...new Set(b.mochila)].filter((x) => ARTICULOS.includes(x)) : []

  await consulta(
    `INSERT INTO planes_familiares (usuario_id, punto_reunion, albergue_id, contacto_externo, necesidades, mochila, actualizado_en)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
     ON CONFLICT (usuario_id) DO UPDATE
     SET punto_reunion = EXCLUDED.punto_reunion, albergue_id = EXCLUDED.albergue_id,
         contacto_externo = EXCLUDED.contacto_externo, necesidades = EXCLUDED.necesidades,
         mochila = EXCLUDED.mochila, actualizado_en = NOW()`,
    [req.usuario.id, puntoReunion, albergueId, contactoExterno, necesidades, JSON.stringify(mochila)],
  )
  res.json({ mensaje: 'Plan guardado.' })
}))

export default router
