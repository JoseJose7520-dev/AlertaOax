import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const TemaContext = createContext(null)
const CLAVE = 'alertaoax-tema'

function temaInicial() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
  } catch { /* sin almacenamiento: se usa el del sistema */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

/** Tema claro/oscuro: sigue al sistema hasta que la persona elige uno con el botón Sol/Luna. */
export function TemaProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'oscuro' ? '#0B1120' : '#EEF2F6')
  }, [tema])

  const alternar = useCallback(() => {
    setTema((t) => {
      const nuevo = t === 'oscuro' ? 'claro' : 'oscuro'
      try { localStorage.setItem(CLAVE, nuevo) } catch { /* ignorar */ }
      return nuevo
    })
  }, [])

  return <TemaContext.Provider value={{ tema, alternar }}>{children}</TemaContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTema = () => useContext(TemaContext)
