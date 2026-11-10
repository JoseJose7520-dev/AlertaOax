const ESTILOS = {
  error: 'bg-riesgo-critico-fondo text-[#7F1414] border-riesgo-critico/30',
  exito: 'bg-riesgo-bajo-fondo text-ok-texto border-riesgo-bajo/30',
  info: 'bg-anil-claro text-anil-oscuro border-anil/20',
}

/** Mensaje en línea. Los errores se anuncian a lectores de pantalla (role="alert"). */
export default function Aviso({ tipo = 'info', children, className = '' }) {
  if (!children) return null
  return (
    <p
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-3.5 py-3 text-texto leading-snug ${ESTILOS[tipo]} ${className}`}
    >
      {children}
    </p>
  )
}
