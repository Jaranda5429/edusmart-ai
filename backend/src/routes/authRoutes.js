// authRoutes.js
const express = require('express')
const router = express.Router()
const { register, login, pagarMembresia, renovarMembresia, miPerfil, cambiarPassword, solicitarRecuperacion, verificarCodigoRecuperacion, restablecerPassword} = require('../controllers/authController')
const { verificarToken } = require('../middlewares/authMiddleware')

router.post('/register', register)
router.post('/login', login)
router.post('/pagar-membresia', verificarToken, pagarMembresia)
router.post('/renovar-membresia', verificarToken, renovarMembresia)
router.get('/perfil', verificarToken, miPerfil)
router.put('/cambiar-password', verificarToken, cambiarPassword)
router.post('/forgot-password', solicitarRecuperacion)
router.post('/verify-reset-code', verificarCodigoRecuperacion)
router.post('/reset-password', restablecerPassword)

module.exports = router
