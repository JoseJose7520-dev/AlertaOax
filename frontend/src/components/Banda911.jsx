import Icono from './Icono.jsx'

/** Franja fija de emergencia, siempre visible arriba de cada pantalla. Alto: 2rem (var --banda). */
export default function Banda911() {
  return (
    <a
      href="tel:911"
      className="fixed inset-x-0 top-0 z-40 flex h-8 items-center justify-center gap-2 bg-riesgo-critico px-3 text-nota font-semibold text-white no-underline hover:brightness-110 focus-visible:outline-offset-[-3px]"
    >
      <Icono nombre="telefono" tam={16} peso="fill" />
      <span>¿Emergencia? <span className="max-[359px]:hidden">Tu vida es primero:</span> llama al <strong className="font-bold">911</strong></span>
    </a>
  )
}
