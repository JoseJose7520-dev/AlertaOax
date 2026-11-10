// Íconos de línea (SVG) usados en toda la app. Decorativos por defecto (aria-hidden).
const TRAZOS = {
  campana: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  mapa: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14',
  mochila: 'M5 7h14v14H5zM9 7V5a3 3 0 0 1 6 0v2M9 13h6',
  mas: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 8v8M8 12h8',
  ubicacion: 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5',
  alerta: 'M12 3 L22 20 H2 ZM12 10v4M12 17v.2',
  flecha: 'M5 12h14M13 6l6 6-6 6',
  atras: 'M15 5l-7 7 7 7',
  derecha: 'M9 5l7 7-7 7',
  telefono: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  casa: 'M3 11l9-7 9 7v9H3zM10 20v-5h4v5',
  navegar: 'M3 11l18-8-8 18-2-8z',
  palomita: 'M5 12l5 5 9-10',
  salir: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  camara: 'M4 8h3l2-3h6l2 3h3v11H4zM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M4 21a8 8 0 0 1 16 0',
  escudo: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  grafica: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  lista: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  sismo: 'M2 12h4l2-5 3 10 3-8 2 3h6',
  inundacion: 'M3 15c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2M3 19c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2M12 3v7',
  huracan: 'M12 4a8 8 0 1 0 8 8M12 9a3 3 0 1 0 3 3M20 4l-4 4',
  deslizamiento: 'M3 20h18M5 20l5-9 3 4 2-3 4 8',
  arbol: 'M12 21v-6M7 15h10l-5-11z',
  cable: 'M4 4v16M20 4v16M4 7c5 6 11 6 16 0M13 13l-2 3h3l-2 3',
  vivienda: 'M3 11l9-7 9 7v9H3zM10 20v-5h4v5',
  otro: 'M12 8v5M12 16v.2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
  deslave: 'M3 20h18M5 20l5-9 3 4 2-3 4 8',
  cerrar: 'M6 6l12 12M18 6L6 18',
}

export default function Icono({ nombre, tam = 24, grosor = 2, className = '', etiqueta }) {
  const d = TRAZOS[nombre] ?? TRAZOS.otro
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      {...(etiqueta ? { role: 'img', 'aria-label': etiqueta } : { 'aria-hidden': true })}
    >
      <path d={d} />
    </svg>
  )
}
