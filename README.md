# AlertaOax

Plataforma web de alertas y preparación ante desastres para comunidades de Oaxaca. La población consulta zonas de riesgo, albergues y rutas de evacuación; recibe las alertas oficiales de su región; consulta guías para antes, durante y después de sismos, inundaciones y huracanes; y reporta incidencias. Protección civil publica avisos verificados y un administrador valida a las autoridades y consulta estadísticas.

Alineado con los Objetivos de Desarrollo Sostenible **11** (Ciudades y comunidades sostenibles) y **13** (Acción por el clima).

## Equipo 10 — Gestión de Proyectos de Software (SCG-1009), ITO

| Integrante | Rol Scrum | Área principal |
|---|---|---|
| José José Osvaldo ([@JoseJose7520-dev](https://github.com/JoseJose7520-dev)) | Product Owner y Developer | Frontend completo (React, mapa, preparación, dashboard), tablero y documentación |
| Ortiz Bautista Josue Ahuitz ([@Mammal117](https://github.com/Mammal117)) | Scrum Master y Developer | Backend completo (API Express, PostgreSQL, notificaciones), pruebas y despliegue |

Docente: Martínez Nieto Adelina.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite, TailwindCSS, React-Leaflet |
| Backend | Node.js + Express (API REST, JWT, bcrypt) |
| Base de datos | PostgreSQL |
| Gestión | GitHub Projects (Scrum), issues y pull requests |

## Estructura del repositorio

```
AlertaOax/
├── backend/      API REST en Express (rutas → controladores → modelos)
├── frontend/     Aplicación React con Vite
├── database/     Scripts SQL: esquema (DDL) y datos de prueba
├── docs/         Documentación del proyecto y figuras
└── .github/      Plantillas de issues y pull requests
```

## Plan de Sprints

| Sprint | Fechas | Objetivo |
|---|---|---|
| Sprint 0 | 9 – 11 nov 2026 | Repositorio, entorno, tablero y wireframes |
| Sprint 1 | 12 – 18 nov 2026 | Base de datos, servidor y autenticación con roles |
| Sprint 2 | 19 – 24 nov 2026 | Publicación de alertas y notificaciones por región |
| Sprint 3 | 25 – 30 nov 2026 | Mapa, módulo de preparación y reportes ciudadanos |
| Sprint 4 | 1 – 3 dic 2026 | Panel de administración, pruebas y despliegue |
| **Entrega final** | **4 dic 2026** | |

## Cómo trabajamos

Cada cambio entra a `main` mediante un pull request revisado por el otro integrante. La guía paso a paso está en [CONTRIBUTING.md](CONTRIBUTING.md).

**Definición de Terminado:** el código fue revisado mediante un pull request por el otro integrante, las pruebas se ejecutaron sin errores, se cumplieron los criterios de aceptación y el cambio quedó integrado en `main`.
