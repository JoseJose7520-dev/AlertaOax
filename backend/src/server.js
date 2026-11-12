import app from './app.js'
import { env } from './config/env.js'
import { pool, probarConexion } from './config/db.js'

const servidor = app.listen(env.puerto, async () => {
  console.log(`AlertaOax API escuchando en http://localhost:${env.puerto} (${env.entorno})`)
  try {
    await probarConexion()
    console.log('Base de datos: conexión correcta.')
  } catch (err) {
    console.error(`Base de datos: no se pudo conectar (${err.message}). Revisa las variables DB_* del archivo .env.`)
  }
})

servidor.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${env.puerto} ya está en uso. Cambia PORT en el archivo .env.`)
  } else {
    console.error(err)
  }
  process.exit(1)
})

// Cierre ordenado (Ctrl + C o reinicio del servidor)
function cerrar() {
  servidor.close(async () => {
    await pool.end()
    process.exit(0)
  })
}
process.on('SIGINT', cerrar)
process.on('SIGTERM', cerrar)
