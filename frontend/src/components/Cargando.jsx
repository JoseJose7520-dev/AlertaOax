export default function Cargando({ texto = 'Cargando…', pantallaCompleta = false }) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-3 text-tenue ${pantallaCompleta ? 'min-h-[calc(100dvh-2rem)]' : 'py-10'}`}
    >
      <span className="size-5 animate-spin rounded-full border-[3px] border-linea border-t-acento" aria-hidden="true" />
      {texto}
    </div>
  )
}
