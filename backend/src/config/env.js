import 'dotenv/config'

export const env = {
  puerto: Number(process.env.PORT) || 3000,
  entorno: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}
