import { useId } from 'react'

/** Emblema de AlertaOax: radar sobre curvas de nivel, en degradado cobalto → cian. */
export default function Logo({ tam = 34, conTexto = true, className = '', claro = false }) {
  // Id único por instancia: si otro logo está oculto (display:none), su degradado no se pintaría
  const g = `logo-g-${useId().replace(/[^\w-]/g, '')}`
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={tam} height={tam} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2563EB" />
            <stop offset="1" stopColor="#0891B2" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill={`url(#${g})`} />
        <path d="M7 27c5-2 8-7 13-7s8 5 13 7" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" />
        <path d="M7 31c5-2 8-5 13-5s8 3 13 5" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.4" />
        <circle cx="20" cy="17" r="9.5" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" />
        <circle cx="20" cy="17" r="5" fill="none" stroke="#fff" strokeWidth="1.8" />
        <path d="M20 17 L27 10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="20" cy="17" r="2.2" fill="#fff" />
      </svg>
      {conTexto && (
        <span className={`text-[22px] font-bold ${claro ? 'text-white' : 'text-tinta'}`}>
          Alerta<span className={claro ? 'text-cyan-300' : 'text-acento dark:text-acento-fuerte'}>Oax</span>
        </span>
      )}
    </span>
  )
}
