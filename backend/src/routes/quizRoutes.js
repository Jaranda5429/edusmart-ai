const express = require('express')
const router = express.Router()
const { crearQuiz, getQuizzesMateria, eliminarQuiz, responderQuiz } = require('../controllers/quizController')
const { verificarToken, soloProfesor } = require('../middlewares/authMiddleware')

router.get('/materia/:materiaId', verificarToken, getQuizzesMateria)
router.post('/', verificarToken, soloProfesor, crearQuiz)
router.delete('/:id', verificarToken, soloProfesor, eliminarQuiz)
router.post('/:id/responder', verificarToken, responderQuiz)

module.exports = router