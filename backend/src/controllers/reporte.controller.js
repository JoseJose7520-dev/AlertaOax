import ErrorHttp from '../utils/ErrorHttp.js'
import { errorDescripcionReporte } from '../utils/validaciones.js'
import { buscarPorId } from '../models/usuario.model.js'
import { buscarRegionPorNombre } from '../models/region.model.js'
import { actualizarEstado, buscarReporte, crearReporte, listarDeUsuario, listarParaAutoridad, listarParaExportar } from '../models/reporte.model.js'
import { generarCsv } from '../utils/csv.js'

export const TIPOS_REPORTE = ['inundacion', 'deslave', 'arbol', 'cable', 'vivienda', 'otro']
export const ESTADOS = ['recibido', 'en_atencion', 'atendido']

const texto = (v) => (typeof v === 'string' ? v.trim() : '')
const coordenada = (v, max) => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  if (!Number.isFinite(n) || Math.abs(n) > max) throw new ErrorHttp(400, 'La ubicación no es válida.')
  return n
}

/**
 * POST /api/reports   (ciudadano)
 * Body: { tipo, descripcion, latitud?, longitud?, referencia? }  — se guarda en la región del ciudadano.
 */
export async function crear(req, res) {
  const tipo = texto(req.body?.tipo)
  const descripcion = texto(req.body?.descripcion)
  const referencia = texto(req.body?.referencia) || null
  const latitud = coordenada(req.body?.latitud, 90)
  const longitud = coordenada(req.body?.longitud, 180)

  if (!TIPOS_REPORTE.includes(tipo)) throw new ErrorHttp(400, 'Elige qué está pasando.')
  // Obligatoria pero sin mínimo de caracteres: en una emergencia no hay tiempo de escribir mucho
  const errDescripcion = errorDescripcionReporte(descripcion)
  if (errDescripcion) throw new ErrorHttp(400, errDescripcion)
  if ((latitud === null) !== (longitud === null)) throw new ErrorHttp(400, 'La ubicación está incompleta.')
  if (latitud === null && !referencia) throw new ErrorHttp(400, 'Indica tu ubicación o una referencia del lugar.')
  if (referencia && referencia.length > 250) throw new ErrorHttp(400, 'La referencia es muy larga (máximo 250 caracteres).')

  const usuario = await buscarPorId(req.usuario.id)
  const region = usuario?.region ? await buscarRegionPorNombre(usuario.region) : null
  if (!region) throw new ErrorHttp(400, 'Tu cuenta no tiene una región asignada.')

  const reporte = await crearReporte({ usuarioId: req.usuario.id, regionId: region.id, tipo, descripcion, latitud, longitud, referencia })
  res.status(201).json({ reporte, mensaje: 'Reporte enviado. Estado: recibido.' })
}

/** GET /api/reports/mine   (ciudadano) */
export async function mios(req, res) {
  res.json({ reportes: await listarDeUsuario(req.usuario.id) })
}

/** Filtro común de la lista y la descarga: estado opcional y, para la autoridad, solo su región. */
async function filtroAutoridad(req) {
  const estado = texto(req.query.estado)
  // «abiertos» = recibidos + en atención (la tarjeta «Reportes abiertos» del resumen del administrador)
  if (estado && estado !== 'abiertos' && !ESTADOS.includes(estado)) throw new ErrorHttp(400, 'Estado inválido.')
  let regionId = null
  if (req.usuario.rol === 'autoridad') {
    const usuario = await buscarPorId(req.usuario.id)
    regionId = (await buscarRegionPorNombre(usuario?.region ?? ''))?.id ?? -1
  }
  return { regionId, estado: estado || null }
}

/** GET /api/reports?estado=recibido|en_atencion|atendido|abiertos   (autoridad: los de su región; administrador: todos) */
export async function paraAutoridad(req, res) {
  const { regionId, estado } = await filtroAutoridad(req)
  res.json({ reportes: await listarParaAutoridad(regionId, estado) })
}

const NOMBRE_TIPO = { inundacion: 'Inundación', deslave: 'Deslave', arbol: 'Árbol caído', cable: 'Cable caído', vivienda: 'Vivienda dañada', otro: 'Otro' }
const NOMBRE_ESTADO = { recibido: 'Recibido', en_atencion: 'En atención', atendido: 'Atendido' }
// «2026-11-25 20:02» en hora de Oaxaca: Excel la reconoce como fecha y se puede ordenar
const fechaMx = (d) => (d ? new Date(d).toLocaleString('sv-SE', { timeZone: 'America/Mexico_City', dateStyle: 'short', timeStyle: 'short' }) : '')

/**
 * GET /api/reports/export?estado=recibido   (autoridad: su región; administrador: todas)
 * Descarga los reportes en CSV (UTF-8 con BOM para que Excel lea bien los acentos).
 */
export async function exportarCsv(req, res) {
  const { regionId, estado } = await filtroAutoridad(req)
  const reportes = await listarParaExportar(regionId, estado)
  const csv = generarCsv(
    ['Folio', 'Tipo', 'Descripción', 'Referencia', 'Latitud', 'Longitud', 'Región', 'Estado', 'Nota de la autoridad', 'Recibido', 'Última actualización'],
    reportes.map((r) => [
      r.id, NOMBRE_TIPO[r.tipo] ?? r.tipo, r.descripcion, r.referencia, r.latitud, r.longitud, r.region,
      NOMBRE_ESTADO[r.estado] ?? r.estado, r.nota_autoridad, fechaMx(r.creado_en), fechaMx(r.actualizado_en),
    ]),
  )
  const fecha = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) // AAAA-MM-DD
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="reportes-alertaoax-${fecha}${estado ? `-${estado}` : ''}.csv"`)
  res.send(csv)
}

/** PATCH /api/reports/:id/estado   (autoridad de esa región o administrador)  Body: { estado, nota? } */
export async function cambiarEstado(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new ErrorHttp(400, 'Identificador inválido.')
  const estado = texto(req.body?.estado)
  const nota = texto(req.body?.nota) || null
  if (!ESTADOS.includes(estado)) throw new ErrorHttp(400, 'Estado inválido.')
  if (nota && nota.length > 500) throw new ErrorHttp(400, 'La nota es muy larga (máximo 500 caracteres).')

  const reporte = await buscarReporte(id)
  if (!reporte) throw new ErrorHttp(404, 'El reporte no existe.')
  if (req.usuario.rol === 'autoridad') {
    const usuario = await buscarPorId(req.usuario.id)
    if (usuario?.estado_validacion !== 'aprobada') throw new ErrorHttp(403, 'Tu cuenta de autoridad no está aprobada.')
    if (usuario.region !== reporte.region) throw new ErrorHttp(403, 'Este reporte es de otra región.')
  }

  await actualizarEstado(id, { estado, nota, autoridadId: req.usuario.id })
  res.json({ reporte: await buscarReporte(id), mensaje: 'Estado del reporte actualizado.' })
}
