import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'

/**
 * Carga datos de la API al montar el componente.
 * Con { intervalo: ms } vuelve a consultar cada cierto tiempo sin mostrar "cargando" (ideal para alertas).
 * Devuelve { datos, cargando, error, recargar }.
 */
export function useApi(ruta, { intervalo = 0 } = {}) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!ruta) return undefined
    let activo = true
    const cargar = () => api.get(ruta)
      .then((datos) => activo && setEstado({ datos, cargando: false, error: '' }))
      .catch((err) => activo && setEstado((e) => ({ datos: e.datos, cargando: false, error: e.datos ? '' : err.message })))
    cargar()
    const reloj = intervalo > 0 ? setInterval(cargar, intervalo) : null
    return () => {
      activo = false
      if (reloj) clearInterval(reloj)
    }
  }, [ruta, version, intervalo])

  const recargar = useCallback(() => {
    setEstado((e) => ({ ...e, cargando: true }))
    setVersion((v) => v + 1)
  }, [])

  return { ...estado, recargar }
}
