const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const cursoRoutes = require('./routes/cursoRoutes')
const tareaRoutes = require('./routes/tareaRoutes')
const quizRoutes = require('./routes/quizRoutes')
const iaRoutes = require('./routes/iaRoutes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/cursos', cursoRoutes)
app.use('/api/tareas', tareaRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/ia', iaRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'EduSmart API funcionando 🚀' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})