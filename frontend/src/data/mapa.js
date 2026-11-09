// DATOS DE EJEMPLO para el mapa de riesgo. Se reemplazarán por la API (GET /api/mapa/...).
// Las zonas son círculos aproximados, solo para maquetar; luego serán polígonos reales (GeoJSON).

export const SEMAFORO = [
  { id: 'critico',    texto: 'Crítico',    detalle: 'Costa / Pochutla',  color: '#c81e1e', fondo: 'bg-red-50 border-red-200' },
  { id: 'alto',       texto: 'Alto',       detalle: 'Sierra Sur',        color: '#ea6a0a', fondo: 'bg-orange-50 border-orange-200' },
  { id: 'medio',      texto: 'Medio',      detalle: 'Valles Centrales',  color: '#d4a008', fondo: 'bg-amber-50 border-amber-200' },
  { id: 'vigilancia', texto: 'Vigilancia', detalle: 'Mixteca / Istmo',   color: '#12a150', fondo: 'bg-green-50 border-green-200' },
]

export const ZONAS = [
  { id: 'costa', nombre: 'Costa (zona de impacto)', nivel: 'critico', centro: [15.78, -96.55], radio: 75000 },
  { id: 'sierra-sur', nombre: 'Sierra Sur', nivel: 'alto', centro: [16.45, -96.45], radio: 45000 },
  { id: 'valles', nombre: 'Valles Centrales', nivel: 'medio', centro: [17.05, -96.72], radio: 35000 },
  { id: 'mixteca', nombre: 'Mixteca', nivel: 'vigilancia', centro: [17.6, -97.6], radio: 50000 },
  { id: 'istmo', nombre: 'Istmo', nivel: 'vigilancia', centro: [16.5, -95.0], radio: 45000 },
]

export const CAPAS = [
  { id: 'huracan', texto: 'Huracán Carlotta (Cat 2)', detalle: 'Cono de trayectoria y radio de vientos', color: '#c81e1e', icono: 'onda' },
  { id: 'sismos', texto: 'Red Sísmica SSN en Vivo', detalle: 'Epicentros últimas 24 hrs (> M3.5)', color: '#1a77b3', icono: 'rayo' },
  { id: 'cuencas', texto: 'Cuencas y Desbordamientos', detalle: 'Río Atoyac y Río Salado aforados', color: '#1a77b3', icono: 'gota' },
  { id: 'cortes', texto: 'Cortes Viales y Deslaves', detalle: 'Carretera Barranca Larga - Ventanilla', color: '#c81e1e', icono: 'alerta' },
  { id: 'albergues', texto: 'Albergues y Refugios', detalle: '38 centros con disponibilidad en tiempo real', color: '#0b5c93', icono: 'casa' },
  { id: 'hospitales', texto: 'Hospitales y Centros de Salud', detalle: 'Capacidad de camas y triaje de urgencias', color: '#12a150', icono: 'hospital' },
]

export const HURACAN = {
  ojo: [15.3, -96.75], radio: 55000,
  trayectoria: [[14.5, -98.2], [15.3, -96.75], [16.1, -95.8]],
}

export const SISMOS = [
  { id: 's1', lugar: 'Crucecita, Huatulco', magnitud: 4.8, profundidad: '12 km', pos: [15.745, -96.13] },
  { id: 's2', lugar: 'Pinotepa Nacional', magnitud: 3.9, profundidad: '18 km', pos: [16.34, -98.05] },
]

export const CUENCAS = [
  { id: 'c1', nombre: 'Río Atoyac', nota: 'Caudal al 88% de capacidad crítica', pos: [17.03, -96.745] },
  { id: 'c2', nombre: 'Río Salado', nota: 'Nivel en vigilancia', pos: [16.99, -96.70] },
]

export const CORTES = [
  { id: 'k1', nombre: 'Corte Carretero km 74', nota: 'Barranca Larga - Ventanilla', pos: [15.99, -96.6] },
]

export const HOSPITALES = [
  { id: 'h1', nombre: 'Hospital General de Pochutla', pos: [15.7335, -96.4775] },
  { id: 'h2', nombre: 'Hospital de Puerto Escondido', pos: [15.8695, -97.0745] },
  { id: 'h3', nombre: 'Hospital Civil “Dr. Aurelio Valdivieso”', pos: [17.0655, -96.7225] },
]

export const ALBERGUES = [
  { id: 'a1', nombre: 'Escuela Primaria Benito Juárez', direccion: 'Av. Lázaro Cárdenas s/n, Barrio El Progreso, San Pedro Pochutla, Oax.', ocupacion: 45, capacidad: 180, servicios: ['Agua potable', 'Planta diésel de emergencia', 'Cocina comunitaria SEDENA', 'Médico de guardia SSPO'], pos: [15.7452, -96.4668] },
  { id: 'a2', nombre: 'Auditorio Municipal de Pochutla', direccion: 'Centro, San Pedro Pochutla, Oax.', ocupacion: 120, capacidad: 300, servicios: ['Agua potable', 'Sanitarios', 'Médico de guardia SSPO'], pos: [15.7425, -96.4625] },
  { id: 'a3', nombre: 'Domo Deportivo de Huatulco', direccion: 'La Crucecita, Santa María Huatulco, Oax.', ocupacion: 60, capacidad: 400, servicios: ['Agua potable', 'Planta diésel de emergencia', 'Cocina comunitaria SEDENA'], pos: [15.7455, -96.1325] },
  { id: 'a4', nombre: 'Secundaria Técnica No. 12', direccion: 'Puerto Escondido, San Pedro Mixtepec, Oax.', ocupacion: 150, capacidad: 220, servicios: ['Agua potable', 'Sanitarios'], pos: [15.8685, -97.0695] },
  { id: 'a5', nombre: 'Casa de Cultura de Juquila', direccion: 'Centro, Santa Catarina Juquila, Oax.', ocupacion: 20, capacidad: 150, servicios: ['Agua potable', 'Cocina comunitaria SEDENA'], pos: [16.2355, -97.2865] },
  { id: 'a6', nombre: 'Centro de Convenciones de Oaxaca', direccion: 'Oaxaca de Juárez, Oax.', ocupacion: 30, capacidad: 500, servicios: ['Agua potable', 'Planta diésel de emergencia', 'Médico de guardia SSPO'], pos: [17.0775, -96.7165] },
]

// Localidades para el buscador del mapa
export const LOCALIDADES = [
  { nombre: 'San Pedro Pochutla, Oaxaca', pos: [15.7432, -96.4656], zoom: 12 },
  { nombre: 'Puerto Escondido, Oaxaca', pos: [15.862, -97.067], zoom: 12 },
  { nombre: 'Santa María Huatulco, Oaxaca', pos: [15.7455, -96.1325], zoom: 12 },
  { nombre: 'Oaxaca de Juárez, Oaxaca', pos: [17.0732, -96.7266], zoom: 12 },
  { nombre: 'Santa Catarina Juquila, Oaxaca', pos: [16.2369, -97.2858], zoom: 12 },
  { nombre: 'Juchitán de Zaragoza, Oaxaca', pos: [16.4346, -95.0194], zoom: 12 },
  { nombre: 'Tuxtepec, Oaxaca', pos: [18.0883, -96.1217], zoom: 12 },
  { nombre: 'Huajuapan de León, Oaxaca', pos: [17.8043, -97.7772], zoom: 12 },
]

export const BASES = [
  { id: 'topo', texto: 'Topográfico', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', atribucion: '&copy; OpenStreetMap, SRTM | &copy; OpenTopoMap (CC-BY-SA)' },
  { id: 'sat', texto: 'Satelital', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', atribucion: 'Tiles &copy; Esri' },
  { id: 'calles', texto: 'Calles', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', atribucion: '&copy; OpenStreetMap' },
  { id: 'relieve', texto: 'Relieve', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', atribucion: 'Tiles &copy; Esri' },
]
