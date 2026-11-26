import { test } from 'node:test'
import assert from 'node:assert/strict'
import { celdaCsv, generarCsv } from '../src/utils/csv.js'

test('celdaCsv deja igual el texto simple y los números', () => {
  assert.equal(celdaCsv('Inundación'), 'Inundación')
  assert.equal(celdaCsv(-96.7458), '-96.7458')
  assert.equal(celdaCsv(null), '')
})

test('celdaCsv pone comillas si hay coma, comillas o salto de línea', () => {
  assert.equal(celdaCsv('Calle 5, centro'), '"Calle 5, centro"')
  assert.equal(celdaCsv('Dijo "ayuda"'), '"Dijo ""ayuda"""')
  assert.equal(celdaCsv('línea 1\nlínea 2'), '"línea 1\nlínea 2"')
})

test('celdaCsv evita que Excel ejecute fórmulas', () => {
  assert.equal(celdaCsv('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"')
  assert.equal(celdaCsv('@SUMA(A1)'), "'@SUMA(A1)")
})

test('generarCsv agrega BOM y usa saltos de Windows', () => {
  const csv = generarCsv(['a', 'b'], [[1, 'x']])
  assert.equal(csv, '﻿a,b\r\n1,x\r\n')
})
