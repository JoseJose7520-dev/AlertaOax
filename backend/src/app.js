import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import rutas from './routes/index.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.frontendUrl }))
app.use(express.json({ limit: '100kb' }))

app.use('/api', rutas)

// Ruta inexistente
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
})

export default app
