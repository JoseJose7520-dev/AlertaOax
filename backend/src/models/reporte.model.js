import { consulta } from '../config/db.js'

const SELECT_REPORTE = `
  SELECT rp.id, rp.tipo, rp.descripcion, rp.latitud::float AS latitud, rp.longitud::float AS longitud,
         rp.referencia, rp.estado, rp.nota_autoridad, rp.creado_en, rp.actualizado_en,
         r.nombre AS region, COALESCE(u.nombre, 'Cuenta eliminada') AS ciudadano, u.telefono AS telefono_ciudadano
  FROM reportes rp
  JOIN regiones r      ON r.id = rp.region_id
  LEFT JOIN usuarios u ON u.id = rp.usuario_id` // LEFT: si la persona borró su cuenta, el reporte se conserva anónimo

export async function crearReporte({ usuarioId, regionId, tipo, descripcion, latitud, longitud, referencia }) {
  const { rows } = await consulta(
    `INSERT INTO reportes (usuario_id, region_id, tipo, descripcion, latitud, longitud, referencia)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [usuarioId, regionId, tipo, descripcion, latitud, longitud, referencia],
  )
  return buscarReporte(rows[0].id)
}

export async function buscarReporte(id) {
  const { rows } = await consulta(`${SELECT_REPORTE} WHERE rp.id = $1`, [id])
  return rows[0] ?? null
}

export async function listarDeUsuario(usuarioId) {
  const { rows } = await consulta(`${SELECT_REPORTE} WHERE rp.usuario_id = $1 ORDER BY rp.creado_en DESC LIMIT 50`, [usuarioId])
  return rows
}

/** Reportes para la autoridad: de su región (o todos si regionId es null). Pendientes primero. */
export async function listarParaAutoridad(regionId = null, estado = null) {
  const params = []
  const condiciones = []
  if (regionId) { params.push(regionId); condiciones.push(`rp.region_id = $${params.length}`) }
  if (estado === 'abiertos') condiciones.push("rp.estado <> 'atendido'") // recibidos y en atención
  else if (estado) { params.push(estado); condiciones.push(`rp.estado = $${params.length}`) }
  const filtro = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const { rows } = await consulta(
    `${SELECT_REPORTE} ${filtro}
     ORDER BY CASE rp.estado WHEN 'recibido' THEN 1 WHEN 'en_atencion' THEN 2 ELSE 3 END, rp.creado_en DESC
     LIMIT 100`,
    params,
  )
  return rows
}

export async function actualizarEstado(id, { estado, nota, autoridadId }) {
  const { rowCount } = await consulta(
    `UPDATE reportes
     SET estado = $2, nota_autoridad = COALESCE($3, nota_autoridad), atendido_por = $4, actualizado_en = NOW()
     WHERE id = $1`,
    [id, estado, nota, autoridadId],
  )
  return rowCount > 0
}

/** Todos los reportes para descargar en CSV (de una región o de todas si regionId es null), sin el límite de 100. */
export async function listarParaExportar(regionId = null, estado = null) {
  const params = []
  const condiciones = []
  if (regionId) { params.push(regionId); condiciones.push(`rp.region_id = $${params.length}`) }
  if (estado === 'abiertos') condiciones.push("rp.estado <> 'atendido'") // recibidos y en atención
  else if (estado) { params.push(estado); condiciones.push(`rp.estado = $${params.length}`) }
  const filtro = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const { rows } = await consulta(`${SELECT_REPORTE} ${filtro} ORDER BY rp.creado_en DESC`, params)
  return rows
}
