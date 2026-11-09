# Frontend — React + Vite

Interfaz de AlertaOax. Stack: React 18, Vite, TailwindCSS 3, React Router y React-Leaflet.

## Puesta en marcha

```
npm install
cp .env.example .env
npm run dev
```

La app abre en http://localhost:5173. Con `VITE_MOCK_AUTH=true` el acceso funciona sin backend (cualquier correo y contraseña de 6+ caracteres).
Para usar la API real, pon `VITE_MOCK_AUTH=false` y levanta el backend en el puerto 3000.

## Estructura

```
src/
├── components/
│   ├── auth/      Piezas de la pantalla de Acceso y Registro
│   └── layout/    Aviso institucional y estructura de las páginas internas
├── context/       AuthContext (sesión y rol del usuario)
├── hooks/         Hooks reutilizables
├── pages/         Una página por módulo (acceso, mapa, alertas, preparación...)
├── routes/        Rutas protegidas por sesión y por rol
├── services/      Cliente HTTP hacia la API REST
└── utils/         Constantes y funciones auxiliares
```

## Estado de los módulos

| Módulo | Ruta | Estado |
|---|---|---|
| Acceso y registro | `/acceso` | Listo (login/registro conectados a `/api/auth/*`) |
| Inicio del ciudadano (alertas) | `/alertas` | Maquetado con datos de ejemplo (`src/data/alertas.js`) |
| Detalle de alerta | `/alertas/:id` | Maquetado; contenido ampliado solo para la alerta destacada |
| Mapa de riesgo interactivo | `/mapa` | Capas, semáforo, buscador y ficha de refugio con datos de ejemplo (`src/data/mapa.js`) |
| Prepárate | `/preparacion` | Pendiente (Sprint 3) |
| Reportar | `/reportes` | Pendiente (Sprint 3) |
| Publicar aviso (autoridad) | `/publicar` | Pendiente (Sprint 2) |
| Administración | `/admin` | Pendiente (Sprint 4) |

## Datos de ejemplo

Las pantallas de alertas y mapa leen datos de `src/data/`. Cuando el backend esté listo, se reemplazan por llamadas
con `services/api.js` (por ejemplo `GET /api/alertas` y `GET /api/alertas/:id`) sin cambiar los componentes.

## Mapa base

Los mosaicos vienen de OpenStreetMap, OpenTopoMap y Esri. Para producción conviene revisar sus condiciones de uso
o contratar un proveedor de mapas.
