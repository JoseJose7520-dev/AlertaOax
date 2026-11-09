import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { ROLES } from '../utils/constantes.js'

const AuthContext = createContext(null)
const CLAVE = 'alertaoax.sesion'
const MOCK = import.meta.env.VITE_MOCK_AUTH === 'true'

function leerSesion() {
  try {
    const crudo = localStorage.getItem(CLAVE) ?? sessionStorage.getItem(CLAVE)
    return crudo ? JSON.parse(crudo) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion)

  const guardar = useCallback((datos, recordar) => {
    const almacen = recordar ? localStorage : sessionStorage
    localStorage.removeItem(CLAVE)
    sessionStorage.removeItem(CLAVE)
    almacen.setItem(CLAVE, JSON.stringify(datos))
    setSesion(datos)
  }, [])

  // POST /api/auth/login  →  { token, usuario: { id, nombre, correo, rol, region } }
  const iniciarSesion = useCallback(async ({ correo, password, perfil, recordar }) => {
    if (MOCK) {
      const datos = { token: 'mock', usuario: { nombre: correo.split('@')[0], correo, rol: perfil, region: 'Valles Centrales' } }
      guardar(datos, recordar)
      return datos.usuario
    }
    const datos = await api('/auth/login', { method: 'POST', body: { correo, password, perfil } })
    guardar(datos, recordar)
    return datos.usuario
  }, [guardar])

  // POST /api/auth/register  →  ciudadano activo; autoridad queda pendiente de validación por el administrador
  const registrar = useCallback(async (formulario) => {
    if (MOCK) return { pendiente: formulario.perfil === ROLES.AUTORIDAD }
    return api('/auth/register', { method: 'POST', body: formulario })
  }, [])

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVE)
    sessionStorage.removeItem(CLAVE)
    setSesion(null)
  }, [])

  const valor = useMemo(
    () => ({ usuario: sesion?.usuario ?? null, token: sesion?.token ?? null, iniciarSesion, registrar, cerrarSesion }),
    [sesion, iniciarSesion, registrar, cerrarSesion],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
