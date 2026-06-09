const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes     = require('./routes/authRoutes')
const academicRoutes = require('./routes/academicRoutes')
const iaRoutes       = require('./routes/iaRoutes')
const adminRoutes    = require('./routes/adminRoutes')
const foroRoutes     = require('./routes/foroRoutes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/auth',     authRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/academic', academicRoutes)
app.use('/api/ia',       iaRoutes)
app.use('/api/foros',    foroRoutes)

app.get('/', (req, res) => res.json({ message: 'EduSmart API v2.0 🚀' }))

app.listen(PORT, () => console.log('Servidor en puerto ' + PORT))