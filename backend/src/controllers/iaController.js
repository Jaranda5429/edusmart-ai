const Groq = require('groq-sdk')
const { PrismaClient } = require('@prisma/client')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const prisma = new PrismaClient()

const chat = async (req, res) => {
  try {
    const { mensaje, cursoId, modo } = req.body
    const userId = req.usuario.id

    if (!mensaje) {
      return res.status(400).json({ message: 'El mensaje es obligatorio' })
    }

    let contexto = 'Eres un asistente educativo de EduSmart AI+. Ayudas a estudiantes a aprender de forma clara y paso a paso. Responde siempre en español.'

    if (cursoId) {
      const curso = await prisma.curso.findUnique({
        where: { id: parseInt(cursoId) },
        include: { tareas: true }
      })
      if (curso) {
        contexto += ` El estudiante está en el curso: "${curso.titulo}". Descripción: "${curso.descripcion}".`
      }
    }

    if (modo === 'explicar') {
      contexto += ' El estudiante quiere que le expliques un tema. Explica de forma clara, con ejemplos y paso a paso.'
    } else if (modo === 'guiar') {
      contexto += ' El estudiante necesita ayuda con una tarea. Guíalo paso a paso SIN darle la respuesta directa. Hazle preguntas para que llegue solo a la solución.'
    } else if (modo === 'corregir') {
      contexto += ' El estudiante quiere que corrijas su trabajo. Dale retroalimentación constructiva, señala errores y sugiere mejoras.'
    } else if (modo === 'ejercicios') {
      contexto += ' El estudiante quiere practicar. Genera ejercicios prácticos relacionados al tema que mencione.'
    }

    const respuesta = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: contexto },
        { role: 'user', content: mensaje }
      ],
      max_tokens: 1024
    })

    const respuestaTexto = respuesta.choices[0].message.content

    await prisma.mensaje.create({
      data: {
        contenido: `Usuario: ${mensaje} | IA: ${respuestaTexto}`,
        userId
      }
    })

    res.json({
      message: 'Respuesta generada exitosamente',
      respuesta: respuestaTexto
    })
  } catch (error) {
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