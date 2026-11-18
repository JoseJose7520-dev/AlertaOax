import Icono from './Icono.jsx'

/** Encabezado de pantalla: rótulo tipo consola, título contundente y descripción opcional. */
export default function Encabezado({ rotulo, titulo, icono, children, acciones }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3.5">
        {icono && (
          <span className="icono-caja mt-1 size-12 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre={icono} tam={28} /></span>
        )}
        <div className="min-w-0">
          {rotulo && <p className="rotulo text-tenue">{rotulo}</p>}
          <h1 className="text-titular font-bold">{titulo}</h1>
          {children && <p className="mt-1.5 max-w-2xl text-tenue">{children}</p>}
        </div>
      </div>
      {acciones}
    </header>
  )
}

/** Grupo de filtros tipo píldora. */
export function Filtros({ opciones, valor, onCambio, etiqueta }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={etiqueta}>
      {opciones.map(([v, t]) => (
        <button key={t} type="button" aria-pressed={valor === v} onClick={() => onCambio(v)} className={`chip ${valor === v ? 'chip-activo' : ''}`}>
          {t}
        </button>
      ))}
    </div>
  )
}
