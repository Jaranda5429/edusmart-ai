const { generateText } = require('../utils/gemini')


const chat = async (req, res) => {
  try {
    const { mensaje, cursoId, modo } = req.body
    const userId = req.usuario.id
    const rol = req.usuario.rol

    if (!mensaje) {
      return res.status(400).json({ message: 'El mensaje es obligatorio' })
    }

    let contexto = rol === 'PROFESOR'
      ? 'Eres un asistente educativo de EduSmart AI+ especializado en ayudar a PROFESORES. Ayudas a crear contenido educativo, generar evaluaciones, diseñar actividades y preparar material didáctico. Tus respuestas son profesionales y orientadas a la enseñanza. Responde siempre en español.'
      : 'Eres un asistente educativo de EduSmart AI+ especializado en ayudar a ESTUDIANTES. Explicas los temas de forma clara, sencilla y paso a paso. Nunca das respuestas directas a tareas, en cambio guías al estudiante para que llegue solo a la solución. Responde siempre en español.'

    if (modo === 'explicar') {
      contexto += rol === 'PROFESOR'
        ? ' El profesor quiere explicar un tema a sus estudiantes. Ayúdalo a estructurar la explicación de forma clara y didáctica.'
        : ' El estudiante quiere que le expliques un tema. Explica de forma clara, con ejemplos y paso a paso.'
    } else if (modo === 'guiar') {
      contexto += rol === 'PROFESOR'
        ? ' El profesor quiere crear ejercicios prácticos. Genera ejercicios variados y apropiados para el nivel del curso.'
        : ' El estudiante necesita ayuda con una tarea. Guíalo paso a paso SIN darle la respuesta directa. Hazle preguntas para que llegue solo a la solución.'
    } else if (modo === 'corregir') {
      contexto += rol === 'PROFESOR'
        ? ' El profesor quiere revisar contenido educativo. Ayúdalo a mejorar y optimizar el material.'
        : ' El estudiante quiere que corrijas su trabajo. Dale retroalimentación constructiva, señala errores y sugiere mejoras.'
    } else if (modo === 'ejercicios') {
      contexto += rol === 'PROFESOR'
        ? ' El profesor quiere generar una evaluación. Crea preguntas variadas con criterios de evaluación claros.'
        : ' El estudiante quiere practicar. Genera ejercicios prácticos relacionados al tema que mencione.'
    }

    const respuestaTexto = await generateText({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: contexto },
        { role: 'user', content: mensaje }
      ],
      maxTokens: 1024
    })

    res.json({
      message: 'Respuesta generada exitosamente',
      respuesta: respuestaTexto
    })
  } catch (error) {
    console.error('Error IA:', error.message, error?.status, error?.error)
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

const historial = async (req, res) => {
  try {
    const userId = req.usuario.id
    const mensajes = await prisma.mensaje.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    res.json(mensajes)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

module.exports = { chat, historial }