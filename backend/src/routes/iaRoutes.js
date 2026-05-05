const express = require('express')
const router = express.Router()
const { chat, historial } = require('../controllers/iaController')
const { verificarToken } = require('../middlewares/authMiddleware')

router.post('/chat', verificarToken, chat)
router.get('/historial', verificarToken, historial)

module.exports = router