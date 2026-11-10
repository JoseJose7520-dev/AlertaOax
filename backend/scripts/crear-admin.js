// Crea una cuenta de administrador. No se puede crear desde la API por seguridad.
// Uso: npm run crear-admin -- "Nombre Apellido" correo@ejemplo.com ContraseñaSegura
import bcrypt from 'bcryptjs'
import pg from 'pg'
import { dbConfig } from '../src/config/dbConfig.js'

const [nombre, correoCrudo, password] = process.argv.slice(2)

if (!nombre || !correoCrudo || !password) {
  console.error('Uso: npm run crear-admin -- "Nombre Apellido" correo@ejemplo.com Contraseña')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Para un administrador usa una contraseña de al menos 8 caracteres.')
  process.exit(1)
}

const correo = correoCrudo.trim().toLowerCase()
const cliente = new pg.Client(dbConfig)

try {
  await cliente.connect()
  const hash = await bcrypt.hash(password, 10)
  await cliente.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES ($1, $2, $3, 'administrador')`,
    [nombre.trim(), correo, hash],
  )
  console.log(`Administrador creado: ${correo}`)
} catch (err) {
  console.error(err.code === '23505' ? 'Ya existe una cuenta con ese correo.' : `No se pudo crear: ${err.message}`)
  process.exitCode = 1
} finally {
  await cliente.end()
}
