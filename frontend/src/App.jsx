import { Route, Routes } from 'react-router-dom'
import RutaProtegida from './routes/RutaProtegida.jsx'
import LayoutCiudadano from './components/layout/LayoutCiudadano.jsx'
import LayoutPanel from './components/layout/LayoutPanel.jsx'
import Acceso from './pages/Acceso.jsx'
import Pendiente from './pages/Pendiente.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

const MENU_AUTORIDAD = [
  { a: '/autoridad', texto: 'Publicar alerta', icono: 'campana', exacta: true },
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
          <Route index element={<Pendiente titulo="Alertas" tarea="AO-204" />} />
          <Route path="mapa" element={<Pendiente titulo="Mapa" tarea="AO-302" />} />
          <Route path="preparate" element={<Pendiente titulo="Prepárate" tarea="AO-303" />} />
          <Route path="reportar" element={<Pendiente titulo="Reportar" tarea="AO-306" />} />
        </Route>
      </Route>

      <Route element={<RutaProtegida roles={['autoridad', 'administrador']} />}>
        <Route path="autoridad" element={<LayoutPanel titulo="Panel de autoridad" enlaces={MENU_AUTORIDAD} />}>
          <Route index element={<Pendiente titulo="Publicar alerta" tarea="AO-203" />} />
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
