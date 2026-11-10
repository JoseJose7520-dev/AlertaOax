import { consulta } from '../config/db.js'

export async function buscarRegionPorNombre(nombre) {
  const { rows } = await consulta('SELECT id, nombre FROM regiones WHERE nombre = $1', [nombre])
  return rows[0] ?? null
}
