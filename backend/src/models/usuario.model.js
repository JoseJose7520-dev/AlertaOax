import { consulta, pool } from '../config/db.js'

const SELECT_USUARIO = `
  SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol, u.activo, u.google_sub,
         r.nombre AS region,
         a.institucion, a.estado_validacion
  FROM usuarios u
  LEFT JOIN regiones r    ON r.id = u.region_id
  LEFT JOIN autoridades a ON a.usuario_id = u.id`

export async function buscarPorCorreo(correo) {
  const { rows } = await consulta(`${SELECT_USUARIO} WHERE u.correo = $1`, [correo])
  return rows[0] ?? null
}

export async function buscarPorId(id) {
  const { rows } = await consulta(`${SELECT_USUARIO} WHERE u.id = $1`, [id])
  return rows[0] ?? null
}

/** Crea el usuario y, si es autoridad, su registro pendiente de validación (en una sola transacción). */
export async function buscarPorGoogle(sub) {
  const { rows } = await consulta(`${SELECT_USUARIO} WHERE u.google_sub = $1`, [sub])
  return rows[0] ?? null
}

export async function vincularGoogle(id, sub) {
  await consulta('UPDATE usuarios SET google_sub = $2 WHERE id = $1 AND google_sub IS NULL', [id, sub])
}

export async function cambiarPassword(id, passwordHash) {
  await consulta('UPDATE usuarios SET password_hash = $2 WHERE id = $1', [id, passwordHash])
}

export async function crearUsuario({ nombre, correo, passwordHash, rol, regionId, institucion, googleSub = null }) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const { rows } = await cliente.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, region_id, google_sub, terminos_aceptados_en)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
      [nombre, correo, passwordHash, rol, regionId, googleSub],
    )
    const id = rows[0].id
    if (rol === 'autoridad') {
      await cliente.query('INSERT INTO autoridades (usuario_id, institucion) VALUES ($1, $2)', [id, institucion])
    }
    await cliente.query('COMMIT')
    return id
  } catch (err) {
    await cliente.query('ROLLBACK')
    throw err
  } finally {
    cliente.release()
  }
}
