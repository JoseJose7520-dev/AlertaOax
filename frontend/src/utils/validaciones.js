// Mismas reglas que el servidor (backend/src/utils/validaciones.js): el navegador avisa antes de enviar.
// Si cambias una regla aquí, cámbiala también en el backend.

export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 32
export const INSTITUCION_MIN = 10
export const INSTITUCION_MAX = 160

const sinAcentos = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Contraseñas tan comunes que se adivinan en segundos aunque tengan letras y números
const PASSWORDS_COMUNES = new Set([
  'password1', 'password123', 'contrasena1', 'contrasena123', 'qwerty123', 'qwerty12', 'abc12345', 'abcd1234',
  '1234abcd', '12345abc', 'a1234567', '1234567a', 'alertaoax1', 'oaxaca123', 'mexico123', 'admin123', 'usuario1',
])

/** Mensaje de error de una contraseña nueva, o '' si cumple. */
export function errorPassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`
  }
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) {
    return 'La contraseña debe combinar letras y números (por ejemplo, no se acepta 12345678 ni abcdefgh).'
  }
  if (/^(.)\1+$/.test(password.replace(/\d/g, '')) && /^(.)\1+$/.test(password.replace(/\D/g, ''))) {
    return 'La contraseña es demasiado fácil de adivinar. Usa una combinación menos repetitiva.'
  }
  if (PASSWORDS_COMUNES.has(sinAcentos(password))) {
    return 'Esa contraseña es muy común. Elige otra.'
  }
  return ''
}

// Letras (con acentos y ñ), espacios, apóstrofo, punto y guion. Nada de números ni emojis.
const REGEX_NOMBRE = /^[\p{L}][\p{L}'’. -]*$/u

/** Nombre de una persona: al menos nombre y apellido, solo letras, sin letras repetidas de relleno. */
export function errorNombre(nombre) {
  const t = typeof nombre === 'string' ? nombre.trim().replace(/\s+/g, ' ') : ''
  if (t.length < 5 || t.length > 120) return 'Escribe tu nombre y apellido (5 a 120 caracteres).'
  if (!REGEX_NOMBRE.test(t)) return 'El nombre solo puede llevar letras y espacios (sin números ni símbolos).'
  const palabras = t.split(' ').filter((p) => p.replace(/[^\p{L}]/gu, '').length >= 2)
  if (palabras.length < 2) return 'Escribe tu nombre y al menos un apellido.'
  if (/(\p{L})\1\1/iu.test(t)) return 'Revisa tu nombre: tiene letras repetidas de más.'
  return ''
}

// Textos de relleno que no dicen nada de la institución ni del cargo
const RELLENO = /^(null|undefined|none|ningun[ao]?|n\/?a|na|no aplica|test|testing|prueba|pruebas|asdf+|qwerty|xxx+|aaa+|hola|nada|sin institucion|---+|\.+)$/

/** Institución y cargo de una solicitud de autoridad. */
export function errorInstitucion(institucion) {
  const t = typeof institucion === 'string' ? institucion.trim().replace(/\s+/g, ' ') : ''
  if (t.length < INSTITUCION_MIN || t.length > INSTITUCION_MAX) {
    return `Escribe tu institución y tu cargo (${INSTITUCION_MIN} a ${INSTITUCION_MAX} caracteres), por ejemplo «Protección Civil de Tuxtepec, coordinador».`
  }
  const normal = sinAcentos(t)
  const letras = normal.replace(/[^a-zñ]/g, '')
  if (RELLENO.test(normal) || letras.length < 8 || normal.split(' ').filter((p) => /[a-zñ]{2,}/.test(p)).length < 2) {
    return 'Escribe el nombre real de tu institución y tu cargo, por ejemplo «Protección Civil de Tuxtepec, coordinador».'
  }
  if (/(.)\1\1\1/.test(letras)) return 'Revisa la institución y el cargo: tienen letras repetidas de más.'
  return ''
}

/** Descripción de un reporte: obligatoria, sin mínimo de caracteres (en una emergencia no hay tiempo de escribir). */
export function errorDescripcionReporte(descripcion) {
  const t = typeof descripcion === 'string' ? descripcion.trim() : ''
  if (!t) return 'Escribe qué está pasando, aunque sea en pocas palabras.'
  if (t.length > 1000) return 'La descripción es muy larga (máximo 1000 caracteres).'
  return ''
}
