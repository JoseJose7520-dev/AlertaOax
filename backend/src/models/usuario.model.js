import { consulta, pool } from '../config/db.js'

const SELECT_USUARIO = `
  SELECT u.id, u.nombre, u.correo, u.password_hash, u.rol, u.activo, u.google_sub, u.correo_verificado, u.password_definida, u.telefono, u.avisos_correo, u.creado_en,
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

export async function buscarPorGoogle(sub) {
  const { rows } = await consulta(`${SELECT_USUARIO} WHERE u.google_sub = $1`, [sub])
  return rows[0] ?? null
}

/**
 * Vincula la cuenta de Google. Google ya confirmó el correo, así que la cuenta queda verificada.
 * Si la cuenta aún no estaba verificada, su contraseña la pudo haber puesto cualquiera que escribió ese correo:
 * se reemplaza por `hashAleatorio` para que nadie más pueda entrar con ella.
 */
export async function vincularGoogle(id, sub, hashAleatorio) {
  await consulta(
    `UPDATE usuarios SET
       google_sub = COALESCE(google_sub, $2),
       password_hash = CASE WHEN correo_verificado THEN password_hash ELSE $3 END,
       password_definida = CASE WHEN correo_verificado THEN password_definida ELSE FALSE END,
       correo_verificado = TRUE
     WHERE id = $1`,
    [id, sub, hashAleatorio],
  )
}

export async function cambiarPassword(id, passwordHash) {
  await consulta('UPDATE usuarios SET password_hash = $2, password_definida = TRUE, sesiones_desde = NOW() WHERE id = $1', [id, passwordHash])
}

export async function marcarCorreoVerificado(id) {
  await consulta('UPDATE usuarios SET correo_verificado = TRUE WHERE id = $1', [id])
}

/** Datos que la persona puede cambiar desde «Mi perfil». La región solo se manda para ciudadanos. */
export async function actualizarPerfil(id, { nombre, telefono, regionId }) {
  await consulta(
    'UPDATE usuarios SET nombre = $2, telefono = $3, region_id = COALESCE($4, region_id) WHERE id = $1',
    [id, nombre, telefono || null, regionId ?? null],
  )
}

/** Borra una cuenta que nunca confirmó su correo (para poder registrarse de nuevo con ese correo). */
export async function borrarSinVerificar(id) {
  await consulta('DELETE FROM usuarios WHERE id = $1 AND correo_verificado = FALSE', [id])
}

/**
 * Crea la cuenta como ciudadano. Si trae `institucion`, además deja su solicitud de autoridad pendiente
 * (en la misma transacción): cuando el administrador la aprueba, la cuenta pasa a ser de autoridad.
 */
export async function crearUsuario({ nombre, correo, passwordHash, regionId, institucion = null, googleSub = null, correoVerificado = true, passwordDefinida = true }) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    const { rows } = await cliente.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, region_id, google_sub, correo_verificado, password_definida, terminos_aceptados_en)
       VALUES ($1, $2, $3, 'ciudadano', $4, $5, $6, $7, NOW()) RETURNING id`,
      [nombre, correo, passwordHash, regionId, googleSub, correoVerificado, passwordDefinida],
    )
    const id = rows[0].id
    if (institucion) {
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

/** Solicitud de autoridad de un ciudadano (nueva, o de nuevo pendiente si antes se la rechazaron). */
export async function guardarSolicitudAutoridad(usuarioId, institucion) {
  await consulta(
    `INSERT INTO autoridades (usuario_id, institucion) VALUES ($1, $2)
     ON CONFLICT (usuario_id) DO UPDATE
     SET institucion = EXCLUDED.institucion, estado_validacion = 'pendiente', validada_por = NULL, validada_en = NULL`,
    [usuarioId, institucion],
  )
}

/** Activa o desactiva los avisos por correo de alertas críticas y altas. */
export async function cambiarAvisosCorreo(id, activo) {
  await consulta('UPDATE usuarios SET avisos_correo = $2 WHERE id = $1', [id, activo])
}

/** Cuántas alertas publicó la cuenta (las alertas oficiales no se borran con la cuenta). */
export async function contarAlertasPublicadas(id) {
  const { rows } = await consulta('SELECT COUNT(*)::int AS total FROM alertas WHERE autoridad_id = $1', [id])
  return rows[0].total
}

/**
 * Borra la cuenta y sus datos personales en una transacción.
 * En cascada se van: plan familiar y planes, mochila, notificaciones, códigos, enlaces de recuperación y solicitud de autoridad.
 * Los reportes quedan sin dueño (usuario_id NULL) para conservar el historial de Protección Civil.
 */
export async function eliminarCuenta(id) {
  const cliente = await pool.connect()
  try {
    await cliente.query('BEGIN')
    // Por si la base aún no tiene la migración AO-425 (ON DELETE SET NULL), se anonimiza a mano
    await cliente.query('UPDATE reportes SET usuario_id = NULL WHERE usuario_id = $1', [id])
    await cliente.query('UPDATE reportes SET atendido_por = NULL WHERE atendido_por = $1', [id])
    await cliente.query('UPDATE autoridades SET validada_por = NULL WHERE validada_por = $1', [id])
    const { rowCount } = await cliente.query("DELETE FROM usuarios WHERE id = $1 AND rol <> 'administrador'", [id])
    await cliente.query('COMMIT')
    return rowCount > 0
  } catch (err) {
    await cliente.query('ROLLBACK')
    throw err
  } finally {
    cliente.release()
  }
}
