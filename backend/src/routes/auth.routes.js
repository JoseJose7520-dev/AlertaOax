import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../utils/asyncHandler.js'
import { verificarToken } from '../middlewares/verificarToken.js'
import { iniciarSesion, perfilActual, registrar } from '../controllers/auth.controller.js'

const router = Router()

// Frena intentos masivos de adivinar contraseñas
const limitarIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' },
})

router.post('/register', limitarIntentos, asyncHandler(registrar))
router.post('/login', limitarIntentos, asyncHandler(iniciarSesion))
router.get('/me', verificarToken, asyncHandler(perfilActual))

export default router
