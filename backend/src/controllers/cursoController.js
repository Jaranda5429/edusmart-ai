const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const crearCurso = async (req, res) => {
  try {
    const { titulo, descripcion, imagen } = req.body
    const profesorId = req.usuario.id

    if (!titulo || !descripcion) {
      return res.status(400).json({ message: 'Título y descripción son obligatorios' })
    }

    const curso = await prisma.curso.create({
      data: { titulo, descripcion, imagen, profesorId }
    })

    res.status(201).json({ message: 'Curso creado exitosamente', curso })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const obtenerCursos = async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        profesor: { select: { id: true, nombre: true, email: true } },
        _count: { select: { inscripciones: true, contenidos: true } }
      }
    })
    res.json(cursos)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const obtenerCursoPorId = async (req, res) => {
  try {
    const { id } = req.params
    const curso = await prisma.curso.findUnique({
      where: { id: parseInt(id) },
      include: {
        profesor: { select: { id: true, nombre: true, email: true } },
        contenidos: true,
        tareas: true,
        quizzes: true,
        _count: { select: { inscripciones: true } }
      }
    })

    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' })
    }

    res.json(curso)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const actualizarCurso = async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, descripcion, imagen } = req.body
    const profesorId = req.usuario.id

    const curso = await prisma.curso.findUnique({ where: { id: parseInt(id) } })

    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' })
    }

    if (curso.profesorId !== profesorId) {
      return res.status(403).json({ message: 'No tienes permiso para editar este curso' })
    }

    const cursoActualizado = await prisma.curso.update({
      where: { id: parseInt(id) },
      data: { titulo, descripcion, imagen }
    })

    res.json({ message: 'Curso actualizado exitosamente', curso: cursoActualizado })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const eliminarCurso = async (req, res) => {
  try {
    const { id } = req.params
    const profesorId = req.usuario.id

    const curso = await prisma.curso.findUnique({ where: { id: parseInt(id) } })

    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' })
    }

    if (curso.profesorId !== profesorId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este curso' })
    }

    await prisma.curso.delete({ where: { id: parseInt(id) } })

    res.json({ message: 'Curso eliminado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const misCursos = async (req, res) => {
  try {
    const profesorId = req.usuario.id
    const cursos = await prisma.curso.findMany({
      where: { profesorId },
      include: {
        _count: { select: { inscripciones: true, contenidos: true, tareas: true } }
      }
    })
    res.json(cursos)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const inscribirseACurso = async (req, res) => {
  try {
    const { id } = req.params
    const estudianteId = req.usuario.id

    const inscripcionExiste = await prisma.inscripcion.findFirst({
      where: { estudianteId, cursoId: parseInt(id) }
    })

    if (inscripcionExiste) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso' })
    }

    const inscripcion = await prisma.inscripcion.create({
      data: { estudianteId, cursoId: parseInt(id) }
    })

    res.status(201).json({ message: 'Inscripción exitosa', inscripcion })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const cursosInscritos = async (req, res) => {
  try {
    const estudianteId = req.usuario.id
    const inscripciones = await prisma.inscripcion.findMany({
      where: { estudianteId },
      include: {
        curso: {
          include: {
            profesor: { select: { id: true, nombre: true } },
            _count: { select: { contenidos: true, tareas: true } }
          }
        }
      }
    })
    res.json(inscripciones.map(i => i.curso))
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

module.exports = {
  crearCurso,
  obtenerCursos,
  obtenerCursoPorId,
  actualizarCurso,
  eliminarCurso,
  misCursos,
  inscribirseACurso,
  cursosInscritos
}