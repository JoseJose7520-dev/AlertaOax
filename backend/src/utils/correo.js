import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporte = null
function obtenerTransporte() {
  if (!env.correo.usuario) return null
  transporte ??= nodemailer.createTransport({
    host: env.correo.host,
    port: env.correo.puerto,
    secure: env.correo.puerto === 465,
    auth: { user: env.correo.usuario, pass: env.correo.clave },
  })
  return transporte
}

const escapar = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/**
 * Envía el correo con el enlace para crear una nueva contraseña.
 * Sin SMTP configurado, escribe el enlace en la consola (modo desarrollo) y devuelve false.
 */
export async function enviarRecuperacion({ para, nombre, enlace }) {
  const t = obtenerTransporte()
  if (!t) {
    console.log(`[correo] SMTP sin configurar. Enlace de recuperación para ${para}: ${enlace}`)
    return false
  }
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#EEF2F6;font-family:Arial,Helvetica,sans-serif;color:#0F172A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
    <tr><td style="background:#0B1120;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold">AlertaOax</td></tr>
    <tr><td style="padding:28px">
      <p style="font-size:18px;font-weight:bold;margin:0 0 12px">Hola, ${escapar(nombre)}</p>
      <p style="font-size:15px;line-height:1.5;margin:0 0 20px">Recibimos una solicitud para crear una nueva contraseña de tu cuenta. El enlace vence en 30 minutos y solo funciona una vez.</p>
      <p style="margin:0 0 24px"><a href="${escapar(enlace)}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">Crear nueva contraseña</a></p>
      <p style="font-size:13px;line-height:1.5;color:#475569;margin:0">Si no fuiste tú, ignora este mensaje: tu contraseña actual sigue funcionando.</p>
    </td></tr>
  </table></td></tr></table></body></html>`
  await t.sendMail({
    from: env.correo.remitente,
    to: para,
    subject: 'AlertaOax: crea tu nueva contraseña',
    text: `Hola, ${nombre}.\n\nPara crear una nueva contraseña abre este enlace (vence en 30 minutos):\n${enlace}\n\nSi no fuiste tú, ignora este mensaje.`,
    html,
  })
  return true
}
