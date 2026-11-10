import pg from 'pg'
import { dbConfig } from './dbConfig.js'

// Un solo Pool para toda la API (reutiliza conexiones).
export const pool = new pg.Pool({
  ...dbConfig,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

// Evita que la API se caiga si una conexión inactiva falla.
pool.on('error', (err) => {
  console.error('[db] error en una conexión inactiva:', err.message)
})

export const consulta = (texto, parametros) => pool.query(texto, parametros)

export async function probarConexion() {
  const { rows } = await pool.query('SELECT NOW() AS ahora')
  return rows[0].ahora
}
