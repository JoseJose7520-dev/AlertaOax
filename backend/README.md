# Backend — Express

API REST de AlertaOax. Estructura por capas: **rutas → controladores → modelos**.

## Puesta en marcha

Requisito: Node.js 18 o superior.

```
cd backend
npm install
copy .env.example .env
npm run dev
```

La API queda en http://localhost:3000. Prueba: http://localhost:3000/api/health

## Estructura

```
src/
├── config/        Variables de entorno
├── routes/        Definición de rutas
├── controllers/   Lógica de cada endpoint
├── models/        Consultas a la base de datos
├── middlewares/   Autenticación, roles y errores
├── utils/         Utilidades
├── app.js         Configuración de Express
└── server.js      Arranque del servidor
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado de la API |
