import { consulta } from '../config/db.js'

/** Notificaciones del usuario (las más recientes primero), con los datos básicos de la alerta. */
export async function listarDeUsuario(usuarioId) {
  const { rows } = await consulta(
    `SELECT n.id, n.leida, n.creada_en,
            a.id AS alerta_id, a.titulo, a.nivel, a.tipo, a.vigente_hasta,
            (a.vigente_hasta > NOW()) AS vigente
     FROM notificaciones n
     JOIN alertas a ON a.id = n.alerta_id
     WHERE n.usuario_id = $1
     ORDER BY n.creada_en DESC
     LIMIT 50`,
    [usuarioId],
  )
  return rows
}

export async function contarNoLeidas(usuarioId) {
  const { rows } = await consulta(
    'SELECT COUNT(*)::int AS total FROM notificaciones WHERE usuario_id = $1 AND leida = FALSE',
    [usuarioId],
  )
  return rows[0].total
}

/** Marca como leída. Devuelve false si la notificación no es de ese usuario. */
export async function marcarLeida(id, usuarioId) {
  const { rowCount } = await consulta(
    'UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId],
  )
  return rowCount > 0
}

export async function marcarTodasLeidas(usuarioId) {
  await consulta('UPDATE notificaciones SET leida = TRUE WHERE usuario_id = $1 AND leida = FALSE', [usuarioId])
}
