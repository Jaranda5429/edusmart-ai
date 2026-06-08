const express = require('express')
const router = express.Router()
const { getStats, getProfesores, getEstudiantes, getPagos, toggleUsuario, eliminarUsuario, renovarMembresia } = require('../controllers/adminController')
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware')

router.get('/stats',                    verificarToken, soloAdmin, getStats)
router.get('/profesores',               verificarToken, soloAdmin, getProfesores)
router.get('/estudiantes',              verificarToken, soloAdmin, getEstudiantes)
router.get('/pagos',                    verificarToken, soloAdmin, getPagos)
router.put('/usuarios/:id/toggle',      verificarToken, soloAdmin, toggleUsuario)
router.delete('/usuarios/:id',          verificarToken, soloAdmin, eliminarUsuario)
router.post('/usuarios/:id/renovar',    verificarToken, soloAdmin, renovarMembresia)

module.exports = router