import { test } from 'node:test'
import assert from 'node:assert/strict'
import { errorDescripcionReporte, errorInstitucion, errorNombre, errorPassword } from '../src/utils/validaciones.js'

test('contraseña: rechaza solo números o solo letras (revisión Equipo 1, punto 2)', () => {
  assert.notEqual(errorPassword('12345678'), '')
  assert.notEqual(errorPassword('abcdefgh'), '')
  assert.notEqual(errorPassword('aaaa1111'), '')
  assert.notEqual(errorPassword('abc12345'), '')
  assert.notEqual(errorPassword('corta1'), '')
  assert.notEqual(errorPassword('a1'.repeat(17)), '')
  assert.equal(errorPassword('secreta123'), '')
  assert.equal(errorPassword('Lluvia2026'), '')
})

test('nombre: pide nombre y apellido con letras (comentario 2)', () => {
  assert.notEqual(errorNombre('Bot'), '')
  assert.notEqual(errorNombre('xX_Gamer_Xx'), '')
  assert.notEqual(errorNombre('Juan 123'), '')
  assert.notEqual(errorNombre('Juaaaan Pérez'), '')
  assert.equal(errorNombre('María Prueba'), '')
  assert.equal(errorNombre('José Ángel Núñez'), '')
  assert.equal(errorNombre("Ana O'Neil"), '')
})

test('institución y cargo: no acepta null ni textos de relleno (punto 6)', () => {
  for (const t of ['null', 'NULL', 'n/a', 'prueba', 'asdfasdfasdf', '1234567890', 'aaaaaaaaaaaa', 'Protección']) {
    assert.notEqual(errorInstitucion(t), '', t)
  }
  assert.equal(errorInstitucion('Protección Civil Oaxaca - Coordinadora'), '')
  assert.equal(errorInstitucion('Protección Civil de Tuxtepec, coordinador'), '')
})

test('descripción del reporte: obligatoria pero sin mínimo de caracteres (punto 4)', () => {
  assert.notEqual(errorDescripcionReporte(''), '')
  assert.notEqual(errorDescripcionReporte('   '), '')
  assert.equal(errorDescripcionReporte('Herido'), '')
  assert.notEqual(errorDescripcionReporte('a'.repeat(1001)), '')
})
