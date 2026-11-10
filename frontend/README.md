# Frontend — AlertaOax (React + Vite)

## Requisitos
- Node.js 20 o superior

## Cómo correrlo
```
cd frontend && npm install && npm run dev
```
Abre http://localhost:5173

## Estructura
```
src/
├── components/   Componentes reutilizables (Navbar, tarjetas, etc.)
├── pages/        Una página por ruta: Inicio, Login, Registro, Mapa
├── App.jsx       Definición de rutas (react-router-dom)
└── main.jsx      Punto de entrada
```

Las peticiones a `/api` se redirigen al backend en `http://localhost:3000` (ver `vite.config.js`).
