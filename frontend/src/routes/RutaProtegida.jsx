import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/** Exige sesión; si se indican `roles`, también exige que el usuario tenga uno de ellos. */
export default function RutaProtegida({ roles, children }) {
  const { usuario } = useAuth()
  const ubicacion = useLocation()

  if (!usuario) return <Navigate to="/acceso" state={{ desde: ubicacion }} replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/alertas" replace />
  return children
}
