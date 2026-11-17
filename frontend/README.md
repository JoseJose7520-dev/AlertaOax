# Frontend — AlertaOax (React + Vite + Tailwind)

Aplicación web de AlertaOax. Mobile-first para el ciudadano y paneles web para la autoridad y el administrador.

## Requisitos
- Node.js 20 o superior
- La API del backend corriendo en http://localhost:3000 (ver `../backend/README.md`)

## Cómo correrlo
```
cd frontend
npm install
npm run dev
```
Abre http://localhost:5173. Las peticiones a `/api` se redirigen al backend (ver `vite.config.js`).

Para producción: `npm run build` genera la carpeta `dist/`. Si la API vive en otro dominio, define `VITE_API_URL` (por ejemplo `VITE_API_URL=https://api.midominio.com`).

## Pantallas

| Ruta | Rol | Historia |
|---|---|---|
| `/acceso` | Público | HU-01 Registro e inicio de sesión |
| `/` | Ciudadano | HU-03 Alertas de mi región y avisos recibidos |
| `/alertas/:id` | Ciudadano | HU-03 Detalle y "Qué hacer ahora" |
| `/mapa` | Ciudadano | HU-04 Zonas de riesgo y albergues (Leaflet + OpenStreetMap) |
| `/preparate` | Ciudadano | HU-05 Guías, mochila y plan familiar |
| `/reportar`, `/reportes` | Ciudadano | HU-06 Reporte en 3 pasos y seguimiento |
| `/autoridad` | Autoridad | HU-02 Publicar alerta con vista previa |
| `/autoridad/alertas` | Autoridad | Mis alertas (terminar antes de tiempo) |
| `/autoridad/reportes` | Autoridad | Atender reportes ciudadanos |
| `/admin`, `/admin/autoridades` | Administrador | HU-07 Métricas y validación de autoridades |

## Estructura
```
src/
├── components/   Piezas reutilizables (Icono, InsigniaNivel, TarjetaAlerta, BarraInferior, layouts…)
├── context/      AuthContext: sesión, login, registro
├── hooks/        useApi: carga de datos con estado de carga y error
├── pages/        Una página por ruta (ciudadano, autoridad/, admin/)
├── routes/       RutaProtegida: acceso por rol
├── services/     api.js: cliente HTTP con el token JWT
└── utils/        Catálogos (niveles, tipos), geolocalización, guías
```

## Diseño
- Colores en `src/index.css` (`@theme`): añil `#3B3486` para marca y botones; barro negro `#1F1B16` para texto; hueso `#FAF7F2` de fondo.
- **El semáforo (rojo, naranja, amarillo, verde) se usa solo para niveles de riesgo** y siempre va acompañado de texto.
- Tipografía Atkinson Hyperlegible; texto mínimo de 16 px y botones de al menos 44 px de alto.
