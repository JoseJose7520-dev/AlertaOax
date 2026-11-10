// Crea la base de datos (si no existe) y ejecuta database/schema.sql.
// Uso: npm run db:init
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { dbConfig } from '../src/config/dbConfig.js'

const carpeta = path.dirname(fileURLToPath(import.meta.url))
const rutaSql = path.resolve(carpeta, '../../database/schema.sql')

async function conectar(baseDeDatos) {
  const cliente = new pg.Client({ ...dbConfig, database: baseDeDatos })
  await cliente.connect()
  return cliente
}

async function crearBaseSiFalta() {
  if (!/^[a-zA-Z0-9_]+$/.test(dbConfig.database)) {
    throw new Error('DB_NAME solo puede tener letras, números y guion bajo.')
  }
  const admin = await conectar('postgres')
  try {
    await admin.query(`CREATE DATABASE "${dbConfig.database}"`)
    console.log(`Base de datos "${dbConfig.database}" creada.`)
  } finally {
    await admin.end()
  }
}

async function main() {
  const sql = fs.readFileSync(rutaSql, 'utf8')
  let cliente
  try {
    cliente = await conectar(dbConfig.database)
  } catch (err) {
    if (err.code !== '3D000') throw err // 3D000 = la base no existe
    await crearBaseSiFalta()
    cliente = await conectar(dbConfig.database)
  }
  try {
    await cliente.query(sql)
    const { rows } = await cliente.query('SELECT COUNT(*)::int AS total FROM regiones')
    console.log(`Esquema aplicado. Regiones cargadas: ${rows[0].total}.`)
  } finally {
    await cliente.end()
  }
}

main().catch((err) => {
  console.error(`No se pudo preparar la base de datos: ${err.message}`)
  console.error('Revisa que PostgreSQL esté encendido y que las variables DB_* del .env sean correctas.')
  process.exit(1)
})
