import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

export default function NoEncontrada() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-start justify-center gap-4 px-5">
      <Logo />
      <h1 className="text-titular font-bold">No encontramos esta página</h1>
      <p className="text-tenue">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <Link to="/" className="btn-principal">Ir al inicio</Link>
    </div>
  )
}
