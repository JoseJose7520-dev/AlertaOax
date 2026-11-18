import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

// Configuración pública del servidor (Google, contacto). Se pide una sola vez por visita.
let pedida = null
function cargar() {
  pedida ??= api.get('/config').catch(() => { pedida = null; return {} })
  return pedida
}

export function useConfig() {
  const [config, setConfig] = useState({})
  useEffect(() => { let vivo = true; cargar().then((c) => vivo && setConfig(c ?? {})); return () => { vivo = false } }, [])
  return config
}
