import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../utils/constantes.js'
import { IconoEntrar, IconoUsuarioMas } from '../components/Iconos.jsx'
import AvisoInstitucional from '../components/auth/AvisoInstitucional.jsx'
import PanelInformativo from '../components/auth/PanelInformativo.jsx'
import SelectorPerfil from '../components/auth/SelectorPerfil.jsx'
import FormLogin from '../components/auth/FormLogin.jsx'
import FormRegistro from '../components/auth/FormRegistro.jsx'
import PieEmergencia from '../components/auth/PieEmergencia.jsx'

const PESTANAS = [
  { id: 'login', texto: 'Iniciar sesión', icono: IconoEntrar },
  { id: 'registro', texto: 'Crear cuenta', icono: IconoUsuarioMas },
]

/** Pantalla "Acceso y Registro" (diseño Figma). */
export default function AccesoRegistro() {
  const { usuario } = useAuth()
  const [pestana, setPestana] = useState('login')
  const [perfil, setPerfil] = useState(ROLES.CIUDADANO)

  if (usuario) return <Navigate to="/alertas" replace />

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 p-4 lg:p-8">
      <AvisoInstitucional />

      <div className="grid flex-1 gap-4 lg:grid-cols-[1.05fr_1fr]">
        <PanelInformativo />

        <section className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-tarjeta lg:p-6">
          <div role="tablist" aria-label="Acceso o registro" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {PESTANAS.map(({ id, texto, icono: Icono }) => (
              <button
                key={id} role="tab" type="button" aria-selected={pestana === id}
                onClick={() => setPestana(id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition ${
                  pestana === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icono /> {texto}
              </button>
            ))}
          </div>

          <SelectorPerfil valor={perfil} onChange={setPerfil} />

          {pestana === 'login'
            ? <FormLogin perfil={perfil} />
            : <FormRegistro perfil={perfil} onRegistrado={() => setPestana('login')} />}

          <PieEmergencia />
        </section>
      </div>
    </main>
  )
}
