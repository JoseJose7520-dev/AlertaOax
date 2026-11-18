import { Link } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import Logo from '../components/Logo.jsx'
import PieLegal from '../components/PieLegal.jsx'

/** Radar que barre sin encontrar la ruta: el punto perdido queda fuera del último anillo. */
function RadarPerdido() {
  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[18rem] md:max-w-[26rem]" aria-hidden="true">
      <defs>
        <radialGradient id="np-brillo"><stop offset="0" stopColor="#22D3EE" stopOpacity=".28" /><stop offset="1" stopColor="#2563EB" stopOpacity="0" /></radialGradient>
        <linearGradient id="np-barrido" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#22D3EE" stopOpacity="0" /><stop offset="1" stopColor="#22D3EE" stopOpacity=".45" /></linearGradient>
      </defs>
      <circle cx="160" cy="160" r="130" fill="url(#np-brillo)" />
      {[45, 85, 125].map((r) => <circle key={r} cx="160" cy="160" r={r} fill="none" stroke="currentColor" strokeOpacity=".22" strokeDasharray={r === 125 ? '4 6' : undefined} />)}
      <path d="M160 30v260M30 160h260" stroke="currentColor" strokeOpacity=".14" />
      <g className="barrido-radar" style={{ transformOrigin: '160px 160px' }}>
        <path d="M160 160 L160 35 A125 125 0 0 1 268 98 Z" fill="url(#np-barrido)" />
      </g>
      <circle cx="160" cy="160" r="5" fill="#2563EB" />
      <circle cx="292" cy="62" r="7" fill="#DC2626" />
      <circle cx="292" cy="62" r="15" fill="none" stroke="#DC2626" strokeOpacity=".5" className="onda-radar" style={{ transformOrigin: '292px 62px' }} />
      <text x="248" y="98" fill="currentColor" fillOpacity=".7" fontFamily="JetBrains Mono, monospace" fontSize="11">¿?</text>
    </svg>
  )
}

export default function NoEncontrada() {
  return (
    <div className="topografia flex min-h-[calc(100dvh-2rem)] flex-col px-5 pt-6 pb-6">
      <Link to="/" className="self-start no-underline" aria-label="AlertaOax, inicio"><Logo /></Link>
      <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 py-10 md:grid-cols-[1fr_auto]">
        <div className="flex max-w-lg flex-col items-start gap-4">
          <p className="rotulo flex items-center gap-2 text-riesgo-critico-texto"><Icono nombre="mira" tam={18} /> Señal perdida · Error 404</p>
          <h1 className="font-display text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02] font-bold tracking-tight">404 — Ruta fuera del radar</h1>
          <p className="text-subtitulo text-tinta-suave">La página que buscas no aparece en nuestro mapa. Puede que el enlace esté mal escrito o que ya no exista.</p>
          <Link to="/" className="btn-principal mt-2"><Icono nombre="campana" tam={22} peso="fill" /> Volver a las alertas</Link>
        </div>
        <div className="flex justify-center text-acento dark:text-cian"><RadarPerdido /></div>
      </main>
      <PieLegal />
    </div>
  )
}
