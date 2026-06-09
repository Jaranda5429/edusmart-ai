const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── PROFESOR: crear foro en una materia ──────────────────────────────────────
const crearForo = async (req, res) => {
  try {
    const { materiaId, titulo, descripcion, fechaLimite } = req.body
    if (!titulo || !materiaId) return res.status(400).json({ message: 'Titulo y materia requeridos' })

    const materia = await prisma.materia.findUnique({
      where: { id: parseInt(materiaId) },
      include: { grado: { include: { periodo: true } } }
    })
    if (!materia || materia.grado.periodo.profesorId !== req.usuario.id)
      return res.status(403).json({ message: 'Sin permiso' })

    const foro = await prisma.foroTema.create({
      data: {
        titulo,
        descripcion: descripcion || null,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
        materiaId: parseInt(materiaId)
      }
    })
    res.status(201).json({ message: 'Foro publicado', foro })
  } catch (err) {
    console.error('ERROR CREAR FORO:', err)
    res.status(500).json({ message: 'Error creando foro', error: err.message })
  }
}

// ── Listar foros de una materia (profesor o estudiante) ──────────────────────
const getForosMateria = async (req, res) => {
  try {
    const { materiaId } = req.params
    const foros = await prisma.foroTema.findMany({
      where: { materiaId: parseInt(materiaId) },
      orderBy: { createdAt: 'desc' },
      include: {
        publicaciones: {
          orderBy: { createdAt: 'desc' },
          include: {
            estudiante: { select: { id: true, nombre: true } },
            comentarios: { orderBy: { createdAt: 'asc' } }
          }
        }
      }
    })
    res.json(foros)
  } catch (err) {
    console.error('ERROR GET FOROS:', err)
    res.status(500).json({ message: 'Error obteniendo foros', error: err.message })
  }
}

// ── PROFESOR: editar foro ────────────────────────────────────────────────────
const editarForo = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, descripcion, fechaLimite } = req.body
    const foro = await prisma.foroTema.findUnique({
      where: { id: parseInt(id) },
      include: { materia: { include: { grado: { include: { periodo: true } } } } }
    })
    if (!foro) return res.status(404).json({ message: 'Foro no encontrado' })
    if (foro.materia.grado.periodo.profesorId !== req.usuario.id)
      return res.status(403).json({ message: 'Sin permiso' })

    const actualizado = await prisma.foroTema.update({
      where: { id: parseInt(id) },
      data: {
        titulo: titulo ?? foro.titulo,
        descripcion: descripcion !== undefined ? descripcion : foro.descripcion,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null
      }
    })
    res.json({ message: 'Foro actualizado', foro: actualizado })
  } catch (err) {
    console.error('ERROR EDITAR FORO:', err)
    res.status(500).json({ message: 'Error editando foro', error: err.message })
  }
}

// ── PROFESOR: eliminar foro ──────────────────────────────────────────────────
const eliminarForo = async (req, res) => {
  try {
    const { id } = req.params
    const foro = await prisma.foroTema.findUnique({
      where: { id: parseInt(id) },
      include: { materia: { include: { grado: { include: { periodo: true } } } } }
    })
    if (!foro) return res.status(404).json({ message: 'Foro no encontrado' })
    if (foro.materia.grado.periodo.profesorId !== req.usuario.id)
      return res.status(403).json({ message: 'Sin permiso' })

    await prisma.foroTema.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Foro eliminado' })
  } catch (err) {
    console.error('ERROR ELIMINAR FORO:', err)
    res.status(500).json({ message: 'Error eliminando foro', error: err.message })
  }
}

// ── ESTUDIANTE: publicar en un foro ──────────────────────────────────────────
const publicar = async (req, res) => {
  try {
    const { foroTemaId } = req.params
    const { texto } = req.body
    if (!texto || !texto.trim()) return res.status(400).json({ message: 'El texto es requerido' })

    const foro = await prisma.foroTema.findUnique({ where: { id: parseInt(foroTemaId) } })
    if (!foro) return res.status(404).json({ message: 'Foro no encontrado' })

    const pub = await prisma.publicacionForo.create({
      data: {
        texto: texto.trim(),
        estudianteId: req.usuario.id,
        foroTemaId: parseInt(foroTemaId)
      }
    })
    res.status(201).json({ message: 'Publicado', publicacion: pub })
  } catch (err) {
    console.error('ERROR PUBLICAR:', err)
    res.status(500).json({ message: 'Error publicando', error: err.message })
  }
}

// ── ESTUDIANTE: editar su propia publicacion ─────────────────────────────────
const editarPublicacion = async (req, res) => {
  try {
    const { id } = req.params
    const { texto } = req.body
    if (!texto || !texto.trim()) return res.status(400).json({ message: 'El texto es requerido' })

    const pub = await prisma.publicacionForo.findUnique({ where: { id: parseInt(id) } })
    if (!pub) return res.status(404).json({ message: 'Publicacion no encontrada' })
    if (pub.estudianteId !== req.usuario.id) return res.status(403).json({ message: 'Solo puedes editar tu propia publicacion' })

    const actualizada = await prisma.publicacionForo.update({
      where: { id: parseInt(id) },
      data: { texto: texto.trim() }
    })
    res.json({ message: 'Publicacion actualizada', publicacion: actualizada })
  } catch (err) {
    console.error('ERROR EDITAR PUBLICACION:', err)
    res.status(500).json({ message: 'Error editando publicacion', error: err.message })
  }
}

// ── PROFESOR: eliminar publicacion de un estudiante (+ notificacion) ─────────
const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params
    const { motivo } = req.body

    const pub = await prisma.publicacionForo.findUnique({
      where: { id: parseInt(id) },
      include: {
        foroTema: { include: { materia: { include: { grado: { include: { periodo: true } } } } } }
      }
    })
    if (!pub) return res.status(404).json({ message: 'Publicacion no encontrada' })
    if (pub.foroTema.materia.grado.periodo.profesorId !== req.usuario.id)
      return res.status(403).json({ message: 'Sin permiso' })

    const estudianteId = pub.estudianteId
    const tituloForo = pub.foroTema.titulo

    await prisma.publicacionForo.delete({ where: { id: parseInt(id) } })

    // Notificar al estudiante
    await prisma.notificacion.create({
      data: {
        userId: estudianteId,
        tipo: 'foro_eliminado',
        titulo: 'Tu publicacion fue eliminada',
        mensaje: 'El profesor elimino tu publicacion en el foro "' + tituloForo + '".' + (motivo ? ' Motivo: ' + motivo : ' Puedes volver a participar.'),
        ruta: '/estudiante/cursos'
      }
    })

    res.json({ message: 'Publicacion eliminada y estudiante notificado' })
  } catch (err) {
    console.error('ERROR ELIMINAR PUBLICACION:', err)
    res.status(500).json({ message: 'Error eliminando publicacion', error: err.message })
  }
}

// ── Comentar una publicacion (estudiante o profesor) ─────────────────────────
const comentar = async (req, res) => {
  try {
    const { publicacionId } = req.params
    const { texto } = req.body
    if (!texto || !texto.trim()) return res.status(400).json({ message: 'El comentario es requerido' })

    const pub = await prisma.publicacionForo.findUnique({ where: { id: parseInt(publicacionId) } })
    if (!pub) return res.status(404).json({ message: 'Publicacion no encontrada' })

    const autor = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: { nombre: true }
    })

    const comentario = await prisma.comentarioPub.create({
      data: {
        texto: texto.trim(),
        autorId: req.usuario.id,
        autorNombre: autor?.nombre || 'Usuario',
        publicacionId: parseInt(publicacionId)
      }
    })
    res.status(201).json({ message: 'Comentario agregado', comentario })
  } catch (err) {
    console.error('ERROR COMENTAR:', err)
    res.status(500).json({ message: 'Error comentando', error: err.message })
  }
}

// ── NOTIFICACIONES ───────────────────────────────────────────────────────────
const getNotificaciones = async (req, res) => {
  try {
    const notis = await prisma.notificacion.findMany({
      where: { userId: req.usuario.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    res.json(notis)
  } catch (err) {
    console.error('ERROR GET NOTIS:', err)
    res.status(500).json({ message: 'Error obteniendo notificaciones', error: err.message })
  }
}

const marcarNotiLeida = async (req, res) => {
  try {
    const { id } = req.params
    const noti = await prisma.notificacion.findUnique({ where: { id: parseInt(id) } })
    if (!noti || noti.userId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    await prisma.notificacion.update({ where: { id: parseInt(id) }, data: { leida: true } })
    res.json({ message: 'Marcada como leida' })
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

module.exports = {
  crearForo, getForosMateria, editarForo, eliminarForo,
  publicar, editarPublicacion, eliminarPublicacion, comentar, 
  getNotificaciones, marcarNotiLeida
}