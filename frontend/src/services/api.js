const BASE = import.meta.env.VITE_API_URL ?? '/api'

export class ErrorApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje)
    this.estado = estado
  }
}

/**
 * Cliente HTTP mínimo hacia la API REST (JSON).
 * Uso: api('/auth/login', { method: 'POST', body: { correo, password } })
 */
export async function api(ruta, { method = 'GET', body, token } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErrorApi('No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.', 0)
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new ErrorApi(datos.mensaje || 'No se pudo completar la solicitud.', respuesta.status)
  }
  return datos
}
