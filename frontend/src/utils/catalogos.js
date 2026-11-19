// Catálogos compartidos: los valores coinciden con los CHECK de la base de datos.

export const REGIONES = [
  'Cañada', 'Costa', 'Istmo', 'Mixteca', 'Papaloapan', 'Sierra Norte', 'Sierra Sur', 'Valles Centrales',
]

/** Niveles de riesgo (semáforo). "vigilancia" se muestra como nivel bajo/verde. */
export const NIVELES = {
  critico: {
    nombre: 'Crítico', color: 'roja', texto: 'Alerta roja: riesgo crítico',
    clases: { texto: 'text-riesgo-critico-texto', fondo: 'bg-riesgo-critico-fondo', borde: 'border-riesgo-critico', solido: 'bg-riesgo-critico', sobre: 'text-white' },
    hex: '#DC2626',
  },
  alto: {
    nombre: 'Alto', color: 'naranja', texto: 'Alerta naranja: riesgo alto',
    clases: { texto: 'text-riesgo-alto-texto', fondo: 'bg-riesgo-alto-fondo', borde: 'border-riesgo-alto', solido: 'bg-riesgo-alto', sobre: 'text-abisal' },
    hex: '#EA580C',
  },
  medio: {
    nombre: 'Medio', color: 'amarilla', texto: 'Alerta amarilla: riesgo medio',
    clases: { texto: 'text-riesgo-medio-texto', fondo: 'bg-riesgo-medio-fondo', borde: 'border-riesgo-medio', solido: 'bg-riesgo-medio', sobre: 'text-abisal' },
    hex: '#D97706',
  },
  vigilancia: {
    nombre: 'Vigilancia', color: 'verde', texto: 'Aviso verde: vigilancia',
    clases: { texto: 'text-ok-texto', fondo: 'bg-riesgo-bajo-fondo', borde: 'border-riesgo-bajo', solido: 'bg-riesgo-bajo', sobre: 'text-abisal' },
    hex: '#059669',
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

/** Ícono (duotono) de cada fenómeno o tipo de reporte. */
export const ICONO_TIPO = {
  huracan: 'huracan', sismo: 'sismo', inundacion: 'inundacion', deslizamiento: 'deslizamiento', otro: 'otro',
  deslave: 'deslave', arbol: 'arbol', cable: 'cable', vivienda: 'vivienda',
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
  recibido: { nombre: 'Recibido', paso: 1, clases: 'bg-hundido text-tinta-suave' },
  en_atencion: { nombre: 'En atención', paso: 2, clases: 'bg-acento-claro text-acento-fuerte' },
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
