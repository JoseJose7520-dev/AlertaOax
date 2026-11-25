import { consulta, pool } from '../config/db.js'

/** Conteos para el panel del administrador (una sola consulta). */
export async function obtenerMetricas() {
  const { rows } = await consulta(`
    SELECT
      (SELECT COUNT(*) FROM alertas WHERE vigente_hasta > NOW())::int                  AS alertas_activas,
      (SELECT COUNT(*) FROM alertas)::int                                              AS alertas_total,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'ciudadano' AND activo)::int          AS ciudadanos,
      (SELECT COUNT(*) FROM autoridades WHERE estado_validacion = 'aprobada')::int     AS autoridades_aprobadas,
      (SELECT COUNT(*) FROM autoridades a JOIN usuarios u ON u.id = a.usuario_id WHERE a.estado_validacion = 'pendiente' AND u.correo_verificado)::int AS autoridades_pendientes,
      (SELECT COUNT(*) FROM reportes)::int                                             AS reportes_total,
      (SELECT COUNT(*) FROM reportes WHERE estado <> 'atendido')::int                  AS reportes_abiertos,
      (SELECT COUNT(*) FROM notificaciones)::int                                       AS notificaciones_enviadas`)
  const metricas = rows[0]

  const porTipo = await consulta(`
    SELECT tipo, COUNT(*)::int AS total FROM alertas GROUP BY tipo ORDER BY total DESC`)
  const porRegion = await consulta(`
    SELECT r.nombre AS region, COUNT(a.id)::int AS total
    FROM regiones r LEFT JOIN alertas a ON a.region_id = r.id
    GROUP BY r.nombre ORDER BY total DESC, r.nombre`)
  const reportesPorEstado = await consulta(`
    SELECT estado, COUNT(*)::int AS total FROM reportes GROUP BY estado`)

  return {
    ...metricas,
    alertas_por_tipo: porTipo.rows,
    alertas_por_region: porRegion.rows,
    reportes_por_estado: reportesPorEstado.rows,
  }
}

export async function listarAutoridades(estado = null) {
  const params = []
  // Solo se muestran las solicitudes que ya confirmaron su correo
  let filtro = 'WHERE u.correo_verificado'
  if (estado) {
    params.push(estado)
    filtro += ' AND a.estado_validacion = $1'
  }
  const { rows } = await consulta(
    `SELECT u.id, u.nombre, u.correo, u.rol, r.nombre AS region, a.institucion, a.estado_validacion,
            u.creado_en, a.validada_en
     FROM autoridades a
     JOIN usuarios u      ON u.id = a.usuario_id
     LEFT JOIN regiones r ON r.id = u.region_id
     ${filtro}
     ORDER BY CASE a.estado_validacion WHEN 'pendiente' THEN 1 ELSE 2 END, u.creado_en DESC`,
    params,
  )
  return rows
}

/**
 * Aprueba o rechaza una solicitud de autoridad y ajusta el rol de la cuenta en la misma transacción:
 * aprobada → «autoridad»; rechazada → se queda (o regresa) como «ciudadano», así no pierde el acceso.
 * Devuelve { nombre, correo, region } para avisarle por correo, o null si la solicitud no existe.
 */
export async function validarAutoridad(usuarioId, decision, adminId) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const { rowCount } = await cliente.query(
      `UPDATE autoridades SET estado_validacion = $2, validada_por = $3, validada_en = NOW()
       WHERE usuario_id = $1`,
      [usuarioId, decision, adminId],
    )
    if (!rowCount) {
      await cliente.query('ROLLBACK')
      return null
    }
    const { rows } = await cliente.query(
      `UPDATE usuarios u SET rol = $2
       WHERE u.id = $1 AND u.rol <> 'administrador'
       RETURNING u.nombre, u.correo, (SELECT nombre FROM regiones WHERE id = u.region_id) AS region`,
      [usuarioId, decision === 'aprobada' ? 'autoridad' : 'ciudadano'],
    )
    await cliente.query('COMMIT')
    return rows[0] ?? { nombre: '', correo: null, region: null }
  } catch (err) {
    await cliente.query('ROLLBACK')
    throw err
  } finally {
    cliente.release()
  }
}

/** Listado de usuarios para el administrador, con búsqueda por nombre o correo y filtro por rol. */
export async function listarUsuarios({ rol = null, buscar = '', pagina = 1, porPagina = 20 }) {
  const params = []
  const condiciones = []
  if (rol) {
    params.push(rol)
    condiciones.push(`u.rol = $${params.length}`)
  }
  if (buscar) {
    params.push(`%${buscar.toLowerCase()}%`)
    condiciones.push(`(LOWER(u.nombre) LIKE $${params.length} OR u.correo LIKE $${params.length})`)
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : ''
  const total = await consulta(`SELECT COUNT(*)::int AS total FROM usuarios u ${where}`, params)
  params.push(porPagina, (pagina - 1) * porPagina)
  const { rows } = await consulta(
    `SELECT u.id, u.nombre, u.correo, u.rol, u.activo, u.creado_en, r.nombre AS region,
            a.estado_validacion, (u.google_sub IS NOT NULL) AS con_google
     FROM usuarios u
     LEFT JOIN regiones r    ON r.id = u.region_id
     LEFT JOIN autoridades a ON a.usuario_id = u.id
     ${where}
     ORDER BY u.creado_en DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )
  return { usuarios: rows, total: total.rows[0].total, pagina, porPagina }
}
