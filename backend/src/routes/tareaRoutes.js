const express = require('express')
const router = express.Router()
const {
  crearTarea,
  obtenerTareasPorCurso,
  obtenerTareaPorId,
  entregarTarea,
  calificarEntrega
} = require('../controllers/tareaController')
const { verificarToken, soloProfesor, soloEstudiante } = require('../middlewares/authMiddleware')

router.post('/', verificarToken, soloProfesor, crearTarea)
router.get('/curso/:cursoId', verificarToken, obtenerTareasPorCurso)
router.get('/:id', verificarToken, obtenerTareaPorId)
router.post('/:id/entregar', verificarToken, soloEstudiante, entregarTarea)
router.put('/entregas/:entregaId/calificar', verificarToken, soloProfesor, calificarEntrega)

module.exports = router