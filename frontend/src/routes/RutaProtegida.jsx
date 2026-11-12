import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { inicioPorRol, useAuth } from '../context/AuthContext.jsx'
import Cargando from '../components/Cargando.jsx'

/** Deja pasar solo a usuarios con sesión y con alguno de los roles indicados. */
export default function RutaProtegida({ roles }) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <Cargando pantallaCompleta />
  if (!usuario) return <Navigate to="/acceso" replace state={{ desde: ubicacion.pathname }} />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={inicioPorRol(usuario.rol)} replace />
  return <Outlet />
}
