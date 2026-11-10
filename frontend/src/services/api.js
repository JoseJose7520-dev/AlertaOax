// Cliente HTTP de la API. En desarrollo, Vite redirige /api a http://localhost:3000 (ver vite.config.js).
// En producción se puede cambiar con la variable VITE_API_URL.

const BASE = (import.meta.env.VITE_API_URL || '') + '/api'
const CLAVE_TOKEN = 'alertaoax_token'

export const sesion = {
  leer() {
    try { return localStorage.getItem(CLAVE_TOKEN) } catch { return null }
  },
  guardar(token) {
    try { localStorage.setItem(CLAVE_TOKEN, token) } catch { /* modo privado: la sesión dura solo esta pestaña */ }
  },
  borrar() {
    try { localStorage.removeItem(CLAVE_TOKEN) } catch { /* nada que borrar */ }
  },
}

export class ErrorApi extends Error {
  constructor(estado, mensaje) {
    super(mensaje)
    this.estado = estado
  }
}

// Si el token expira, AuthContext se entera por aquí y cierra la sesión.
let alExpirar = () => {}
export const alExpirarSesion = (fn) => { alExpirar = fn }

async function peticion(metodo, ruta, cuerpo) {
  const token = sesion.leer()
  let respuesta
  try {
    respuesta = await fetch(BASE + ruta, {
      method: metodo,
      headers: {
        ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new ErrorApi(0, 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.')
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    if (respuesta.status === 401 && token) alExpirar()
    throw new ErrorApi(respuesta.status, datos.mensaje || 'Ocurrió un error. Inténtalo de nuevo.')
  }
  return datos
}

export const api = {
  get: (ruta) => peticion('GET', ruta),
  post: (ruta, cuerpo = {}) => peticion('POST', ruta, cuerpo),
  put: (ruta, cuerpo = {}) => peticion('PUT', ruta, cuerpo),
  patch: (ruta, cuerpo = {}) => peticion('PATCH', ruta, cuerpo),
}
