const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const crearQuiz = async (req, res) => {
  try {
    const { titulo, cursoId, preguntas } = req.body

    if (!titulo || !cursoId || !preguntas || preguntas.length === 0) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' })
    }

    const curso = await prisma.curso.findUnique({ where: { id: parseInt(cursoId) } })
    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado' })
    }

    if (curso.profesorId !== req.usuario.id) {
      return res.status(403).json({ message: 'No tienes permiso para crear quizzes en este curso' })
    }

    const quiz = await prisma.quiz.create({
      data: {
        titulo,
        cursoId: parseInt(cursoId),
        preguntas: {
          create: preguntas.map(p => ({
            texto: p.texto,
            opciones: p.opciones,
            correcta: p.correcta
          }))
        }
      },
      include: { preguntas: true }
    })

    res.status(201).json({ message: 'Quiz creado exitosamente', quiz })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const obtenerQuizzesPorCurso = async (req, res) => {
  try {
    const { cursoId } = req.params
    const quizzes = await prisma.quiz.findMany({
      where: { cursoId: parseInt(cursoId) },
      include: { _count: { select: { preguntas: true } } }
    })
    res.json(quizzes)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const obtenerQuizPorId = async (req, res) => {
  try {
    const { id } = req.params
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: { preguntas: true }
    })

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' })
    }

    res.json(quiz)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const responderQuiz = async (req, res) => {
  try {
    const { id } = req.params
    const { respuestas } = req.body

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: { preguntas: true }
    })

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' })
    }

    let correctas = 0
    const resultados = quiz.preguntas.map((pregunta, index) => {
      const esCorrecta = respuestas[index] === pregunta.correcta
      if (esCorrecta) correctas++
      return {
        pregunta: pregunta.texto,
        tuRespuesta: pregunta.opciones[respuestas[index]],
        respuestaCorrecta: pregunta.opciones[pregunta.correcta],
        esCorrecta
      }
    })

    const calificacion = (correctas / quiz.preguntas.length) * 10

    res.json({
      message: 'Quiz completado',
      calificacion: calificacion.toFixed(1),
      correctas,
      total: quiz.preguntas.length,
      resultados
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

module.exports = {
  crearQuiz,
  obtenerQuizzesPorCurso,
  obtenerQuizPorId,
  responderQuiz
}