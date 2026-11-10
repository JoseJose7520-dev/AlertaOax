import { NavLink } from 'react-router-dom'

const enlaces = [
  { to: '/', texto: 'Inicio' },
  { to: '/mapa', texto: 'Mapa' },
  { to: '/login', texto: 'Iniciar sesión' },
  { to: '/registro', texto: 'Registrarse' },
]

export default function Navbar() {
  return (
    <header className="bg-red-700 text-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 p-4">
        <span className="mr-auto text-xl font-bold">AlertaOax</span>
        {enlaces.map((e) => (
          <NavLink
            key={e.to}
            to={e.to}
            className={({ isActive }) => (isActive ? 'font-semibold underline' : 'hover:underline')}
          >
            {e.texto}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
