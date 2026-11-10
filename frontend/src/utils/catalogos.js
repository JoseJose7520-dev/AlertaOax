// Catálogos compartidos: los valores coinciden con los CHECK de la base de datos.

export const REGIONES = [
  'Cañada', 'Costa', 'Istmo', 'Mixteca', 'Papaloapan', 'Sierra Norte', 'Sierra Sur', 'Valles Centrales',
]

/** Niveles de riesgo (semáforo). "vigilancia" se muestra como nivel bajo/verde. */
export const NIVELES = {
  critico: {
    nombre: 'Crítico', color: 'ROJA', texto: 'ALERTA ROJA · RIESGO CRÍTICO',
    clases: { texto: 'text-riesgo-critico', fondo: 'bg-riesgo-critico-fondo', borde: 'border-riesgo-critico', solido: 'bg-riesgo-critico' },
    hex: '#B91C1C',
  },
  alto: {
    nombre: 'Alto', color: 'NARANJA', texto: 'ALERTA NARANJA · RIESGO ALTO',
    clases: { texto: 'text-riesgo-alto', fondo: 'bg-riesgo-alto-fondo', borde: 'border-riesgo-alto', solido: 'bg-riesgo-alto' },
    hex: '#C2410C',
  },
  medio: {
    nombre: 'Medio', color: 'AMARILLA', texto: 'ALERTA AMARILLA · RIESGO MEDIO',
    clases: { texto: 'text-riesgo-medio', fondo: 'bg-riesgo-medio-fondo', borde: 'border-riesgo-medio', solido: 'bg-riesgo-medio' },
    hex: '#A16207',
  },
  vigilancia: {
    nombre: 'Vigilancia', color: 'VERDE', texto: 'AVISO VERDE · VIGILANCIA',
    clases: { texto: 'text-riesgo-bajo', fondo: 'bg-riesgo-bajo-fondo', borde: 'border-riesgo-bajo', solido: 'bg-riesgo-bajo' },
    hex: '#15803D',
  },
}
export const ORDEN_NIVELES = ['vigilancia', 'medio', 'alto', 'critico']

export const TIPOS_ALERTA = {
  huracan: 'Huracán',
  sismo: 'Sismo',
  inundacion: 'Inundación',
  deslizamiento: 'Deslizamiento',
  otro: 'Otro',
}

export const TIPOS_REPORTE = {
  inundacion: 'Inundación',
  deslave: 'Deslave',
  arbol: 'Árbol caído',
  cable: 'Cable caído',
  vivienda: 'Daño en vivienda',
  otro: 'Otro',
}

export const ESTADOS_REPORTE = {
  recibido: { nombre: 'Recibido', paso: 1, clases: 'bg-crema text-barro-suave' },
  en_atencion: { nombre: 'En atención', paso: 2, clases: 'bg-anil-claro text-anil-oscuro' },
  atendido: { nombre: 'Atendido', paso: 3, clases: 'bg-riesgo-bajo-fondo text-ok-texto' },
}

const FORMATO_FECHA = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
})

/** "Hoy, 23:59", "Mañana, 08:00" o "12 nov, 14:30". */
export function fechaCorta(valor) {
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(hoy.getDate() + 1)
  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  if (fecha.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`
  if (fecha.toDateString() === manana.toDateString()) return `Mañana, ${hora}`
  return FORMATO_FECHA.format(fecha)
}

/** "hace 5 min", "hace 2 h", "hace 3 días". */
export function haceCuanto(valor) {
  const minutos = Math.round((Date.now() - new Date(valor).getTime()) / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
}
