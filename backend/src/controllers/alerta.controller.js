import { enviarAvisoAlerta } from '../utils/correo.js'
import { env } from '../config/env.js'
import ErrorHttp from '../utils/ErrorHttp.js'
import { buscarPorId } from '../models/usuario.model.js'
import { buscarRegionPorNombre } from '../models/region.model.js'
import {
  autorDeAlerta, buscarAlerta, correosParaAviso, finalizarAlerta, listarActivas, listarPorAutor, publicarAlerta,
} from '../models/alerta.model.js'

export const TIPOS = ['sismo', 'huracan', 'inundacion', 'deslizamiento', 'otro']
export const NIVELES = ['critico', 'alto', 'medio', 'vigilancia']
const MAX_DIAS_VIGENCIA = 15

const texto = (v) => (typeof v === 'string' ? v.trim() : '')

/**
 * POST /api/alerts/publish   (autoridad aprobada o administrador)
 * Body: { tipo, nivel, region, titulo, descripcion, vigenteHasta (ISO 8601) }
 */
export async function publicar(req, res) {
  const tipo = texto(req.body?.tipo)
  const nivel = texto(req.body?.nivel)
  const titulo = texto(req.body?.titulo)
  const descripcion = texto(req.body?.descripcion)
  const vigente = new Date(req.body?.vigenteHasta)

  if (!TIPOS.includes(tipo)) throw new ErrorHttp(400, 'Elige un tipo de fenómeno válido.')
  if (!NIVELES.includes(nivel)) throw new ErrorHttp(400, 'Elige un nivel de riesgo válido.')
  if (titulo.length < 5 || titulo.length > 200) throw new ErrorHttp(400, 'El título debe tener entre 5 y 200 caracteres.')
  if (descripcion.length < 10 || descripcion.length > 2000) throw new ErrorHttp(400, 'Las indicaciones deben tener entre 10 y 2000 caracteres.')
  if (Number.isNaN(vigente.getTime())) throw new ErrorHttp(400, 'Indica hasta cuándo es vigente la alerta.')
  const ahora = Date.now()
  if (vigente.getTime() <= ahora) throw new ErrorHttp(400, 'La vigencia debe ser una fecha futura.')
  if (vigente.getTime() > ahora + MAX_DIAS_VIGENCIA * 864e5) throw new ErrorHttp(400, `La vigencia no puede pasar de ${MAX_DIAS_VIGENCIA} días.`)

  const region = await buscarRegionPorNombre(texto(req.body?.region))
  if (!region) throw new ErrorHttp(400, 'Elige una región válida.')

  // Una autoridad solo publica si el administrador ya la aprobó (se revisa en BD, no solo en el token)
  if (req.usuario.rol === 'autoridad') {
    const autor = await buscarPorId(req.usuario.id)
    if (!autor || autor.estado_validacion !== 'aprobada') {
      throw new ErrorHttp(403, 'Tu cuenta de autoridad no está aprobada para publicar alertas.')
    }
  }

  const { alertaId, notificados } = await publicarAlerta({
    autoridadId: req.usuario.id, regionId: region.id, tipo, nivel, titulo, descripcion, vigenteHasta: vigente.toISOString(),
  })
  const alerta = await buscarAlerta(alertaId)

  // Alertas críticas y altas: además se avisa por correo (en segundo plano, sin hacer esperar a quien publica)
  let avisosCorreo = 0
  if (nivel === 'critico' || nivel === 'alto') {
    const destinatarios = await correosParaAviso(region.id, req.usuario.id)
    avisosCorreo = destinatarios.length
    enviarAvisoAlerta({ destinatarios, alerta, enlace: `${env.appUrl}/alertas/${alertaId}` })
      .then((n) => console.log(`[correo] Aviso de alerta ${alertaId}: ${n} correo(s) enviados.`))
      .catch((err) => console.error(`[correo] No se pudo enviar el aviso de la alerta ${alertaId}:`, err.message))
  }
  const extra = avisosCorreo ? ` y se envía aviso por correo a ${avisosCorreo}` : ''
  res.status(201).json({ alerta, notificados, avisosCorreo, mensaje: `Alerta publicada. Se notificó a ${notificados} persona(s)${extra}.` })
}

/**
 * GET /api/alerts/active            → alertas vigentes de la región del usuario
 * GET /api/alerts/active?todas=1    → alertas vigentes de todo Oaxaca
 */
export async function activas(req, res) {
  if (req.query.todas === '1') {
    return res.json({ alertas: await listarActivas() })
  }
  const usuario = await buscarPorId(req.usuario.id)
  const region = usuario?.region ? await buscarRegionPorNombre(usuario.region) : null
  res.json({ region: region?.nombre ?? null, alertas: region ? await listarActivas(region.id) : [] })
}

/** GET /api/alerts/:id */
export async function detalle(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  const alerta = await buscarAlerta(id)
  if (!alerta) throw new ErrorHttp(404, 'La alerta no existe.')
  res.json({ alerta })
}

/** GET /api/alerts/mine   (autoridad o administrador) */
export async function mias(req, res) {
  res.json({ alertas: await listarPorAutor(req.usuario.id) })
}

/** PATCH /api/alerts/:id/finalizar   (su autor o un administrador) */
export async function finalizar(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  const autor = await autorDeAlerta(id)
  if (!autor) throw new ErrorHttp(404, 'La alerta no existe.')
  if (req.usuario.rol !== 'administrador' && autor !== req.usuario.id) {
    throw new ErrorHttp(403, 'Solo quien publicó la alerta puede finalizarla.')
  }
  if (!(await finalizarAlerta(id))) throw new ErrorHttp(409, 'La alerta ya no estaba vigente.')
  res.json({ mensaje: 'Alerta finalizada.' })
}
