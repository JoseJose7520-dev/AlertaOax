// Contenido del módulo de preparación (HU-05). Recomendaciones generales de protección civil.

export const GUIAS = [
  {
    id: 'sismo',
    nombre: 'Sismo',
    resumen: 'Agáchate, cúbrete y sujétate',
    antes: [
      'Identifica las zonas seguras de tu casa: bajo mesas firmes o junto a muros de carga.',
      'Fija a la pared muebles altos, repisas y tanques de gas.',
      'Acuerda con tu familia un punto de reunión fuera de casa.',
    ],
    durante: [
      'Agáchate, cúbrete la cabeza y sujétate de algo firme.',
      'Aléjate de ventanas, espejos y objetos que puedan caer.',
      'No uses elevadores ni corras hacia la salida mientras tiembla.',
    ],
    despues: [
      'Sal con calma y revisa si hay heridos.',
      'Si hueles a gas, no prendas luces ni cerillos; abre ventanas y sal.',
      'Espera réplicas y no entres a construcciones dañadas.',
    ],
  },
  {
    id: 'inundacion',
    nombre: 'Inundación',
    resumen: 'Sube a lo alto y aléjate de ríos',
    antes: [
      'Ubica en el mapa el albergue y el camino más alto cerca de tu casa.',
      'Guarda documentos en bolsas cerradas y en un lugar elevado.',
      'Limpia coladeras y canales cercanos a tu casa.',
    ],
    durante: [
      'Sube a la parte más alta de tu casa o a un lugar elevado.',
      'Desconecta la luz y el gas si el agua empieza a entrar.',
      'No camines ni manejes por corrientes: 15 cm de agua pueden derribarte.',
    ],
    despues: [
      'No regreses a casa hasta que la autoridad lo indique.',
      'No uses aparatos eléctricos mojados.',
      'Hierve o desinfecta el agua antes de tomarla.',
    ],
  },
  {
    id: 'huracan',
    nombre: 'Huracán',
    resumen: 'Asegura tu casa y ten tu mochila lista',
    antes: [
      'Revisa techos, puertas y ventanas; retira objetos que el viento pueda lanzar.',
      'Ten lista tu mochila de emergencia y carga tu celular.',
      'Si vives en la playa o junto a un río, identifica tu albergue.',
    ],
    durante: [
      'Quédate bajo techo, lejos de ventanas.',
      'Si te indican evacuar, hazlo de inmediato.',
      'La calma del "ojo" no es el final: el viento regresa.',
    ],
    despues: [
      'Aléjate de cables caídos y árboles inestables.',
      'Reporta daños en AlertaOax para que la autoridad los atienda.',
      'Sigue solo la información de fuentes confiables.',
    ],
  },
  {
    id: 'deslizamiento',
    nombre: 'Deslave',
    resumen: 'Atiende las grietas y los ruidos del cerro',
    antes: [
      'Revisa si hay grietas en el terreno, muros o bardas cerca de tu casa.',
      'Mantén limpias las cunetas y desagües para que el agua no se acumule.',
      'Identifica una ruta para salir hacia terreno firme y alto.',
    ],
    durante: [
      'Si escuchas ruidos de árboles o rocas que se mueven, aléjate de inmediato.',
      'Muévete hacia los lados del deslave, nunca cuesta abajo.',
      'No cruces caminos cubiertos de lodo o piedras.',
    ],
    despues: [
      'No regreses hasta que la autoridad diga que es seguro.',
      'Aléjate de la zona: pueden ocurrir más deslaves.',
      'Reporta caminos bloqueados y daños en AlertaOax.',
    ],
  },
]

export const MOCHILA = [
  { id: 'agua', nombre: 'Agua', detalle: '4 litros por persona al día' },
  { id: 'comida', nombre: 'Comida enlatada', detalle: 'Para 3 días, con abrelatas' },
  { id: 'linterna', nombre: 'Linterna y pilas', detalle: 'Pilas de repuesto' },
  { id: 'radio', nombre: 'Radio de pilas', detalle: 'Para escuchar avisos sin luz' },
  { id: 'botiquin', nombre: 'Botiquín y medicinas', detalle: 'Las que toma tu familia' },
  { id: 'documentos', nombre: 'Documentos en bolsa', detalle: 'INE, actas, escrituras' },
  { id: 'ropa', nombre: 'Ropa y cobija', detalle: 'Un cambio por persona' },
  { id: 'efectivo', nombre: 'Dinero en efectivo', detalle: 'Billetes y monedas' },
]
