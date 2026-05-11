const express = require('express')
const router = express.Router()
const {
  crearTarea,
  obtenerTareasPorCurso,
  obtenerTareaPorId,
  entregarTarea,
  entregarTareaConArchivo,
  calificarEntrega
} = require('../controllers/tareaController')
const { verificarToken, soloProfesor, soloEstudiante } = require('../middlewares/authMiddleware')
const { upload } = require('../utils/cloudinary')

router.post('/', verificarToken, soloProfesor, crearTarea)
router.get('/curso/:cursoId', verificarToken, obtenerTareasPorCurso)
router.get('/:id', verificarToken, obtenerTareaPorId)
router.post('/:id/entregar', verificarToken, soloEstudiante, entregarTarea)
router.post('/:id/entregar-archivo', verificarToken, soloEstudiante, upload.single('archivo'), entregarTareaConArchivo)
router.put('/entregas/:entregaId/calificar', verificarToken, soloProfesor, calificarEntrega)

module.exports = router