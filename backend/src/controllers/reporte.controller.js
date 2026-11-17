import ErrorHttp from '../utils/ErrorHttp.js'
import { buscarPorId } from '../models/usuario.model.js'
import { buscarRegionPorNombre } from '../models/region.model.js'
import { actualizarEstado, buscarReporte, crearReporte, listarDeUsuario, listarParaAutoridad } from '../models/reporte.model.js'

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
  if (descripcion.length < 10 || descripcion.length > 1000) throw new ErrorHttp(400, 'Describe lo que ves (10 a 1000 caracteres).')
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

/** GET /api/reports?estado=recibido   (autoridad: los de su región; administrador: todos) */
export async function paraAutoridad(req, res) {
  const estado = texto(req.query.estado)
  if (estado && !ESTADOS.includes(estado)) throw new ErrorHttp(400, 'Estado inválido.')
  let regionId = null
  if (req.usuario.rol === 'autoridad') {
    const usuario = await buscarPorId(req.usuario.id)
    regionId = (await buscarRegionPorNombre(usuario?.region ?? ''))?.id ?? -1
  }
  res.json({ reportes: await listarParaAutoridad(regionId, estado || null) })
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
