const express = require('express')
const router = express.Router()
const {
  getPeriodos, crearPeriodo, editarPeriodo, eliminarPeriodo,
  crearGrado, editarGrado, eliminarGrado,
  crearMateria, editarMateria, eliminarMateria, setCodigo,
  inscribirseConCodigo, getMiEstructura, getMisInscripciones,
  crearActividad, getActividades, entregarActividad, calificarEntrega,
  getEstadisticas, responderForo,
} = require('../controllers/academicController')
const { verificarToken, soloProfesor, soloEstudiante } = require('../middlewares/authMiddleware')

// Profesor
router.get('/estructura',              verificarToken, soloProfesor, getMiEstructura)
router.get('/periodos',                verificarToken, soloProfesor, getPeriodos)
router.post('/periodos',               verificarToken, soloProfesor, crearPeriodo)
router.put('/periodos/:id',            verificarToken, soloProfesor, editarPeriodo)
router.delete('/periodos/:id',         verificarToken, soloProfesor, eliminarPeriodo)

router.post('/grados',                 verificarToken, soloProfesor, crearGrado)
router.put('/grados/:id',              verificarToken, soloProfesor, editarGrado)
router.delete('/grados/:id',           verificarToken, soloProfesor, eliminarGrado)

router.post('/materias',               verificarToken, soloProfesor, crearMateria)
router.put('/materias/:id',            verificarToken, soloProfesor, editarMateria)
router.delete('/materias/:id',         verificarToken, soloProfesor, eliminarMateria)
router.put('/materias/:id/codigo',     verificarToken, soloProfesor, setCodigo)

router.get('/estadisticas', verificarToken, soloProfesor, getEstadisticas)

// Estudiante
router.post('/inscribirse',            verificarToken, soloEstudiante, inscribirseConCodigo)
router.get('/mis-inscripciones',       verificarToken, soloEstudiante, getMisInscripciones)

router.post('/actividades', verificarToken, soloProfesor, crearActividad)
router.get('/materias/:materiaId/actividades', verificarToken, getActividades)
router.post('/actividades/:actividadId/entregar', verificarToken, soloEstudiante, entregarActividad)
router.post('/actividades/:actividadId/foro', verificarToken, soloEstudiante, responderForo)
router.put('/actividades/:actividadId/calificar/:estudianteId', verificarToken, soloProfesor, calificarEntrega)

module.exports = router
