/** Los tres documentos legales de AlertaOax. Cada uno se lee en su propia pestaña del diálogo. */
export const DOCUMENTOS = [
  {
    id: 'aviso', icono: 'sirena', corto: 'Aviso legal', titulo: 'Aviso Legal',
    bloques: [
      ['Canal complementario al 911', 'AlertaOax es un canal informativo complementario. No sustituye al 911, a la alerta sísmica oficial (SASMEX) ni a las indicaciones de Protección Civil. Si tu vida o la de otra persona corre peligro, llama primero al 911.'],
      ['Origen de las alertas', 'Las alertas solo las publican autoridades validadas por el administrador. La institución que emite cada alerta es responsable de su contenido, nivel de riesgo y vigencia. Los albergues y zonas de riesgo marcados como “ejemplo” no son datos oficiales.'],
      ['Disponibilidad', 'Hacemos lo posible por mantener el servicio en línea, pero una falla de internet, de energía o del servidor puede retrasar o impedir que una alerta llegue. No dependas de un solo medio para informarte.'],
      ['Responsables', 'Proyecto académico del Instituto Tecnológico de Oaxaca (TecNM), materia Gestión de Proyectos de Software. Para dudas, usa el botón de contacto de la plataforma.'],
    ],
  },
  {
    id: 'privacidad', icono: 'candado', corto: 'Privacidad', titulo: 'Política de Privacidad',
    bloques: [
      ['Datos que guardamos', 'Nombre, correo, región, contraseña cifrada (bcrypt), tu plan familiar y los reportes que envías. Si entras con Google, solo recibimos tu nombre y tu correo verificado.'],
      ['Ubicación GPS: uso exclusivo', 'Tu ubicación se pide solo cuando tú tocas “Mi ubicación” o “Usar mi ubicación”, y se usa exclusivamente para mostrarte albergues cercanos y para ubicar los incidentes que reportas. No rastreamos tu ubicación en segundo plano ni guardamos tu historial de movimientos.'],
      ['Región y notificaciones', 'Tu región sirve para enviarte únicamente las alertas que te corresponden.'],
      ['Almacenamiento en tu navegador', 'Usamos almacenamiento local solo para lo esencial: mantener tu sesión, recordar el tema claro/oscuro y tu elección sobre cookies. No usamos cookies de publicidad ni de rastreo de terceros.'],
      ['Tus derechos (ARCO)', 'Puedes pedir acceso, corrección, cancelación u oposición al uso de tus datos escribiendo al equipo de AlertaOax. Tus datos personales los corriges en «Mi perfil», y desde ahí mismo puedes eliminar tu cuenta: se borran tus datos, planes y notificaciones, y los reportes que enviaste se conservan sin tu nombre para el historial de Protección Civil. No vendemos ni compartimos tu información con terceros.'],
    ],
  },
  {
    id: 'terminos', icono: 'documento', corto: 'Términos', titulo: 'Términos y Condiciones',
    bloques: [
      ['Aceptación', 'Al crear una cuenta aceptas estos términos, el Aviso Legal y la Política de Privacidad.'],
      ['Cuentas de autoridad', 'Quien se registra como autoridad declara ocupar el cargo que indica. La cuenta queda pendiente hasta que el administrador la valide y puede darse de baja si el cargo no se confirma.'],
      ['Reportes verídicos', 'Está prohibido enviar reportes falsos o bromas: desvían a las brigadas y pueden poner vidas en riesgo. Describe lo que ves sin datos personales de otras personas.'],
      ['Cuenta y seguridad', 'Mantén tu contraseña en secreto. Podemos desactivar cuentas que hagan mal uso de la plataforma o intenten vulnerarla.'],
    ],
  },
]

// Evento para volver a mostrar el aviso de cookies desde el pie de página
export const EVENTO_COOKIES = 'alertaoax:cookies'
