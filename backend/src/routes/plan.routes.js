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

// PUT /api/plan  Body: { mochila?: ['agua', ...], puntoReunion?, albergueId?, contactoExterno?, necesidades?, seccion?: 'plan' }
// La app ya solo guarda aquí la mochila; los planes familiares van en /api/plan/planes (AO-431).
// Los campos del plan único se aceptan para no romper clientes anteriores.
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

// ============================================================
// AO-431: varios planes familiares por cuenta
// ============================================================
const MAX_PLANES = 10
const SELECT_PLAN = `
  SELECT p.id, p.nombre, p.punto_reunion, p.albergue_id, a.nombre AS albergue, p.contacto_externo, p.necesidades,
         p.creado_en, p.actualizado_en
  FROM planes p LEFT JOIN albergues a ON a.id = p.albergue_id`

/** Valida los datos de un plan. Lo mínimo para que sirva: nombre, dónde se reúnen y a quién llamar. */
async function datosDelPlan(b = {}) {
  const nombre = texto(b.nombre, 60, 'nombre del plan')
  const puntoReunion = texto(b.puntoReunion, 250, 'punto de reunión')
  const contactoExterno = texto(b.contactoExterno, 160, 'contacto')
  const necesidades = texto(b.necesidades, 500, 'necesidades')
  if (!nombre || nombre.length < 2) throw new ErrorHttp(400, 'Ponle un nombre al plan (por ejemplo «Casa» o «Trabajo de mamá»).')
  if (!puntoReunion || puntoReunion.length < 5) throw new ErrorHttp(400, 'Escribe el punto de reunión de tu familia (al menos 5 caracteres).')
  if (!contactoExterno || contactoExterno.length < 5) throw new ErrorHttp(400, 'Escribe un contacto fuera de la región (nombre y teléfono).')
  if (!/\d{7,}/.test(contactoExterno.replace(/[\s-]/g, ''))) throw new ErrorHttp(400, 'Incluye el teléfono del contacto fuera de la región.')
  let albergueId = null
  if (b.albergueId !== undefined && b.albergueId !== null && b.albergueId !== '') {
    albergueId = Number(b.albergueId)
    if (!Number.isInteger(albergueId) || !(await existeAlbergue(albergueId))) throw new ErrorHttp(400, 'El albergue no existe.')
  }
  return { nombre, puntoReunion, contactoExterno, necesidades, albergueId }
}

const idDePlan = (v) => {
  const id = Number(v)
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  return id
}

async function buscarPlan(id, usuarioId) {
  const { rows } = await consulta(`${SELECT_PLAN} WHERE p.id = $1 AND p.usuario_id = $2`, [id, usuarioId])
  return rows[0] ?? null
}

// GET /api/plan/planes  →  { planes: [...] } del más reciente al más antiguo
router.get('/planes', asyncHandler(async (req, res) => {
  const { rows } = await consulta(`${SELECT_PLAN} WHERE p.usuario_id = $1 ORDER BY p.actualizado_en DESC, p.id DESC`, [req.usuario.id])
  res.json({ planes: rows, maximo: MAX_PLANES })
}))

// GET /api/plan/planes/:id
router.get('/planes/:id', asyncHandler(async (req, res) => {
  const plan = await buscarPlan(idDePlan(req.params.id), req.usuario.id)
  if (!plan) throw new ErrorHttp(404, 'El plan no existe.')
  res.json({ plan })
}))

// POST /api/plan/planes   Body: { nombre, puntoReunion, contactoExterno, albergueId?, necesidades? }
router.post('/planes', asyncHandler(async (req, res) => {
  const d = await datosDelPlan(req.body)
  const { rows: cuenta } = await consulta('SELECT COUNT(*)::int AS total FROM planes WHERE usuario_id = $1', [req.usuario.id])
  if (cuenta[0].total >= MAX_PLANES) throw new ErrorHttp(400, `Puedes guardar hasta ${MAX_PLANES} planes. Elimina uno que ya no uses.`)
  const { rows } = await consulta(
    `INSERT INTO planes (usuario_id, nombre, punto_reunion, albergue_id, contacto_externo, necesidades)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [req.usuario.id, d.nombre, d.puntoReunion, d.albergueId, d.contactoExterno, d.necesidades],
  )
  res.status(201).json({ plan: await buscarPlan(rows[0].id, req.usuario.id), mensaje: 'Plan creado. Ahora compártelo con tu familia.' })
}))

// PUT /api/plan/planes/:id   (mismo cuerpo que POST)
router.put('/planes/:id', asyncHandler(async (req, res) => {
  const id = idDePlan(req.params.id)
  const d = await datosDelPlan(req.body)
  const { rowCount } = await consulta(
    `UPDATE planes SET nombre = $3, punto_reunion = $4, albergue_id = $5, contacto_externo = $6, necesidades = $7, actualizado_en = NOW()
     WHERE id = $1 AND usuario_id = $2`,
    [id, req.usuario.id, d.nombre, d.puntoReunion, d.albergueId, d.contactoExterno, d.necesidades],
  )
  if (!rowCount) throw new ErrorHttp(404, 'El plan no existe.')
  res.json({ plan: await buscarPlan(id, req.usuario.id), mensaje: 'Cambios guardados.' })
}))

// DELETE /api/plan/planes/:id
router.delete('/planes/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await consulta('DELETE FROM planes WHERE id = $1 AND usuario_id = $2', [idDePlan(req.params.id), req.usuario.id])
  if (!rowCount) throw new ErrorHttp(404, 'El plan no existe.')
  res.json({ mensaje: 'Plan eliminado.' })
}))

export default router
