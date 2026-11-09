import { Navigate, Route, Routes } from 'react-router-dom'
import RutaProtegida from './routes/RutaProtegida.jsx'
import LayoutInterno from './components/layout/LayoutInterno.jsx'
import AccesoRegistro from './pages/AccesoRegistro.jsx'
import Alertas from './pages/Alertas.jsx'
import DetalleAlerta from './pages/DetalleAlerta.jsx'
import MapaRiesgo from './pages/MapaRiesgo.jsx'
import Pendiente from './pages/Pendiente.jsx'
import { ROLES } from './utils/constantes.js'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/acceso" replace />} />
      <Route path="/acceso" element={<AccesoRegistro />} />

      {/* Páginas internas: requieren sesión iniciada */}
      <Route element={<RutaProtegida><LayoutInterno /></RutaProtegida>}>
        <Route path="/inicio" element={<Navigate to="/alertas" replace />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/alertas/:id" element={<DetalleAlerta />} />
        <Route path="/mapa" element={<MapaRiesgo />} />
        <Route path="/preparacion" element={<Pendiente titulo="Prepárate ante desastres" sprint="Sprint 3" />} />
        <Route path="/reportes" element={<Pendiente titulo="Reportar una incidencia" sprint="Sprint 3" />} />
      </Route>

      {/* Solo autoridades verificadas */}
      <Route element={<RutaProtegida roles={[ROLES.AUTORIDAD, ROLES.ADMIN]}><LayoutInterno /></RutaProtegida>}>
        <Route path="/publicar" element={<Pendiente titulo="Publicar aviso" sprint="Sprint 2" />} />
      </Route>

      {/* Solo administrador */}
      <Route element={<RutaProtegida roles={[ROLES.ADMIN]}><LayoutInterno /></RutaProtegida>}>
        <Route path="/admin" element={<Pendiente titulo="Panel de administración" sprint="Sprint 4" />} />
      </Route>

      <Route path="*" element={<Navigate to="/acceso" replace />} />
    </Routes>
  )
}
