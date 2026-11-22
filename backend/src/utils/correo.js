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
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#EEF2F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A">
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

/**
 * Envía el código de 6 dígitos para confirmar el correo de una cuenta nueva.
 * Sin SMTP configurado, escribe el código en la consola (modo desarrollo) y devuelve false.
 */
export async function enviarCodigoVerificacion({ para, nombre, codigo, minutos }) {
  const t = obtenerTransporte()
  if (!t) {
    console.log(`[correo] SMTP sin configurar. Código de verificación para ${para}: ${codigo}`)
    return false
  }
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#EEF2F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
    <tr><td style="background:#0B1120;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:bold">AlertaOax</td></tr>
    <tr><td style="padding:28px">
      <p style="font-size:18px;font-weight:bold;margin:0 0 12px">Hola, ${escapar(nombre)}</p>
      <p style="font-size:15px;line-height:1.5;margin:0 0 20px">Escribe este código en AlertaOax para confirmar tu correo. Vence en ${minutos} minutos.</p>
      <p style="margin:0 0 24px;font-size:34px;font-weight:bold;letter-spacing:8px;color:#2563EB">${escapar(codigo)}</p>
      <p style="font-size:13px;line-height:1.5;color:#475569;margin:0">Si no creaste una cuenta en AlertaOax, ignora este mensaje.</p>
    </td></tr>
  </table></td></tr></table></body></html>`
  await t.sendMail({
    from: env.correo.remitente,
    to: para,
    subject: `AlertaOax: tu código es ${codigo}`,
    text: `Hola, ${nombre}.\n\nTu código para confirmar el correo en AlertaOax es: ${codigo}\nVence en ${minutos} minutos.\n\nSi no creaste una cuenta, ignora este mensaje.`,
    html,
  })
  return true
}

const NIVEL_TEXTO = { critico: 'ALERTA ROJA · Riesgo crítico', alto: 'Riesgo alto' }
const NIVEL_COLOR = { critico: '#DC2626', alto: '#EA580C' }
const POR_LOTE = 50 // Gmail permite hasta 100 destinatarios por mensaje; en copia oculta nadie ve los demás correos

/**
 * Aviso de una alerta crítica o alta a las personas de la región (en copia oculta, por lotes).
 * Sin SMTP configurado, solo lo anota en la consola. Devuelve cuántos correos se enviaron.
 */
export async function enviarAvisoAlerta({ destinatarios, alerta, enlace }) {
  if (!destinatarios.length) return 0
  const t = obtenerTransporte()
  if (!t) {
    console.log(`[correo] SMTP sin configurar. Aviso de alerta ${alerta.id} para ${destinatarios.length} persona(s).`)
    return 0
  }
  const color = NIVEL_COLOR[alerta.nivel] ?? '#2563EB'
  const etiqueta = NIVEL_TEXTO[alerta.nivel] ?? 'Alerta'
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#EEF2F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden" cellpadding="0" cellspacing="0">
    <tr><td style="background:${color};padding:16px 28px;color:#ffffff;font-size:14px;font-weight:bold;letter-spacing:.5px">${escapar(etiqueta)} · Región ${escapar(alerta.region)}</td></tr>
    <tr><td style="padding:28px">
      <p style="font-size:22px;font-weight:bold;margin:0 0 12px">${escapar(alerta.titulo)}</p>
      <p style="font-size:15px;line-height:1.5;margin:0 0 20px;white-space:pre-line">${escapar(alerta.descripcion)}</p>
      <p style="margin:0 0 24px"><a href="${escapar(enlace)}" style="display:inline-block;background:#2563EB;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 22px;border-radius:12px">Qué hacer ahora</a></p>
      <p style="font-size:13px;line-height:1.5;color:#475569;margin:0">Emite: ${escapar(alerta.institucion)}. Si tu vida corre peligro, llama al 911.<br>Puedes desactivar estos avisos en «Mi perfil».</p>
    </td></tr>
  </table></td></tr></table></body></html>`
  let enviados = 0
  for (let i = 0; i < destinatarios.length; i += POR_LOTE) {
    const lote = destinatarios.slice(i, i + POR_LOTE)
    await t.sendMail({
      from: env.correo.remitente,
      to: env.correo.remitente,
      bcc: lote,
      subject: `${alerta.nivel === 'critico' ? '🔴' : '🟠'} AlertaOax: ${alerta.titulo}`,
      text: `${etiqueta} · Región ${alerta.region}\n\n${alerta.titulo}\n\n${alerta.descripcion}\n\nQué hacer ahora: ${enlace}\n\nSi tu vida corre peligro, llama al 911.`,
      html,
    })
    enviados += lote.length
  }
  return enviados
}
