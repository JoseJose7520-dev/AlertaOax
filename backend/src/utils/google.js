import { OAuth2Client } from 'google-auth-library'
import { env } from '../config/env.js'
import ErrorHttp from './ErrorHttp.js'

let cliente = null

/**
 * Verifica el ID token que entrega "Iniciar sesión con Google" y devuelve { sub, correo, nombre }.
 * La firma, la audiencia (nuestro Client ID) y la caducidad las valida google-auth-library.
 */
export async function verificarCredencialGoogle(credencial) {
  if (typeof credencial !== 'string' || !credencial) throw new ErrorHttp(400, 'Falta la credencial de Google.')

  if (env.googlePrueba && credencial.startsWith('prueba:')) {
    const [, correo, nombre = 'Usuario de prueba'] = credencial.split(':')
    return { sub: `prueba-${correo}`, correo: correo.toLowerCase(), nombre }
  }
  if (!env.googleClientId) throw new ErrorHttp(503, 'El acceso con Google no está configurado.')

  cliente ??= new OAuth2Client(env.googleClientId)
  let datos
  try {
    const ticket = await cliente.verifyIdToken({ idToken: credencial, audience: env.googleClientId })
    datos = ticket.getPayload()
  } catch {
    throw new ErrorHttp(401, 'No se pudo verificar tu cuenta de Google. Inténtalo de nuevo.')
  }
  if (!datos?.email || !datos.email_verified) throw new ErrorHttp(401, 'Tu correo de Google no está verificado.')
  return { sub: datos.sub, correo: datos.email.toLowerCase(), nombre: datos.name || datos.email.split('@')[0] }
}
