// Pruebas unitarias de los middlewares (no necesitan base de datos). Uso: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'

process.env.JWT_SECRET ||= 'clave-solo-para-pruebas-unitarias'
process.env.DB_PASSWORD ||= 'sin-uso-en-estas-pruebas'

const { default: ErrorHttp } = await import('../src/utils/ErrorHttp.js')
const { verificarRol } = await import('../src/middlewares/verificarRol.js')
const { bloquearBots } = await import('../src/middlewares/antiSpam.js')
const { verificarToken } = await import('../src/middlewares/verificarToken.js')
const { pool } = await import('../src/config/db.js')

// Simula next() y devuelve lo que recibió
function correr(middleware, req, res = {}) {
  return new Promise((resolve) => middleware(req, res, (err) => resolve(err)))
}

// Simula res.status().json() para los middlewares que responden directo
function respuestaFalsa() {
  const res = { codigo: null, cuerpo: null }
  res.status = (c) => { res.codigo = c; return res }
  res.json = (b) => { res.cuerpo = b; return res }
  return res
}

test('ErrorHttp guarda el estado HTTP, el mensaje y los datos extra', () => {
  const e = new ErrorHttp(409, 'Ya existe', { campo: 'correo' })
  assert.ok(e instanceof Error)
  assert.equal(e.estado, 409)
  assert.equal(e.message, 'Ya existe')
  assert.deepEqual(e.datos, { campo: 'correo' })
})

test('verificarRol deja pasar a un rol permitido', async () => {
  const err = await correr(verificarRol('autoridad', 'administrador'), { usuario: { id: 1, rol: 'autoridad' } })
  assert.equal(err, undefined)
})

test('verificarRol rechaza con 403 a un rol no permitido', async () => {
  const err = await correr(verificarRol('administrador'), { usuario: { id: 2, rol: 'ciudadano' } })
  assert.ok(err instanceof ErrorHttp)
  assert.equal(err.estado, 403)
})

test('verificarRol rechaza con 403 si no hay usuario en la petición', async () => {
  const err = await correr(verificarRol('ciudadano'), {})
  assert.equal(err.estado, 403)
})

test('bloquearBots deja pasar un formulario normal y quita el campo trampa', async () => {
  const req = { body: { correo: 'ana@gmail.com', sitio_web: '' } }
  const err = await correr(bloquearBots, req)
  assert.equal(err, undefined)
  assert.equal('sitio_web' in req.body, false)
})

test('bloquearBots rechaza con 400 si el campo trampa trae texto (bot)', () => {
  const res = respuestaFalsa()
  let siguio = false
  bloquearBots({ body: { correo: 'bot@spam.com', sitio_web: 'http://spam' } }, res, () => { siguio = true })
  assert.equal(siguio, false)
  assert.equal(res.codigo, 400)
})

test('verificarToken rechaza con 401 si falta el encabezado Authorization', async () => {
  const err = await correr(verificarToken, { headers: {} })
  assert.equal(err.estado, 401)
})

test('verificarToken rechaza con 401 un token que no es Bearer', async () => {
  const err = await correr(verificarToken, { headers: { authorization: 'Basic abc' } })
  assert.equal(err.estado, 401)
})

test('verificarToken rechaza con 401 un token con firma inválida', async () => {
  const err = await correr(verificarToken, { headers: { authorization: 'Bearer esto.no.esunjwt' } })
  assert.equal(err.estado, 401)
  assert.equal(err.message, 'Token inválido.')
})

test.after(() => pool.end())
