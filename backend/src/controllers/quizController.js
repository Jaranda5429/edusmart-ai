const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// PROFESOR: crear quiz con preguntas
const crearQuiz = async (req, res) => {
  try {
    const { materiaId, titulo, descripcion, preguntas, fechaInicio, fechaLimite } = req.body
    if (!titulo || !materiaId) return res.status(400).json({ message: 'Titulo y materia requeridos' })
    if (!Array.isArray(preguntas) || preguntas.length === 0) return res.status(400).json({ message: 'Agrega al menos una pregunta' })

    const materia = await prisma.materia.findUnique({
      where: { id: parseInt(materiaId) },
      include: { inscripciones: true }
    })

    const quiz = await prisma.quiz.create({
      data: {
        titulo,
        descripcion: descripcion || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
        materiaId: parseInt(materiaId),
        preguntas: {
          create: preguntas.map(p => ({ texto: p.texto, opciones: p.opciones, correcta: p.correcta }))
        }
      },
      include: { preguntas: true }
    })

    if (materia?.inscripciones?.length) {
      await prisma.notificacion.createMany({
        data: materia.inscripciones.map(i => ({
          userId: i.estudianteId,
          tipo: 'quiz_nuevo',
          titulo: 'Nuevo quiz disponible',
          mensaje: titulo + (materia?.nombre ? ' · ' + materia.nombre : ''),
          ruta: '/estudiante/cursos?insc=' + i.id
        }))
      })
    }

    res.status(201).json({ message: 'Quiz creado', quiz })
  } catch (err) {
    console.error('ERROR CREAR QUIZ:', err)
    res.status(500).json({ message: 'Error creando quiz', error: err.message })
  }
}

// Listar quizzes de una materia
const getQuizzesMateria = async (req, res) => {
  try {
    const { materiaId } = req.params
    const quizzes = await prisma.quiz.findMany({
      where: { materiaId: parseInt(materiaId) },
      orderBy: { createdAt: 'desc' },
      include: {
        preguntas: true,
        intentos: { include: { estudiante: { select: { id: true, nombre: true } } } }
      }
    })
    res.json(quizzes)
  } catch (err) {
    console.error('ERROR GET QUIZZES:', err)
    res.status(500).json({ message: 'Error obteniendo quizzes', error: err.message })
  }
}

// PROFESOR: eliminar quiz
const eliminarQuiz = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.quiz.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Quiz eliminado' })
  } catch (err) {
    console.error('ERROR ELIMINAR QUIZ:', err)
    res.status(500).json({ message: 'Error eliminando quiz', error: err.message })
  }
}

// ESTUDIANTE: responder (autocalifica, max 2 intentos, mejor nota)
const responderQuiz = async (req, res) => {
  try {
    const { id } = req.params
    const { respuestas } = req.body

    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(id) },
      include: { preguntas: { orderBy: { id: 'asc' } } }
    })
    if (!quiz) return res.status(404).json({ message: 'Quiz no encontrado' })

    const ahora = new Date()
    if (quiz.fechaInicio && ahora < new Date(quiz.fechaInicio))
      return res.status(403).json({ message: 'El quiz aun no esta disponible' })
    if (quiz.fechaLimite && ahora > new Date(quiz.fechaLimite))
      return res.status(403).json({ message: 'El quiz ya cerro' })

    if (!Array.isArray(respuestas) || respuestas.length !== quiz.preguntas.length)
      return res.status(400).json({ message: 'Respuestas incompletas' })

    let aciertos = 0
    quiz.preguntas.forEach((p, i) => { if (respuestas[i] === p.correcta) aciertos++ })
    const nota = parseFloat(((aciertos / quiz.preguntas.length) * 10).toFixed(1))

    const previo = await prisma.intentoQuiz.findUnique({
      where: { estudianteId_quizId: { estudianteId: req.usuario.id, quizId: parseInt(id) } }
    })

    if (previo) {
      if (previo.intentos >= 2)
        return res.status(400).json({ message: 'Ya usaste tus 2 intentos', nota: previo.nota, aciertos, total: quiz.preguntas.length, sinIntentos: true })
      const mejorNota = Math.max(previo.nota, nota)
      const actualizado = await prisma.intentoQuiz.update({
        where: { estudianteId_quizId: { estudianteId: req.usuario.id, quizId: parseInt(id) } },
        data: { nota: mejorNota, intentos: previo.intentos + 1 }
      })
      return res.json({ message: 'Quiz enviado', nota, aciertos, total: quiz.preguntas.length, mejorNota: actualizado.nota, intentos: actualizado.intentos })
    }

    const nuevo = await prisma.intentoQuiz.create({
      data: { estudianteId: req.usuario.id, quizId: parseInt(id), nota, intentos: 1 }
    })
    res.json({ message: 'Quiz enviado', nota, aciertos, total: quiz.preguntas.length, mejorNota: nuevo.nota, intentos: nuevo.intentos })
  } catch (err) {
    console.error('ERROR RESPONDER QUIZ:', err)
    res.status(500).json({ message: 'Error enviando quiz', error: err.message })
  }
}

module.exports = { crearQuiz, getQuizzesMateria, eliminarQuiz, responderQuiz }
