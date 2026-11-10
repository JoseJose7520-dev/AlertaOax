import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import rutas from './routes/index.js'
import { manejadorErrores, noEncontrado } from './middlewares/errorHandler.js'

const app = express()

// Detrás de Nginx (producción) hay que confiar en el proxy para leer la IP real del cliente
app.set('trust proxy', env.entorno === 'production' ? 1 : false)

app.use(helmet())
app.use(cors({ origin: env.frontendUrl }))
app.use(express.json({ limit: '100kb' }))

app.use('/api', rutas)

app.use(noEncontrado)
app.use(manejadorErrores)

export default app
