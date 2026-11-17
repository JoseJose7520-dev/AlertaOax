/** Distancia en km entre dos puntos (fórmula de Haversine). */
export function distanciaKm(a, b) {
  const rad = (g) => (g * Math.PI) / 180
  const dLat = rad(b.latitud - a.latitud)
  const dLon = rad(b.longitud - a.longitud)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export const textoDistancia = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`)

/** Enlace para abrir la ruta en la app de mapas del celular. */
export const enlaceRuta = (lugar) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lugar.latitud},${lugar.longitud}`

/** Pide la ubicación del navegador. Devuelve { latitud, longitud } o lanza un Error con mensaje claro. */
export function obtenerUbicacion() {
  return new Promise((resolver, rechazar) => {
    if (!navigator.geolocation) {
      rechazar(new Error('Tu navegador no permite obtener la ubicación.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolver({ latitud: p.coords.latitude, longitud: p.coords.longitude }),
      (e) => rechazar(new Error(e.code === 1
        ? 'No diste permiso para usar tu ubicación. Puedes activarlo en la configuración del navegador.'
        : 'No pudimos obtener tu ubicación. Inténtalo de nuevo.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  })
}

/** Centro aproximado de cada región (para centrar el mapa cuando no hay ubicación). */
export const CENTRO_REGION = {
  'Cañada': [18.13, -96.97],
  Costa: [15.86, -96.9],
  Istmo: [16.43, -95.02],
  Mixteca: [17.55, -97.67],
  Papaloapan: [18.08, -96.12],
  'Sierra Norte': [17.32, -96.48],
  'Sierra Sur': [16.33, -96.6],
  'Valles Centrales': [17.06, -96.72],
}
export const CENTRO_OAXACA = [17.0, -96.5]
