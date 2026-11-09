import { useState } from 'react'
import { IconoCandado, IconoOjo, IconoOjoTachado } from '../Iconos.jsx'

export default function CampoPassword({ id, valor, onChange, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="campo">
      <IconoCandado className="shrink-0 text-slate-400" />
      <input
        id={id} type={visible ? 'text' : 'password'} value={valor} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} required minLength={6}
      />
      <button
        type="button" onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="shrink-0 text-slate-400 hover:text-slate-700"
      >
        {visible ? <IconoOjoTachado /> : <IconoOjo />}
      </button>
    </div>
  )
}
