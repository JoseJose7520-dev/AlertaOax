import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/** Región elegida en el encabezado del ciudadano ({ region, propia, cambiarRegion }). */
export function useRegionActiva() {
  const ctx = useOutletContext()
  const { usuario } = useAuth()
  return ctx?.region ? ctx : { region: usuario?.region, propia: usuario?.region, cambiarRegion: () => {} }
}
