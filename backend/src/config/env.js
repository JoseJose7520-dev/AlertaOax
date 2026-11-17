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
  // Dirección pública de la app; se usa en los enlaces de los correos
  appUrl: (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  // Acceso con Google (opcional). Sin este valor, el botón no aparece.
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  // Contacto institucional que muestra el botón flotante (WhatsApp solo dígitos con lada, ej. 5219511234567)
  contacto: {
    whatsapp: (process.env.CONTACTO_WHATSAPP || '').replace(/\D/g, ''),
    correo: process.env.CONTACTO_CORREO || '',
  },
  // Solo para pruebas locales: acepta credenciales falsas "prueba:correo:nombre". Nunca en producción.
  googlePrueba: entorno !== 'production' && process.env.GOOGLE_PRUEBA === '1',
  // Correo saliente (opcional). Sin SMTP_USER, los enlaces se escriben en la consola del servidor.
  correo: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    puerto: Number(process.env.SMTP_PORT) || 465,
    usuario: process.env.SMTP_USER || '',
    clave: process.env.SMTP_PASS || '',
    remitente: process.env.CORREO_REMITENTE || process.env.SMTP_USER || 'AlertaOax <no-responder@alertaoax.local>',
  },
}
