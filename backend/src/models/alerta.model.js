import { consulta, pool } from '../config/db.js'

const SELECT_ALERTA = `
  SELECT a.id, a.tipo, a.nivel, a.titulo, a.descripcion, a.emitida_en, a.vigente_hasta,
         r.nombre AS region,
         u.nombre AS autor,
         COALESCE(au.institucion, 'Administración AlertaOax') AS institucion,
         (a.vigente_hasta > NOW()) AS vigente
  FROM alertas a
  JOIN regiones r          ON r.id = a.region_id
  JOIN usuarios u          ON u.id = a.autoridad_id
  LEFT JOIN autoridades au ON au.usuario_id = u.id`

// Orden por gravedad: crítico primero
const ORDEN_NIVEL = `CASE a.nivel WHEN 'critico' THEN 1 WHEN 'alto' THEN 2 WHEN 'medio' THEN 3 ELSE 4 END`

/**
 * Publica una alerta y genera, en la MISMA transacción, una notificación para cada
 * usuario activo de la región. Si algo falla, no queda ni la alerta ni las notificaciones.
 */
export async function publicarAlerta({ autoridadId, regionId, tipo, nivel, titulo, descripcion, vigenteHasta }) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const { rows } = await cliente.query(
      `INSERT INTO alertas (autoridad_id, region_id, tipo, nivel, titulo, descripcion, vigente_hasta)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [autoridadId, regionId, tipo, nivel, titulo, descripcion, vigenteHasta],
    )
    const alertaId = rows[0].id
    const notif = await cliente.query(
      `INSERT INTO notificaciones (usuario_id, alerta_id)
       SELECT id, $1 FROM usuarios WHERE region_id = $2 AND activo = TRUE
       ON CONFLICT (usuario_id, alerta_id) DO NOTHING`,
      [alertaId, regionId],
    )
    await cliente.query('COMMIT')
    return { alertaId, notificados: notif.rowCount }
  } catch (err) {
    await cliente.query('ROLLBACK')
    throw err
  } finally {
    cliente.release()
  }
}

/** Alertas vigentes. Con regionId filtra a esa región; sin él, todas las de Oaxaca. */
export async function listarActivas(regionId = null) {
  const params = []
  let filtro = 'WHERE a.vigente_hasta > NOW()'
  if (regionId) {
    params.push(regionId)
    filtro += ' AND a.region_id = $1'
  }
  const { rows } = await consulta(`${SELECT_ALERTA} ${filtro} ORDER BY ${ORDEN_NIVEL}, a.emitida_en DESC`, params)
  return rows
}

export async function buscarAlerta(id) {
  const { rows } = await consulta(`${SELECT_ALERTA} WHERE a.id = $1`, [id])
  return rows[0] ?? null
}

/** Alertas que publicó una autoridad (vigentes y vencidas), con cuántas personas fueron notificadas. */
export async function listarPorAutor(autoridadId) {
  const { rows } = await consulta(
    `SELECT a.id, a.tipo, a.nivel, a.titulo, a.emitida_en, a.vigente_hasta,
            r.nombre AS region,
            (a.vigente_hasta > NOW()) AS vigente,
            (SELECT COUNT(*)::int FROM notificaciones n WHERE n.alerta_id = a.id) AS notificados
     FROM alertas a
     JOIN regiones r ON r.id = a.region_id
     WHERE a.autoridad_id = $1
     ORDER BY a.emitida_en DESC
     LIMIT 50`,
    [autoridadId],
  )
  return rows
}

/** Termina una alerta antes de tiempo (la vigencia pasa a "ahora"). Solo su autor o un administrador. */
export async function finalizarAlerta(id) {
  const { rowCount } = await consulta(
    `UPDATE alertas SET vigente_hasta = GREATEST(NOW(), emitida_en + INTERVAL '1 millisecond')
     WHERE id = $1 AND vigente_hasta > NOW()`,
    [id],
  )
  return rowCount > 0
}

export async function autorDeAlerta(id) {
  const { rows } = await consulta('SELECT autoridad_id FROM alertas WHERE id = $1', [id])
  return rows[0]?.autoridad_id ?? null
}
