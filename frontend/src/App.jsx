import { Route, Routes } from 'react-router-dom'
import RutaProtegida from './routes/RutaProtegida.jsx'
import LayoutCiudadano from './components/layout/LayoutCiudadano.jsx'
import LayoutPanel from './components/layout/LayoutPanel.jsx'
import Acceso from './pages/Acceso.jsx'
import Pendiente from './pages/Pendiente.jsx'
import Inicio from './pages/Inicio.jsx'
import DetalleAlerta from './pages/DetalleAlerta.jsx'
import Mapa from './pages/Mapa.jsx'
import Preparate from './pages/Preparate.jsx'
import Reportar from './pages/Reportar.jsx'
import MisReportes from './pages/MisReportes.jsx'
import ReportesCiudadanos from './pages/autoridad/ReportesCiudadanos.jsx'
import PublicarAlerta from './pages/autoridad/PublicarAlerta.jsx'
import MisAlertas from './pages/autoridad/MisAlertas.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

const MENU_AUTORIDAD = [
  { a: '/autoridad', texto: 'Publicar alerta', icono: 'campana', exacta: true },
  { a: '/autoridad/alertas', texto: 'Mis alertas', icono: 'lista' },
  { a: '/autoridad/reportes', texto: 'Reportes ciudadanos', icono: 'usuario' },
]
const MENU_ADMIN = [
  { a: '/admin', texto: 'Resumen', icono: 'grafica', exacta: true },
]

export default function App() {
  return (
    <Routes>
      <Route path="/acceso" element={<Acceso />} />

      <Route element={<RutaProtegida roles={['ciudadano']} />}>
        <Route element={<LayoutCiudadano />}>
          <Route index element={<Inicio />} />
          <Route path="alertas/:id" element={<DetalleAlerta />} />
          <Route path="mapa" element={<Mapa />} />
          <Route path="preparate" element={<Preparate />} />
          <Route path="reportar" element={<Reportar />} />
          <Route path="reportes" element={<MisReportes />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={['autoridad', 'administrador']} />}>
        <Route path="autoridad" element={<LayoutPanel titulo="Panel de autoridad" enlaces={MENU_AUTORIDAD} />}>
          <Route index element={<PublicarAlerta />} />
          <Route path="alertas" element={<MisAlertas />} />
          <Route path="reportes" element={<ReportesCiudadanos />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={['administrador']} />}>
        <Route path="admin" element={<LayoutPanel titulo="Administración" enlaces={MENU_ADMIN} />}>
          <Route index element={<Pendiente titulo="Resumen" tarea="AO-402" />} />
        </Route>
      </Route>

      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}
