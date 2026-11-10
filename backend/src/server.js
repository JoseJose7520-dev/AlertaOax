import app from './app.js'
import { env } from './config/env.js'

const servidor = app.listen(env.puerto, () => {
  console.log(`AlertaOax API escuchando en http://localhost:${env.puerto} (${env.entorno})`)
})

servidor.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${env.puerto} ya está en uso. Cambia PORT en el archivo .env.`)
  } else {
    console.error(err)
  }
  process.exit(1)
})
