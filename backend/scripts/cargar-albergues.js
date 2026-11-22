// Carga o actualiza los albergues OFICIALES de database/albergues-oficiales.csv.
// Uso: npm run db:albergues                      (agrega o actualiza; se puede repetir)
//      npm run db:albergues -- --quitar-ejemplo  (además borra los albergues y zonas de ejemplo)
// Las filas sin latitud/longitud se saltan y se listan al final para completarlas.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { dbConfig } from '../src/config/dbConfig.js'

const carpeta = path.dirname(fileURLToPath(import.meta.url))
const archivo = path.resolve(carpeta, '../../database/albergues-oficiales.csv')
const quitarEjemplo = process.argv.includes('--quitar-ejemplo')

/** Lee un CSV sencillo (separado por comas, con comillas dobles opcionales). */
function leerCsv(texto) {
  const filas = []
  for (const linea of texto.replace(/^﻿/, '').split(/\r?\n/)) {
    if (!linea.trim() || linea.trim().startsWith('#')) continue
    const celdas = []
    let actual = ''
    let entreComillas = false
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i]
      if (c === '"' && linea[i + 1] === '"' && entreComillas) { actual += '"'; i++ }
      else if (c === '"') entreComillas = !entreComillas
      else if (c === ',' && !entreComillas) { celdas.push(actual.trim()); actual = '' }
      else actual += c
    }
    celdas.push(actual.trim())
    filas.push(celdas)
  }
  const [encabezado, ...datos] = filas
  return datos.map((f) => Object.fromEntries(encabezado.map((h, i) => [h, f[i] ?? ''])))
}

const cliente = new pg.Client(dbConfig)
try {
  const filas = leerCsv(fs.readFileSync(archivo, 'utf8'))
  await cliente.connect()
  const { rows: regiones } = await cliente.query('SELECT id, nombre FROM regiones')
  const idRegion = Object.fromEntries(regiones.map((r) => [r.nombre, r.id]))

  let cargados = 0
  const pendientes = []
  for (const f of filas) {
    const lat = Number(f.latitud)
    const lon = Number(f.longitud)
    const etiqueta = `${f.nombre} (${f.localidad}, ${f.municipio})`
    if (!idRegion[f.region]) { pendientes.push(`${etiqueta}: región «${f.region}» no existe`); continue }
    if (!f.latitud || !f.longitud || !Number.isFinite(lat) || !Number.isFinite(lon)) { pendientes.push(`${etiqueta}: faltan coordenadas`); continue }
    if (lat < 15 || lat > 18.8 || lon < -98.6 || lon > -93.8) { pendientes.push(`${etiqueta}: las coordenadas no están en Oaxaca`); continue }
    const capacidad = f.capacidad ? Number(f.capacidad) : null
    await cliente.query(
      `INSERT INTO albergues (region_id, nombre, direccion, latitud, longitud, capacidad, ocupacion, telefono, fuente, es_ejemplo)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, FALSE)
       ON CONFLICT (region_id, nombre) DO UPDATE SET
         direccion = EXCLUDED.direccion, latitud = EXCLUDED.latitud, longitud = EXCLUDED.longitud,
         capacidad = EXCLUDED.capacidad, telefono = EXCLUDED.telefono, fuente = EXCLUDED.fuente, es_ejemplo = FALSE,
         ocupacion = LEAST(albergues.ocupacion, COALESCE(EXCLUDED.capacidad, albergues.ocupacion))`,
      [idRegion[f.region], f.nombre, `${f.localidad}, ${f.municipio}`, lat, lon, capacidad, f.telefono || null, f.fuente || null],
    )
    cargados++
  }

  if (quitarEjemplo) {
    const a = await cliente.query('DELETE FROM albergues WHERE es_ejemplo = TRUE')
    const z = await cliente.query('DELETE FROM zonas_riesgo WHERE es_ejemplo = TRUE')
    console.log(`Datos de ejemplo borrados: ${a.rowCount} albergues y ${z.rowCount} zonas.`)
  }
  console.log(`Albergues oficiales cargados o actualizados: ${cargados} de ${filas.length}.`)
  if (pendientes.length) {
    console.log(`\nSin cargar (${pendientes.length}). Completa estos datos en database/albergues-oficiales.csv:`)
    for (const p of pendientes) console.log(`  - ${p}`)
  }
} catch (err) {
  console.error(`No se pudieron cargar los albergues: ${err.message}`)
  console.error('¿Ya ejecutaste npm run db:init?')
  process.exitCode = 1
} finally {
  await cliente.end()
}
