// Carga los datos de EJEMPLO (albergues y zonas de riesgo) de database/seed-ejemplo.sql.
// Uso: npm run db:ejemplo   (después de npm run db:init). Se puede repetir sin duplicar.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { dbConfig } from '../src/config/dbConfig.js'

const carpeta = path.dirname(fileURLToPath(import.meta.url))
const sql = fs.readFileSync(path.resolve(carpeta, '../../database/seed-ejemplo.sql'), 'utf8')
const cliente = new pg.Client(dbConfig)

try {
  await cliente.connect()
  await cliente.query(sql)
  const { rows } = await cliente.query(
    'SELECT (SELECT COUNT(*) FROM albergues)::int AS albergues, (SELECT COUNT(*) FROM zonas_riesgo)::int AS zonas',
  )
  console.log(`Datos de ejemplo cargados: ${rows[0].albergues} albergues y ${rows[0].zonas} zonas de riesgo.`)
} catch (err) {
  console.error(`No se pudieron cargar los datos de ejemplo: ${err.message}`)
  console.error('¿Ya ejecutaste npm run db:init?')
  process.exitCode = 1
} finally {
  await cliente.end()
}
