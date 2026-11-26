#!/usr/bin/env bash
# Despliega AlertaOax en el servidor con un solo comando:  bash ~/AlertaOax/deploy/desplegar.sh
# Pasos: descarga main → dependencias y migraciones del backend → reinicia la API (PM2)
#        → compila el frontend → lo publica en la carpeta de Nginx → revisa /api/health.
# Si un paso falla, el script se detiene y no sigue con los demás.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESTINO="${DESTINO:-/var/www/alertaoax}"           # carpeta que sirve Nginx
APP="${PM2_APP:-alertaoax-api}"                    # nombre del proceso en PM2
SALUD="${URL_SALUD:-https://alertaoax.duckdns.org/api/health}"

paso() { echo; echo "==> $*"; }
falla() { echo "ERROR: $*" >&2; exit 1; }

cd "$REPO"
[ -f backend/.env ] || falla "No existe backend/.env. Créalo antes de desplegar (ver backend/.env.example)."
command -v pm2 >/dev/null || falla "PM2 no está instalado (npm install -g pm2)."

if [ "${SIN_PULL:-0}" != "1" ]; then
  paso "1/6 Descargando la última versión de main"
  git diff --quiet || falla "Hay cambios sin guardar en el servidor (git status). Resuélvelos antes de desplegar."
  git checkout -q main
  git pull --ff-only origin main
fi
echo "Versión: $(git log --oneline -1)"

paso "2/6 Backend: dependencias y migraciones de la base de datos"
cd "$REPO/backend"
npm ci --omit=dev --no-audit --no-fund
npm run db:init
npm run db:albergues --if-present -- --solo-reales

paso "3/6 Reiniciando la API con PM2 ($APP)"
pm2 restart "$APP" --update-env
pm2 save >/dev/null

paso "4/6 Frontend: compilación de producción"
cd "$REPO/frontend"
npm ci --no-audit --no-fund
npm run build

paso "5/6 Publicando en $DESTINO"
SUDO=""; [ -w "$DESTINO" ] || SUDO="sudo"
$SUDO mkdir -p "$DESTINO"
# --delete quita archivos viejos; se conservan los de verificación de Google Search Console
if command -v rsync >/dev/null; then
  $SUDO rsync -a --delete --exclude 'google*.html' dist/ "$DESTINO/"
else
  $SUDO find "$DESTINO" -mindepth 1 -maxdepth 1 ! -name 'google*.html' -exec rm -rf {} +
  $SUDO cp -r dist/. "$DESTINO/"
fi

paso "6/6 Revisando que la API responda"
for i in $(seq 1 15); do
  if respuesta="$(curl -sf "$SALUD")"; then
    echo "$respuesta"
    echo; echo "Despliegue terminado: $(cd "$REPO" && git log --oneline -1)"
    exit 0
  fi
  sleep 2
done
pm2 logs "$APP" --lines 30 --nostream || true
falla "La API no respondió en $SALUD. Revisa los registros de arriba."
