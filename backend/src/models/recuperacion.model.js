import { consulta, pool } from '../config/db.js'

/** Guarda un token nuevo (su hash) y anula los anteriores sin usar de la misma cuenta. */
export async function crearRecuperacion(usuarioId, tokenHash, minutos = 30) {
  await consulta('DELETE FROM recuperaciones WHERE usuario_id = $1 AND usada_en IS NULL', [usuarioId])
  await consulta(
    `INSERT INTO recuperaciones (usuario_id, token_hash, expira_en) VALUES ($1, $2, NOW() + make_interval(mins => $3))`,
    [usuarioId, tokenHash, minutos],
  )
}

/**
 * Cambia la contraseña si el token es válido, no venció y no se ha usado. Todo en una transacción:
 * el token queda marcado como usado en el mismo momento en que cambia la contraseña.
 * Devuelve el id del usuario o null.
 */
export async function usarRecuperacion(tokenHash, passwordHash) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const { rows } = await cliente.query(
      `UPDATE recuperaciones SET usada_en = NOW()
       WHERE token_hash = $1 AND usada_en IS NULL AND expira_en > NOW()
       RETURNING usuario_id`,
      [tokenHash],
    )
    if (!rows.length) {
      await cliente.query('ROLLBACK')
      return null
    }
    const usuarioId = rows[0].usuario_id
    // Abrir el enlace del correo también demuestra que el correo es suyo
    await cliente.query(
      'UPDATE usuarios SET password_hash = $2, password_definida = TRUE, correo_verificado = TRUE, sesiones_desde = NOW() WHERE id = $1',
      [usuarioId, passwordHash],
    )
    await cliente.query('COMMIT')
    return usuarioId
  } catch (err) {
    await cliente.query('ROLLBACK')
    throw err
  } finally {
    cliente.release()
  }
}
