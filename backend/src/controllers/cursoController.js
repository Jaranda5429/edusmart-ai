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

const obtenerAnaliticas = async (req, res) => {
  try {
    const profesorId = req.usuario.id

    // Cursos del profesor con toda la info necesaria
    const cursos = await prisma.curso.findMany({
      where: { profesorId },
      include: {
        inscripciones: {
          include: {
            estudiante: { select: { id: true, nombre: true, email: true } }
          }
        },
        tareas: {
          include: {
            entregas: {
              select: { calificacion: true, estudianteId: true }
            }
          }
        },
        quizzes: {
          include: {
            resultados: {
              select: { calificacion: true, estudianteId: true }
            }
          }
        }
      }
    })

    const analiticas = cursos.map(curso => {
      const totalEstudiantes = curso.inscripciones.length

      // Calificaciones de tareas
      const calificacionesTareas = curso.tareas.flatMap(t =>
        t.entregas
          .filter(e => e.calificacion !== null)
          .map(e => e.calificacion)
      )

      // Calificaciones de quizzes
      const calificacionesQuizzes = curso.quizzes.flatMap(q =>
        q.resultados.map(r => r.calificacion)
      )

      const todasCalificaciones = [...calificacionesTareas, ...calificacionesQuizzes]
      const promedio = todasCalificaciones.length > 0
        ? (todasCalificaciones.reduce((a, b) => a + b, 0) / todasCalificaciones.length).toFixed(1)
        : 0

      // Entregas totales vs esperadas
      const entregasTotales = curso.tareas.reduce((acc, t) => acc + t.entregas.length, 0)
      const entregasEsperadas = curso.tareas.length * totalEstudiantes

      // Resultados quizzes
      const quizzesTotales = curso.quizzes.reduce((acc, q) => acc + q.resultados.length, 0)
      const quizzesEsperados = curso.quizzes.length * totalEstudiantes

      return {
        id: curso.id,
        titulo: curso.titulo,
        totalEstudiantes,
        totalTareas: curso.tareas.length,
        totalQuizzes: curso.quizzes.length,
        entregasTotales,
        entregasEsperadas,
        quizzesTotales,
        quizzesEsperados,
        promedio: parseFloat(promedio),
        estudiantes: curso.inscripciones.map(i => {
          // Calificaciones por estudiante
          const califs = []
          curso.tareas.forEach(t => {
            const entrega = t.entregas.find(e => e.estudianteId === i.estudiante.id)
            if (entrega?.calificacion) califs.push(entrega.calificacion)
          })
          curso.quizzes.forEach(q => {
            const resultado = q.resultados.find(r => r.estudianteId === i.estudiante.id)
            if (resultado) califs.push(resultado.calificacion)
          })
          const promedioEstudiante = califs.length > 0
            ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)
            : 0
          return {
            ...i.estudiante,
            promedio: parseFloat(promedioEstudiante),
            actividades: califs.length
          }
        })
      }
    })

    res.json(analiticas)
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
  cursosInscritos,
  obtenerAnaliticas 
}