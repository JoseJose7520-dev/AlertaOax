# Backend — Express + PostgreSQL

API REST de AlertaOax. Estructura por capas: **rutas → controladores → modelos**.

## Puesta en marcha

Requisitos: Node.js 18 o superior y PostgreSQL 14 o superior (con su contraseña de `postgres`).

```
cd backend
npm install
copy .env.example .env
```

Abre `.env` y completa `DB_PASSWORD` (la contraseña de tu PostgreSQL) y `JWT_SECRET` (una cadena larga y propia).
Luego crea la base y las tablas, y arranca la API:

```
npm run db:init
npm run db:ejemplo
npm run dev
```

`db:init` crea la base `alertaoax` si no existe y ejecuta `../database/schema.sql`. Se puede repetir sin duplicar datos.
`db:ejemplo` carga albergues y zonas de riesgo **de ejemplo** (`../database/seed-ejemplo.sql`) para probar el mapa; no son datos oficiales.
La API queda en http://localhost:3000. Prueba: http://localhost:3000/api/health

### Crear un administrador

El rol administrador no se puede crear desde la API (por seguridad). Se crea así:

```
npm run crear-admin -- "Nombre Apellido" correo@ejemplo.com ContraseñaSegura
```

El administrador entra desde la misma pantalla de acceso con su correo y contraseña; la app lo lleva a su panel según su rol.

### Correo de recuperación y acceso con Google (opcional)

- `SMTP_USER`, `SMTP_PASS` y `CORREO_REMITENTE`: cuenta de Gmail con verificación en dos pasos y una **contraseña de aplicación**. Sin ellas, el enlace de recuperación se imprime en la consola del servidor.
- `APP_URL`: dirección pública del frontend; se usa para armar el enlace del correo.
- `CONTACTO_WHATSAPP` y `CONTACTO_CORREO`: datos del botón flotante de contacto rápido (si faltan, solo muestra el 911).
- `GOOGLE_CLIENT_ID`: ID de cliente OAuth (Google Cloud Console → Credenciales). Sin él, el botón de Google no aparece.

## Estructura

```
src/
├── config/        Variables de entorno y conexión a PostgreSQL (Pool)
├── routes/        Definición de rutas
├── controllers/   Lógica de cada endpoint
├── models/        Consultas SQL
├── middlewares/   verificarToken, verificarRol y manejo global de errores
├── utils/         ErrorHttp y asyncHandler
├── app.js         Configuración de Express
└── server.js      Arranque del servidor
scripts/           init-db.js, cargar-ejemplo.js y crear-admin.js
```

## Endpoints

Todas las respuestas de error tienen la forma `{ "mensaje": "..." }`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado de la API y de la base de datos |
| GET | `/api/regions` | Público | Las 8 regiones de Oaxaca |
| POST | `/api/auth/register` | Público | Registro de ciudadano o autoridad |
| POST | `/api/auth/login` | Público | Inicio de sesión; devuelve el token JWT |
| GET | `/api/auth/me` | Con token | Datos del usuario de la sesión |
| POST | `/api/auth/google` | Público | Acceso con Google (`credential` de Google Identity Services) |
| POST | `/api/auth/olvide` | Público | Envía enlace de recuperación (respuesta genérica; 5 por 15 min) |
| POST | `/api/auth/restablecer` | Público | `{ token, password, confirmarPassword }`; enlace de un solo uso, 30 min |
| POST | `/api/auth/verificar` | Público | `{ correo, codigo }`; confirma el correo con el código de 6 dígitos (10 min, 5 intentos) |
| POST | `/api/auth/reenviar-codigo` | Público | `{ correo }`; manda un código nuevo (espera de 60 s entre envíos) |
| PATCH | `/api/auth/perfil` | Con token | `{ nombre, telefono?, region? }`; teléfono de 10 dígitos opcional; la región solo la cambia el ciudadano |
| POST | `/api/auth/password` | Con token | `{ actual, password, confirmarPassword }`; cambia la contraseña y cierra todas las sesiones abiertas |
| GET | `/api/config` | Público | Configuración pública del frontend (`googleClientId`, `contacto`) |
| POST | `/api/alerts/publish` | Autoridad aprobada, admin | Publica una alerta y notifica a la región (transacción) |
| GET | `/api/alerts/active` | Con token | Alertas vigentes de la región del usuario (`?todas=1`: todo Oaxaca) |
| GET | `/api/alerts/mine` | Autoridad, admin | Alertas que publicó, con número de notificados |
| GET | `/api/alerts/:id` | Con token | Detalle de una alerta |
| PATCH | `/api/alerts/:id/finalizar` | Autor o admin | Termina la alerta antes de tiempo |
| GET | `/api/notifications` | Con token | Notificaciones del usuario y cuántas no ha leído |
| PATCH | `/api/notifications/:id/leida` | Con token | Marca una notificación como leída |
| PATCH | `/api/notifications/leer-todas` | Con token | Marca todas como leídas |
| GET | `/api/shelters?region=Costa` | Con token | Albergues abiertos (`region=todas` para todo Oaxaca) |
| GET | `/api/risk-zones?region=Costa` | Con token | Zonas de riesgo (círculo: centro y radio) |
| POST | `/api/reports` | Ciudadano | Reporte de incidencia (estado inicial `recibido`) |
| GET | `/api/reports/mine` | Ciudadano | Reportes propios con su estado |
| GET | `/api/reports?estado=recibido` | Autoridad, admin | Reportes de la región de la autoridad |
| PATCH | `/api/reports/:id/estado` | Autoridad de la región, admin | Cambia a `en_atencion` o `atendido`, con nota opcional |
| GET / PUT | `/api/plan` | Ciudadano | Plan familiar y mochila de emergencia |
| GET | `/api/admin/metrics` | Admin | Conteos para el panel estadístico |
| GET | `/api/admin/users?rol=&buscar=&pagina=` | Admin | Lista paginada de cuentas (20 por página) |
| GET | `/api/admin/authorities?estado=pendiente` | Admin | Solicitudes de autoridad |
| PUT | `/api/admin/authorities/:id/validate` | Admin | `{ "decision": "aprobada" \| "rechazada" }` |

### POST /api/auth/register

```json
{ "nombre": "Ana Pérez", "correo": "ana@correo.com", "password": "secreto12",
  "confirmarPassword": "secreto12", "region": "Valles Centrales",
  "perfil": "ciudadano", "aceptaTerminos": true }
```

La contraseña debe tener de 8 a 32 caracteres y `aceptaTerminos` es obligatorio. Se rechazan los correos de dominios de ejemplo
(`ejemplo.com`, `example.com`, `.test`…). Para `perfil: "autoridad"` se agrega `"institucion"`.

La cuenta nace **sin confirmar**: se envía un código de 6 dígitos al correo y la respuesta `201` es
`{ "verificarCorreo": true, "correo": "...", "mensaje": "..." }`. Con `POST /api/auth/verificar` el ciudadano recibe su sesión;
la autoridad queda **pendiente** hasta que el administrador la valide (AO-401). Si se intenta entrar sin confirmar, el login responde
`403 { "verificarCorreo": true }` y manda un código nuevo. Sin SMTP configurado, el código se escribe en la consola del servidor.

### POST /api/auth/login

```json
{ "correo": "ana@correo.com", "password": "secreto12" }
```

Respuesta `200`: `{ "token": "...", "usuario": { "id", "nombre", "correo", "rol", "region" } }`.
Las rutas protegidas esperan el encabezado `Authorization: Bearer <token>`.

### Proteger rutas nuevas

```js
import { verificarToken } from '../middlewares/verificarToken.js'
import { verificarRol } from '../middlewares/verificarRol.js'

router.post('/publish', verificarToken, verificarRol('autoridad', 'administrador'), asyncHandler(publicar))
```

## Seguridad

- Contraseñas con bcrypt (`bcryptjs`, costo 10); nunca se guardan en texto plano.
- Mismo mensaje para correo inexistente y contraseña errónea (no revela qué cuentas existen).
- Recuperación: token aleatorio de 32 bytes; en la base solo se guarda su SHA-256; caduca en 30 minutos y se usa una vez.
- Honeypot anti-spam: registro y «olvidé mi contraseña» rechazan envíos que llenan el campo oculto `sitio_web`.
- Límite de 30 intentos por 15 minutos en registro y login.
- `JWT_SECRET` obligatorio (mínimo 16 caracteres) y `.env` fuera de Git.
