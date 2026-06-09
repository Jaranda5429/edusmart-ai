const express = require('express')
const router = express.Router()
const {
  crearForo, getForosMateria, editarForo, eliminarForo,
  publicar, editarPublicacion, eliminarPublicacion, comentar,
  getNotificaciones, marcarNotiLeida
} = require('../controllers/foroController')
const { verificarToken, soloProfesor } = require('../middlewares/authMiddleware')

// Foros
router.post('/', verificarToken, soloProfesor, crearForo)
router.get('/materia/:materiaId', verificarToken, getForosMateria)
router.put('/:id', verificarToken, soloProfesor, editarForo)
router.delete('/:id', verificarToken, soloProfesor, eliminarForo)

// Publicaciones
router.post('/:foroTemaId/publicar', verificarToken, publicar)
router.put('/publicacion/:id', verificarToken, editarPublicacion)
router.delete('/publicacion/:id', verificarToken, soloProfesor, eliminarPublicacion)

// Comentarios
router.post('/publicacion/:publicacionId/comentar', verificarToken, comentar)

// Notificaciones
router.get('/notificaciones/mias', verificarToken, getNotificaciones)
router.put('/notificaciones/:id/leida', verificarToken, marcarNotiLeida)    

module.exports = router