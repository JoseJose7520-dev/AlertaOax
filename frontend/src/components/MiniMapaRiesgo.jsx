/**
 * Mapa esquemático de las regiones de Oaxaca (SVG). Es una ilustración, no un mapa geográfico exacto.
 * El mapa real e interactivo está en la página /mapa (Leaflet).
 */
export default function MiniMapaRiesgo() {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <svg viewBox="0 0 320 200" role="img" aria-label="Mapa esquemático de regiones de Oaxaca. Costa en riesgo máximo, Valles Centrales en seguimiento." className="h-auto w-full">
        <g className="fill-slate-200 stroke-white" strokeWidth="2">
          <polygon points="150,30 215,22 250,45 230,85 185,80 150,65" />          {/* Papaloapan */}
          <polygon points="215,22 275,38 285,75 250,45" className="fill-slate-300" /> {/* Sierra Norte */}
          <polygon points="30,50 105,38 150,65 140,105 95,120 40,100" />          {/* Mixteca */}
          <polygon points="250,45 285,75 300,110 262,128 235,105 230,85" />       {/* Istmo */}
          <polygon points="140,105 185,80 230,85 235,105 205,125 150,122" className="fill-slate-300" />
          <polygon points="95,120 140,105 150,122 205,125 190,145 120,148" />      {/* Sierra Sur */}
        </g>

        {/* Valles Centrales (en seguimiento) */}
        <polygon points="148,72 190,70 196,95 160,102 143,92" className="fill-oax-100 stroke-oax-600" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="152" y="88" className="fill-oax-800" fontSize="7" fontWeight="700">VALLES CENTRALES</text>

        {/* Costa (zona crítica) */}
        <ellipse cx="160" cy="165" rx="70" ry="20" className="fill-red-500/15" />
        <polygon points="85,150 235,150 215,176 100,180" className="fill-red-100 stroke-red-600" strokeWidth="1.5" />
        <text x="118" y="168" className="fill-red-700" fontSize="8" fontWeight="700">COSTA (ZONA ROJA)</text>
        <circle cx="160" cy="170" r="3" className="fill-red-600" />

        <g className="fill-slate-500" fontSize="6.5" fontWeight="600">
          <text x="170" y="42">PAPALOAPAN</text>
          <text x="60" y="80">MIXTECA</text>
          <text x="252" y="102">ISTMO</text>
          <text x="148" y="138">SIERRA SUR</text>
        </g>
      </svg>
      <figcaption className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-red-600" /> Huracán Carlotta: Costa
      </figcaption>
    </figure>
  )
}
