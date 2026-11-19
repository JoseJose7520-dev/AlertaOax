import { useId, useState } from 'react'
import Icono from './Icono.jsx'

/**
 * Campo de texto con etiqueta visible, ícono a la izquierda y, si es contraseña, botón para mostrarla.
 * Con `contador` y `maxLength` muestra cuántos caracteres van (por ejemplo 20/32) mientras se escribe.
 */
export default function Campo({ etiqueta, icono, tipo = 'text', ayuda, error, extra, contador = false, className = '', ...props }) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const esPassword = tipo === 'password'
  const max = props.maxLength
  const largo = String(props.value ?? '').length
  const verContador = contador && max > 0
  const cerca = verContador && largo >= max - 4
  const conNota = error || ayuda || verContador
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
          aria-describedby={conNota ? `${id}-nota` : undefined}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-1.5 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-tenue hover:bg-hundido hover:text-tinta"
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            aria-controls={id}
          >
            <Icono nombre={visible ? 'ojoTachado' : 'ojo'} tam={22} />
          </button>
        )}
      </div>
      {conNota && (
        <div className="flex items-start justify-between gap-3">
          <p id={`${id}-nota`} className={`text-nota ${error ? 'font-semibold text-riesgo-critico-texto' : 'text-tenue'}`}>{error || ayuda}</p>
          {verContador && (
            <span
              className={`shrink-0 text-nota tabular-nums ${largo >= max ? 'font-bold text-riesgo-critico-texto' : cerca ? 'font-semibold text-riesgo-alto-texto' : 'text-tenue'}`}
              aria-live="polite"
              aria-label={`${largo} de ${max} caracteres`}
            >
              {largo}/{max}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
