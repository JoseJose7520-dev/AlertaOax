import { Link } from 'react-router-dom'
import Icono from '../components/Icono.jsx'

/** Pantalla temporal para secciones que llegan en el siguiente Sprint. */
export default function Pendiente({ titulo, tarea }) {
  return (
    <section className="flex flex-col items-start gap-3 py-8">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      <p className="text-tenue">Esta sección se construye en la tarea {tarea}.</p>
      <Link to="/" className="btn-neutro">
        <Icono nombre="atras" tam={20} /> Volver
      </Link>
    </section>
  )
}
