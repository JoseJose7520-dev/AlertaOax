import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Mapa from './pages/Mapa.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="mx-auto max-w-5xl p-4">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mapa" element={<Mapa />} />
        </Routes>
      </main>
    </div>
  )
}
