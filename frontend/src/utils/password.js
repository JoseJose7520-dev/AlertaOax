// Reglas de contraseña nuevas. Deben coincidir con PASSWORD_MIN / PASSWORD_MAX del backend (auth.controller.js).
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 32

/** Mensaje de error para una contraseña nueva, o '' si cumple. */
export function errorPassword(password) {
  if (password.length < PASSWORD_MIN) return `Usa al menos ${PASSWORD_MIN} caracteres.`
  if (password.length > PASSWORD_MAX) return `Usa máximo ${PASSWORD_MAX} caracteres.`
  return ''
}
