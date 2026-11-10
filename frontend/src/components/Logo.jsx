export default function Logo({ tam = 32, conTexto = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width={tam} height={tam} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#3B3486" />
        <path d="M16 8 L25 23 H7 Z" fill="none" stroke="#FAF7F2" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M16 14 V18" stroke="#FAF7F2" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="16" cy="20.6" r="1.3" fill="#FAF7F2" />
      </svg>
      {conTexto && <span className="text-xl font-bold tracking-tight">AlertaOax</span>}
    </span>
  )
}
