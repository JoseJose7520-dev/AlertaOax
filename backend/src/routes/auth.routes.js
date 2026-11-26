import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { bloquearBots } from '../middlewares/antiSpam.js'
import {
  accesoGoogle, cambiarAvisos, cambiarMiPassword, editarPerfil, eliminarMiCuenta, iniciarSesion, olvidePassword, perfilActual, reenviarCodigo,
  registrar, restablecerPassword, solicitarAutoridad, verificarCorreo,
} from '../controllers/auth.controller.js'

const router = Router()

// Frena intentos masivos de adivinar contraseñas
const limitarIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
})

// Evita usar "olvidé mi contraseña" para mandar correos masivos
const limitarCorreos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Ya pediste varios enlaces. Espera 15 minutos e inténtalo de nuevo.' },
})

router.post('/register', limitarIntentos, bloquearBots, asyncHandler(registrar))
router.post('/google', limitarIntentos, asyncHandler(accesoGoogle))
router.post('/olvide', limitarCorreos, bloquearBots, asyncHandler(olvidePassword))
router.post('/restablecer', limitarIntentos, asyncHandler(restablecerPassword))
router.post('/login', limitarIntentos, asyncHandler(iniciarSesion))
router.post('/verificar', limitarIntentos, asyncHandler(verificarCorreo))
router.post('/reenviar-codigo', limitarCorreos, bloquearBots, asyncHandler(reenviarCodigo))
router.get('/me', verificarToken, asyncHandler(perfilActual))
router.patch('/perfil', verificarToken, asyncHandler(editarPerfil))
router.patch('/avisos', verificarToken, asyncHandler(cambiarAvisos))
router.post('/password', limitarIntentos, verificarToken, asyncHandler(cambiarMiPassword))
router.post('/solicitud-autoridad', limitarIntentos, verificarToken, asyncHandler(solicitarAutoridad))
router.delete('/cuenta', limitarIntentos, verificarToken, asyncHandler(eliminarMiCuenta))

export default router
