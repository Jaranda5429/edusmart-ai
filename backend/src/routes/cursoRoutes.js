const express = require('express')
const router = express.Router()
const {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso,
  misCursos,
  inscribirseACurso,
  cursosInscritos
} = require('../controllers/cursoController')
const { verificarToken, soloProfesor, soloEstudiante } = require('../middlewares/authMiddleware')

router.get('/', obtenerCursos)
router.get('/mis-cursos', verificarToken, soloProfesor, misCursos)
router.get('/inscritos', verificarToken, soloEstudiante, cursosInscritos)
router.get('/:id', obtenerCursoPorId)
router.post('/', verificarToken, soloProfesor, crearCurso)
router.put('/:id', verificarToken, soloProfesor, actualizarCurso)
router.delete('/:id', verificarToken, soloProfesor, eliminarCurso)
router.post('/:id/inscribirse', verificarToken, soloEstudiante, inscribirseACurso)

module.exports = router