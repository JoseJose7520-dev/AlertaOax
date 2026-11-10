import { consulta, pool } from '../config/db.js'

const SELECT_USUARIO = `
  SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol, u.activo,
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
export async function crearUsuario({ nombre, correo, passwordHash, rol, regionId, institucion }) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const { rows } = await cliente.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, region_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [nombre, correo, passwordHash, rol, regionId],
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
