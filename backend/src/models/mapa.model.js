import { consulta } from '../config/db.js'

/** Albergues abiertos. Con regionId filtra; sin él, todos. Coordenadas como número para Leaflet. */
export async function listarAlbergues(regionId = null) {
  const params = []
  let filtro = 'WHERE a.abierto = TRUE'
  if (regionId) {
    params.push(regionId)
    filtro += ' AND a.region_id = $1'
  }
  const { rows } = await consulta(
    `SELECT a.id, a.nombre, a.direccion, a.latitud::float AS latitud, a.longitud::float AS longitud,
            a.capacidad, a.ocupacion, (a.capacidad - a.ocupacion) AS libres, a.telefono, a.fuente, a.es_ejemplo,
            r.nombre AS region
     FROM albergues a JOIN regiones r ON r.id = a.region_id
     ${filtro}
     ORDER BY r.nombre, a.nombre`,
    params,
  )
  return rows
}

export async function listarZonas(regionId = null) {
  const params = []
  let filtro = ''
  if (regionId) {
    params.push(regionId)
    filtro = 'WHERE z.region_id = $1'
  }
  const { rows } = await consulta(
    `SELECT z.id, z.nombre, z.tipo, z.nivel, z.latitud::float AS latitud, z.longitud::float AS longitud,
            z.radio_m, z.es_ejemplo, r.nombre AS region
     FROM zonas_riesgo z JOIN regiones r ON r.id = z.region_id
     ${filtro}
     ORDER BY CASE z.nivel WHEN 'critico' THEN 1 WHEN 'alto' THEN 2 WHEN 'medio' THEN 3 ELSE 4 END, z.nombre`,
    params,
  )
  return rows
}

export async function existeAlbergue(id) {
  const { rows } = await consulta('SELECT 1 FROM albergues WHERE id = $1', [id])
  return rows.length > 0
}
