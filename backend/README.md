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
npm run dev
```

`db:init` crea la base `alertaoax` si no existe y ejecuta `../database/schema.sql`. Se puede repetir sin duplicar datos.
La API queda en http://localhost:3000. Prueba: http://localhost:3000/api/health

### Crear un administrador

El rol administrador no se puede crear desde la API (por seguridad). Se crea así:

```
npm run crear-admin -- "Nombre Apellido" correo@ejemplo.com ContraseñaSegura
```

Para entrar, el administrador usa el perfil **“Soy autoridad”** en la pantalla de acceso.

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
scripts/           init-db.js y crear-admin.js
```

## Endpoints

Todas las respuestas de error tienen la forma `{ "mensaje": "..." }`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado de la API y de la base de datos |
| POST | `/api/auth/register` | Público | Registro de ciudadano o autoridad |
| POST | `/api/auth/login` | Público | Inicio de sesión; devuelve el token JWT |
| GET | `/api/auth/me` | Con token | Datos del usuario de la sesión |

### POST /api/auth/register

```json
{ "nombre": "Ana Pérez", "correo": "ana@correo.com", "password": "secreto1",
  "region": "Valles Centrales", "perfil": "ciudadano" }
```

Para `perfil: "autoridad"` se agrega `"institucion"`. La cuenta de autoridad queda **pendiente**
hasta que el administrador la valide (AO-401); respuesta `201`: `{ "pendiente": true, "mensaje": "..." }`.

### POST /api/auth/login

```json
{ "correo": "ana@correo.com", "password": "secreto1", "perfil": "ciudadano" }
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
- Límite de 30 intentos por 15 minutos en registro y login.
- `JWT_SECRET` obligatorio (mínimo 16 caracteres) y `.env` fuera de Git.
