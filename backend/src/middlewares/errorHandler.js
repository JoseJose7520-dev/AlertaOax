import ErrorHttp from '../utils/ErrorHttp.js'

export function noEncontrado(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}

/** Manejador global: todas las respuestas de error salen como { mensaje }. */
// eslint-disable-next-line no-unused-vars
export function manejadorErrores(err, req, res, next) {
  if (err instanceof ErrorHttp) {
    return res.status(err.estado).json({ mensaje: err.message })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'El cuerpo de la petición es demasiado grande.' })
  }
  // Errores de PostgreSQL más comunes
  if (err.code === '23505') {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos.' })
  }
  if (err.code === '23503') {
    return res.status(409).json({ mensaje: 'Referencia a un registro que no existe.' })
  }

  // Base de datos apagada o inalcanzable
  if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', '57P01', '57P03'].includes(err.code) || err.message?.includes('timeout exceeded when trying to connect')) {
    console.error('[db] sin conexión:', err.message)
    return res.status(503).json({ mensaje: 'El servicio no está disponible por el momento. Inténtalo en unos minutos.' })
  }

  console.error('[error]', err)
  res.status(500).json({ mensaje: 'Error interno del servidor.' })
}
