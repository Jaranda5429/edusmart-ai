const express = require('express')
const router = express.Router()
const { chat } = require('../controllers/iaController')
const { verificarToken } = require('../middlewares/authMiddleware')

router.post('/chat', verificarToken, chat)
module.exports = router