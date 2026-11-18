/**
 * Honeypot anti-spam: un campo que las personas no ven ni alcanzan con el teclado.
 * Los bots que rellenan todo lo llenan y el servidor rechaza el envío.
 */
export default function Trampa({ valor, onCambio }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
      <label>
        No llenes este campo
        <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" value={valor} onChange={(e) => onCambio(e.target.value)} />
      </label>
    </div>
  )
}
