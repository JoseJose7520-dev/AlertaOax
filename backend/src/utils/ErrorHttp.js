/** Error con código HTTP. Se lanza desde controladores y lo responde el manejador global. */
export default class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje)
    this.estado = estado
  }
}
