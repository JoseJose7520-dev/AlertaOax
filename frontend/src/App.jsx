import { Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import AvisoCookies from './components/AvisoCookies.jsx'
import Banda911 from './components/Banda911.jsx'
import BotonContacto from './components/BotonContacto.jsx'
import RutaProtegida from './routes/RutaProtegida.jsx'
import LayoutCiudadano from './components/layout/LayoutCiudadano.jsx'
import LayoutPanel from './components/layout/LayoutPanel.jsx'
import Acceso from './pages/Acceso.jsx'
import Inicio from './pages/Inicio.jsx'
import DetalleAlerta from './pages/DetalleAlerta.jsx'
import Mapa from './pages/Mapa.jsx'
import Preparate from './pages/Preparate.jsx'
import Reportar from './pages/Reportar.jsx'
import MisReportes from './pages/MisReportes.jsx'
import ReportesCiudadanos from './pages/autoridad/ReportesCiudadanos.jsx'
import Resumen from './pages/admin/Resumen.jsx'
import Autoridades from './pages/admin/Autoridades.jsx'
import PublicarAlerta from './pages/autoridad/PublicarAlerta.jsx'
import MisAlertas from './pages/autoridad/MisAlertas.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'
import OlvidePassword from './pages/OlvidePassword.jsx'
import RestablecerPassword from './pages/RestablecerPassword.jsx'
import Usuarios from './pages/admin/Usuarios.jsx'
import Perfil from './pages/Perfil.jsx'

const MENU_AUTORIDAD = [
  { a: '/autoridad', texto: 'Publicar alerta', corto: 'Publicar', icono: 'megafono', exacta: true },
  { a: '/autoridad/alertas', texto: 'Alertas de mi región', corto: 'Alertas', icono: 'lista' },
  { a: '/autoridad/reportes', texto: 'Reportes ciudadanos', corto: 'Reportes', icono: 'reporte' },
]
const MENU_ADMIN = [
  { a: '/admin', texto: 'Resumen', icono: 'grafica', exacta: true },
  { a: '/admin/autoridades', texto: 'Autoridades', icono: 'escudo' },
  { a: '/admin/usuarios', texto: 'Usuarios', icono: 'usuarios' },
  { a: '/autoridad', texto: 'Publicar alerta', corto: 'Publicar', icono: 'megafono' },
  { a: '/autoridad/alertas', texto: 'Alertas publicadas', corto: 'Alertas', icono: 'lista' },
]

const RUTAS_CIUDADANO = /^\/(mapa|preparate|reportar|reportes|perfil|alertas\/.+)?$/

/** Elementos presentes en todas las pantallas: franja 911, contacto rápido y aviso de cookies. */
function Globales() {
  const { usuario } = useAuth()
  const { pathname } = useLocation()
  // En la app del ciudadano (celular) hay barra inferior: los flotantes suben para no taparla
  const elevado = usuario?.rol === 'ciudadano' && RUTAS_CIUDADANO.test(pathname)
  return (
    <>
      <Banda911 />
      <BotonContacto elevado={elevado} />
      <AvisoCookies elevado={elevado} />
    </>
  )
}

export default function App() {
  return (
    <>
    <Globales />
    <Routes>
      <Route path="/acceso" element={<Acceso />} />
      <Route path="/olvide" element={<OlvidePassword />} />
      <Route path="/restablecer" element={<RestablecerPassword />} />

      <Route element={<RutaProtegida roles={['ciudadano']} />}>
        <Route element={<LayoutCiudadano />}>
          <Route index element={<Inicio />} />
          <Route path="alertas/:id" element={<DetalleAlerta />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="preparate" element={<Preparate />} />
          <Route path="reportar" element={<Reportar />} />
          <Route path="reportes" element={<MisReportes />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={['autoridad', 'administrador']} />}>
        <Route path="autoridad" element={<LayoutPanel titulo="Panel de autoridad" enlaces={MENU_AUTORIDAD} />}>
          <Route index element={<PublicarAlerta />} />
          <Route path="alertas" element={<MisAlertas />} />
          <Route path="reportes" element={<ReportesCiudadanos />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={['administrador']} />}>
        <Route path="admin" element={<LayoutPanel titulo="Administración" enlaces={MENU_ADMIN} />}>
          <Route index element={<Resumen />} />
          <Route path="autoridades" element={<Autoridades />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route path="*" element={<NoEncontrada />} />
    </Routes>
    </>
  )
}
