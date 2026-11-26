// Arma un archivo CSV que Excel abre bien en español.

/** Una celda: entre comillas si trae coma, comillas o salto de línea. Evita fórmulas (=, +, -, @) al abrir en Excel. */
export function celdaCsv(valor) {
  if (valor === null || valor === undefined) return ''
  let s = String(valor)
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}` // inyección de fórmulas (CSV injection)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Encabezados + filas → texto CSV con BOM (UTF-8) y saltos de línea de Windows. */
export function generarCsv(encabezados, filas) {
  const lineas = [encabezados, ...filas].map((fila) => fila.map(celdaCsv).join(','))
  return '﻿' + lineas.join('\r\n') + '\r\n'
}
