const express = require('express')
const router = express.Router()
const {
  crearQuiz,
  obtenerQuizzesPorCurso,
  obtenerQuizPorId,
  responderQuiz
} = require('../controllers/quizController')
const { verificarToken, soloProfesor, soloEstudiante } = require('../middlewares/authMiddleware')

router.post('/', verificarToken, soloProfesor, crearQuiz)
router.get('/curso/:cursoId', verificarToken, obtenerQuizzesPorCurso)
router.get('/:id', verificarToken, obtenerQuizPorId)
router.post('/:id/responder', verificarToken, soloEstudiante, responderQuiz)

module.exports = router