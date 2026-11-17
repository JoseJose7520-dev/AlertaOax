/**
 * Honeypot: el formulario trae un campo oculto «sitio_web» que una persona nunca ve.
 * Si llega con texto, lo llenó un bot: se rechaza sin dar más pistas.
 * El campo se quita del cuerpo para que no llegue a los controladores.
 */
export function bloquearBots(req, res, next) {
  const trampa = req.body?.sitio_web
  if (req.body) delete req.body.sitio_web
  if (typeof trampa === 'string' && trampa.trim() !== '') {
    return res.status(400).json({ mensaje: 'No pudimos procesar la solicitud.' })
  }
  next()
}
