# Pruebas de la API con Postman

1. En Postman: **Import** → arrastra `AlertaOax.postman_collection.json` y `AlertaOax_local.postman_environment.json`.
2. Arriba a la derecha elige el entorno **AlertaOax local**.
3. Arranca la API (`cd backend` → `npm run dev`) y crea el administrador si no existe:
   `npm run crear-admin -- "Administrador AlertaOax" admin@alertaoax.mx Admin12345`
4. Clic derecho en la colección → **Run collection** → **Run AlertaOax**.

Resultado esperado: 46 peticiones y 115 pruebas en verde. La colección cubre registro (términos, honeypot anti-spam, contraseñas que no coinciden, mínimo 8 caracteres, correo duplicado), acceso por rol, recuperación de contraseña, validación de autoridades, lista de usuarios, alertas, notificaciones, mapa, reportes y plan familiar.

Para probar el servidor publicado, cambia `baseUrl` del entorno por `https://srv2100152.hstgr.cloud/api`.
