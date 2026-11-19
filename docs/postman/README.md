# Pruebas de la API con Postman

1. En Postman: **Import** → arrastra `AlertaOax.postman_collection.json` y `AlertaOax_local.postman_environment.json`.
2. Arriba a la derecha elige el entorno **AlertaOax local**.
3. En `backend/.env` pon `CODIGO_PRUEBA=1` (así el registro devuelve el código de 6 dígitos y Postman puede confirmar el correo; en producción se ignora). Arranca la API (`cd backend` → `npm run dev`) y crea el administrador si no existe:
   `npm run crear-admin -- "Administrador AlertaOax" admin@alertaoax.mx Admin12345`
4. Clic derecho en la colección → **Run collection** → **Run AlertaOax**.

Resultado esperado: 54 peticiones y 136 pruebas en verde. La colección cubre registro (términos, honeypot anti-spam, contraseñas que no coinciden, 8 a 32 caracteres, correo de ejemplo, verificación con código de 6 dígitos, correo duplicado), Mi perfil, acceso por rol, recuperación de contraseña, validación de autoridades, lista de usuarios, alertas, notificaciones, mapa, reportes y plan familiar.

Para probar el servidor publicado, cambia `baseUrl` del entorno por `https://alertaoax.com/api`.
