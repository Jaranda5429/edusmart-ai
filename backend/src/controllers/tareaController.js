const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, fechaLimite, cursoId } = req.body

    if (!titulo || !descripcion || !fechaLimite || !cursoId) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' })
    }

    const curso = await prisma.curso.findUnique({ where: { id: parseInt(cursoId) } })
    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' })
    }

    if (curso.profesorId !== req.usuario.id) {
      return res.status(403).json({ message: 'No tienes permiso para crear tareas en este curso' })
    }

    const tarea = await prisma.tarea.create({
      data: {
        titulo,
        descripcion,
        fechaLimite: new Date(fechaLimite),
        cursoId: parseInt(cursoId)
      }
    })

    res.status(201).json({ message: 'Tarea creada exitosamente', tarea })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const obtenerTareasPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params
    const tareas = await prisma.tarea.findMany({
      where: { cursoId: parseInt(cursoId) },
      include: {
        _count: { select: { entregas: true } }
      }
    })
    res.json(tareas)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const obtenerTareaPorId = async (req, res) => {
  try {
    const { id } = req.params
    const tarea = await prisma.tarea.findUnique({
      where: { id: parseInt(id) },
      include: {
        entregas: {
          include: {
            estudiante: { select: { id: true, nombre: true, email: true } }
          }
        }
      }
    })

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    res.json(tarea)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const entregarTarea = async (req, res) => {
  try {
    const { id } = req.params
    const { contenido } = req.body
    const estudianteId = req.usuario.id

    if (!contenido) {
      return res.status(400).json({ message: 'El contenido de la entrega es obligatorio' })
    }

    const entregaExiste = await prisma.entrega.findFirst({
      where: { tareaId: parseInt(id), estudianteId }
    })

    if (entregaExiste) {
      return res.status(400).json({ message: 'Ya entregaste esta tarea' })
    }

    const entrega = await prisma.entrega.create({
      data: {
        contenido,
        estudianteId,
        tareaId: parseInt(id)
      }
    })

    res.status(201).json({ message: 'Tarea entregada exitosamente', entrega })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const calificarEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params
    const { calificacion } = req.body

    if (calificacion < 0 || calificacion > 10) {
      return res.status(400).json({ message: 'La calificación debe estar entre 0 y 10' })
    }

    const entrega = await prisma.entrega.update({
      where: { id: parseInt(entregaId) },
      data: { calificacion: parseFloat(calificacion) }
    })

    res.json({ message: 'Entrega calificada exitosamente', entrega })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

module.exports = {
  crearTarea,
  obtenerTareasPorCurso,
  obtenerTareaPorId,
  entregarTarea,
  calificarEntrega
}