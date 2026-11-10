import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { alExpirarSesion, api, sesion } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(() => Boolean(sesion.leer()))

  const cerrarSesion = useCallback(() => {
    sesion.borrar()
    setUsuario(null)
  }, [])

  // Al abrir la app, si hay token guardado, recupera los datos del usuario
  useEffect(() => {
    alExpirarSesion(cerrarSesion)
    if (!sesion.leer()) return
    api.get('/auth/me')
      .then(({ usuario: u }) => setUsuario(u))
      .catch(() => cerrarSesion())
      .finally(() => setCargando(false))
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async ({ correo, password, perfil }) => {
    const { token, usuario: u } = await api.post('/auth/login', { correo, password, perfil })
    sesion.guardar(token)
    setUsuario(u)
    return u
  }, [])

  const registrar = useCallback((datos) => api.post('/auth/register', datos), [])

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, registrar, cerrarSesion }),
    [usuario, cargando, iniciarSesion, registrar, cerrarSesion],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

/** Ruta de inicio según el rol. */
// eslint-disable-next-line react-refresh/only-export-components
export function inicioPorRol(rol) {
  if (rol === 'administrador') return '/admin'
  if (rol === 'autoridad') return '/autoridad'
  return '/'
}
