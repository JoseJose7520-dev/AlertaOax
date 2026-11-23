# Despliegue de AlertaOax

El sistema corre en una instancia EC2 de AWS (Ubuntu) con Nginx, PM2 y PostgreSQL. Para publicar una nueva versión después de fusionar un pull request, entra por SSH y ejecuta:

```
bash ~/AlertaOax/deploy/desplegar.sh
```

El script hace, en orden, y se detiene en el primer error:

1. Descarga la última versión de `main` (se niega si hay cambios sin guardar en el servidor).
2. Instala las dependencias del backend y aplica las migraciones (`npm run db:init`, que se puede repetir) y actualiza los albergues oficiales (`npm run db:albergues`).
3. Reinicia la API con PM2 (`alertaoax-api`).
4. Compila el frontend (`npm run build`).
5. Publica la compilación en `/var/www/alertaoax` (conserva los archivos de verificación de Google Search Console).
6. Comprueba que `https://alertaoax.duckdns.org/api/health` responda; si no, muestra los últimos registros de PM2.

Variables opcionales: `DESTINO` (carpeta de Nginx), `PM2_APP` (nombre del proceso), `URL_SALUD` (dirección de la revisión) y `SIN_PULL=1` (despliega lo que ya está en la carpeta, sin descargar).

Requisitos en el servidor: `backend/.env` configurado, PM2 instalado y el proceso `alertaoax-api` creado la primera vez con `pm2 start src/server.js --name alertaoax-api` dentro de `backend`.
