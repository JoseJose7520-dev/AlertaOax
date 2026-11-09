// DATOS DE EJEMPLO tomados del diseño de Figma.
// Se reemplazarán por la API (GET /api/alertas y GET /api/alertas/:id) cuando el backend esté listo.

export const NIVELES = {
  critico:    { etiqueta: 'Nivel crítico: rojo',      clases: 'bg-red-100 text-red-800',       color: '#c81e1e' },
  alto:       { etiqueta: 'Nivel alto: naranja',      clases: 'bg-orange-100 text-orange-800', color: '#ea6a0a' },
  medio:      { etiqueta: 'Nivel medio: amarillo',    clases: 'bg-amber-100 text-amber-800',   color: '#d4a008' },
  vigilancia: { etiqueta: 'Vigilancia: verde',        clases: 'bg-green-100 text-green-800',   color: '#12a150' },
}

export const TIPOS = [
  { id: 'sismo', texto: 'Sismo' },
  { id: 'huracan', texto: 'Huracán' },
  { id: 'inundacion', texto: 'Inundación' },
  { id: 'deslizamiento', texto: 'Deslizamiento' },
]

export const ALERTAS = [
  {
    id: 'huracan-carlotta', nivel: 'critico', tipo: 'huracan', destacada: true,
    titulo: 'Alerta Roja por Huracán Categoría 3 “Carlotta” en Costa de Oaxaca',
    resumen: 'Fuertes vientos superiores a 195 km/h y oleaje elevado de 4 a 6 metros en Puerto Escondido, Bahías de Huatulco y San Pedro Pochutla. Suspensión total e inmediata de navegación marítima, actividades turísticas de playa y clases presenciales en todos los niveles educativos.',
    emisora: 'Coordinación Estatal de Protección Civil y Gestión de Riesgos (CEPCyGR)',
    vigencia: 'Hoy 23:59 hrs', proximaAct: 'Próxima act. en 2h',
    region: 'Costa e Istmo', precipitacion: '150 a 250 mm', refugios: '38 Activos',
  },
  {
    id: 'sismo-crucecita', nivel: 'medio', tipo: 'sismo',
    titulo: 'Sismo Magnitud 4.8 con epicentro en Crucecita, Huatulco',
    resumen: 'Percepción moderada en municipios de la Costa y Sierra Sur. Sin reporte de daños estructurales mayores; protocolo de inspección física en escuelas y clínicas en desarrollo.',
    emisora: 'SSN / CEPCO (Catálogo #OAX-8841)', tiempo: 'Hace 35 min',
  },
  {
    id: 'rio-atoyac', nivel: 'alto', tipo: 'inundacion',
    titulo: 'Riesgo de desbordamiento en Río Atoyac (Valles Centrales)',
    resumen: 'Caudal al 88% de su capacidad crítica a la altura del Puente IV Centenario y San Jacinto Amilpas. Se recomienda despejar márgenes ribereños y mantenerse en alerta preventiva.',
    emisora: 'CONAGUA / Protección Civil Mpal. Oaxaca de Juárez', tiempo: 'Vigencia: Próximas 6 horas',
  },
  {
    id: 'carretera-ventanilla', nivel: 'medio', tipo: 'deslizamiento',
    titulo: 'Derrumbes en Carretera Barranca Larga - Ventanilla km 74',
    resumen: 'Paso vehicular intermitente por deslave de talud rocoso y material arcilloso. Maquinaria pesada en maniobras de despeje. Conduzca con extrema precaución o tome vía alterna por Miahuatlán.',
    emisora: 'Policía Vial y Caminos de Oaxaca', tiempo: 'Notificado hace 1h',
  },
]

// Contenido ampliado de la pantalla "Detalle de alerta" (solo la alerta destacada, por ahora)
export const DETALLES = {
  'huracan-carlotta': {
    tituloDetalle: 'Alerta Roja por Huracán Categoría 3 ‘Carlotta’ en Costa y Sierra Sur',
    folio: '#PC-OAX-2025-0048',
    emisor: 'CEPCyGR Gobierno de Oaxaca',
    emision: 'Hoy a las 06:30 hrs',
    vigenciaOficial: 'Hoy 23:59 hrs (Reevaluación)',
    fase: 'Impacto Directo Inminente',
    diagnostico: 'El centro del meteoro sostiene vientos sostenidos de 195 km/h con rachas de 240 km/h. Se prevé oleaje elevado de 5 a 7 metros y precipitaciones acumuladas de 250 a 350 mm en las próximas 18 horas.',
    municipios: ['San Pedro Pochutla', 'Santa María Huatulco', 'Puerto Escondido', 'Santa Catarina Juquila'],
    protocolo: [
      { titulo: 'Resguardo inmediato en inmuebles seguros o albergues', texto: 'Permanezca en cuartos interiores lejos de ventanas. Cierre el suministro de gas LP en tanques estacionarios o cilindros y desconecte el interruptor general de energía eléctrica.' },
      { titulo: 'Tener a la mano mochila de emergencia certificada', texto: 'Empaque actas y títulos en bolsa hermética. Mantenga 4 litros de agua potable por persona por un mínimo de 72 horas, linterna impermeable con baterías de repuesto y radio AM/FM.' },
      { titulo: 'Evitar cruzar ríos, arroyos o vados crecidos', texto: 'No transite a pie ni en vehículo por tramos inundados. En municipios de la Sierra Sur, aléjese de laderas con pendiente pronunciada ante el riesgo inminente de flujos de lodo y deslaves.' },
      { titulo: 'Mantenerse informado exclusivamente por canales oficiales', texto: 'Desestime rumores de mensajería instantánea. Los únicos avisos con validez civil son emitidos vía AlertaOax y las cuentas certificadas de la CEPCyGR Oaxaca.' },
    ],
    boletin: { sello: 'SHA-256', texto: 'Firma criptográfica expedida por el Centro de Coordinación C4 Oaxaca.' },
    infraCorte: 'Corte 08:40 hrs',
    infraestructura: [
      { nombre: 'Electricidad (CFE)', estado: 'Parcial', tono: 'ambar', texto: 'Afectación parcial en Huatulco y Puerto Ángel. Cuadrillas especializadas se encuentran en sitio restableciendo circuitos troncales.' },
      { nombre: 'Agua Potable (SOAPA / CEA)', estado: 'Regular', tono: 'azul', texto: 'Servicio regular con advertencia de turbiedad en tomas domiciliarias. Se aconseja hervir o clorar el agua antes de su consumo.' },
      { nombre: 'Carreteras y Puentes', estado: 'Corte Preventivo', tono: 'rojo', texto: 'Corte preventivo en Carretera Federal 200 tramo Pochutla - Huatulco por crecida de afluentes y acumulación de sedimentos.' },
      { nombre: 'Red Celular y Comunicaciones', estado: 'Operando', tono: 'verde', texto: 'Operando con radiobases de respaldo y generadores diésel en las 4 cabeceras municipales prioritarias.' },
    ],
    comandancia: { nombre: 'Comandancia Regional Costa', sede: 'Centro Operativo de Protección Civil Oaxaca en San Pedro Pochutla', telefono: '(958) 587 0122', tel: '+529585870122', mensajeria: 'Mensajería de Emergencia CEPCyGR' },
    mapa: {
      centro: [15.74, -96.47], radio: 38000, albergues: 8,
      puntos: [
        { nombre: 'Pto. Escondido', pos: [15.862, -97.067], tipo: 'ciudad' },
        { nombre: 'Mando CEPCyGR', pos: [15.7432, -96.4656], tipo: 'mando' },
        { nombre: 'Bahías Huatulco', pos: [15.7517, -96.1346], tipo: 'ciudad' },
        { nombre: 'Hosp. Gral. Pochutla', pos: [15.7335, -96.4775], tipo: 'hospital' },
      ],
    },
  },
}

export const TELEFONOS = [
  { numero: '911', nombre: 'Emergencias Generales Estatales', tel: '911', principal: true },
  { numero: '951 144 7020', nombre: 'Protección Civil Oaxaca (CEPCyGR)', tel: '+529511447020' },
  { numero: '089', nombre: 'Denuncia Anónima • Guardia Estatal', tel: '089' },
]

export const SINCRONIZACION = '14:42 hrs (CENAPRED / SMN)'
