import { consulta } from '../config/db.js'

/** Conteos para el panel del administrador (una sola consulta). */
export async function obtenerMetricas() {
  const { rows } = await consulta(`
    SELECT
      (SELECT COUNT(*) FROM alertas WHERE vigente_hasta > NOW())::int                  AS alertas_activas,
      (SELECT COUNT(*) FROM alertas)::int                                              AS alertas_total,
      (SELECT COUNT(*) FROM usuarios WHERE rol = 'ciudadano' AND activo)::int          AS ciudadanos,
      (SELECT COUNT(*) FROM autoridades WHERE estado_validacion = 'aprobada')::int     AS autoridades_aprobadas,
      (SELECT COUNT(*) FROM autoridades WHERE estado_validacion = 'pendiente')::int    AS autoridades_pendientes,
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
  let filtro = ''
  if (estado) {
    params.push(estado)
    filtro = 'WHERE a.estado_validacion = $1'
  }
  const { rows } = await consulta(
    `SELECT u.id, u.nombre, u.correo, r.nombre AS region, a.institucion, a.estado_validacion,
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

export async function validarAutoridad(usuarioId, decision, adminId) {
  const { rowCount } = await consulta(
    `UPDATE autoridades SET estado_validacion = $2, validada_por = $3, validada_en = NOW()
     WHERE usuario_id = $1`,
    [usuarioId, decision, adminId],
  )
  return rowCount > 0
}
