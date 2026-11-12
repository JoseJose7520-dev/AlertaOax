import 'dotenv/config'

function requerida(nombre) {
  const valor = process.env[nombre]
  if (!valor) {
    throw new Error(`Falta la variable ${nombre}. Copia .env.example como .env y complétalo.`)
  }
  return valor
}

const entorno = process.env.NODE_ENV || 'development'
const jwtSecreto = requerida('JWT_SECRET')

if (jwtSecreto.length < 16) {
  throw new Error('JWT_SECRET es muy corta: usa al menos 16 caracteres (mejor una cadena larga y aleatoria).')
}
if (entorno === 'production' && jwtSecreto.startsWith('cambia-esto')) {
  throw new Error('En producción debes cambiar JWT_SECRET por una clave propia.')
}

export const env = {
  puerto: Number(process.env.PORT) || 3000,
  entorno,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwt: {
    secreto: jwtSecreto,
    expira: process.env.JWT_EXPIRES || '8h',
  },
}
