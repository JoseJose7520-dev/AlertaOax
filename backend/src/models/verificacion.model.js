import { consulta } from '../config/db.js'

/** Guarda (o reemplaza) el código vigente de la cuenta. Solo hay uno a la vez. */
export async function guardarCodigo(usuarioId, codigoHash, minutos = 10) {
  await consulta(
    `INSERT INTO verificaciones_correo (usuario_id, codigo_hash, expira_en, intentos, enviado_en)
     VALUES ($1, $2, NOW() + make_interval(mins => $3), 0, NOW())
     ON CONFLICT (usuario_id) DO UPDATE
       SET codigo_hash = EXCLUDED.codigo_hash, expira_en = EXCLUDED.expira_en, intentos = 0, enviado_en = NOW()`,
    [usuarioId, codigoHash, minutos],
  )
}

/** Segundos que han pasado desde el último envío (null si no hay código). Sirve para no reenviar a cada clic. */
export async function segundosDesdeEnvio(usuarioId) {
  const { rows } = await consulta(
    'SELECT EXTRACT(EPOCH FROM NOW() - enviado_en)::int AS seg FROM verificaciones_correo WHERE usuario_id = $1',
    [usuarioId],
  )
  return rows[0]?.seg ?? null
}

/**
 * Compara el código. Cada intento fallido cuenta; con 5 fallos el código deja de servir.
 * Devuelve 'ok' | 'incorrecto' | 'vencido'.
 */
export async function comprobarCodigo(usuarioId, codigoHash) {
  const { rows } = await consulta(
    `UPDATE verificaciones_correo SET intentos = intentos + 1
     WHERE usuario_id = $1 AND expira_en > NOW() AND intentos < 5
     RETURNING codigo_hash, intentos`,
    [usuarioId],
  )
  if (!rows.length) return 'vencido'
  if (rows[0].codigo_hash !== codigoHash) return rows[0].intentos >= 5 ? 'vencido' : 'incorrecto'
  await consulta('DELETE FROM verificaciones_correo WHERE usuario_id = $1', [usuarioId])
  return 'ok'
}
