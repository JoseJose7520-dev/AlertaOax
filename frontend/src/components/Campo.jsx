import { useId, useState } from 'react'
import Icono from './Icono.jsx'

/** Campo de texto con etiqueta visible, ícono a la izquierda y, si es contraseña, botón para mostrarla. */
export default function Campo({ etiqueta, icono, tipo = 'text', ayuda, error, extra, className = '', ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const esPassword = tipo === 'password'
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-texto font-semibold">{etiqueta}</label>
        {extra}
      </div>
      <div className="relative">
        {icono && <Icono nombre={icono} tam={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tenue" />}
        <input
          id={id}
          type={esPassword && visible ? 'text' : tipo}
          className={`campo ${icono ? 'pl-11' : ''} ${esPassword ? 'pr-12' : ''} ${error ? 'border-riesgo-critico focus:border-riesgo-critico focus:ring-riesgo-critico/15' : ''}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? `${id}-nota` : undefined}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-1.5 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-tenue hover:bg-hundido hover:text-tinta"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
          >
            <Icono nombre={visible ? 'ojoTachado' : 'ojo'} tam={22} />
          </button>
        )}
      </div>
      {(error || ayuda) && (
        <p id={`${id}-nota`} className={`text-nota ${error ? 'font-semibold text-riesgo-critico-texto' : 'text-tenue'}`}>{error || ayuda}</p>
      )}
    </div>
  )
}
