import { useState } from 'react'
import { EVENTO_COOKIES } from '../utils/legal.js'
import ModalTerminos from './ModalTerminos.jsx'
import { DOCUMENTOS } from '../utils/legal.js'

/** Pie global: los tres documentos legales (en diálogo), preferencias de cookies y recordatorio del 911. */
export default function PieLegal({ className = '' }) {
  const [seccion, setSeccion] = useState(null)
  const estilo = 'min-h-8 font-medium text-tenue underline-offset-4 hover:text-tinta hover:underline'
  return (
    <footer className={`flex flex-col items-center gap-1.5 text-center text-nota text-tenue ${className}`}>
      <nav aria-label="Información legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5">
        {DOCUMENTOS.map((d) => (
          <button key={d.id} type="button" onClick={() => setSeccion(d.id)} className={estilo}>{d.titulo}</button>
        ))}
        <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO_COOKIES))} className={estilo}>Cookies</button>
      </nav>
      <p>© 2026 AlertaOax · Canal complementario: ante una emergencia llama al <a href="tel:911" className="font-bold">911</a>.</p>
      <ModalTerminos abierto={seccion !== null} seccion={seccion ?? 'terminos'} onCerrar={() => setSeccion(null)} />
    </footer>
  )
}
