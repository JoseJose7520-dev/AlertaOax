/**
 * Error con código HTTP. Se lanza desde controladores y lo responde el manejador global.
 * `datos` (opcional) se agrega a la respuesta, por ejemplo { verificarCorreo: true }.
 */
export default class ErrorHttp extends Error {
  constructor(estado, mensaje, datos = undefined) {
    super(mensaje)
    this.estado = estado
    this.datos = datos
  }
}
