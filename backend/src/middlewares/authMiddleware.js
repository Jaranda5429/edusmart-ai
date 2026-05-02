const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado, token requerido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}

const soloProfesor = (req, res, next) => {
  if (req.usuario.rol !== 'PROFESOR') {
    return res.status(403).json({ message: 'Acceso solo para profesores' })
  }
  next()
}

const soloEstudiante = (req, res, next) => {
  if (req.usuario.rol !== 'ESTUDIANTE') {
    return res.status(403).json({ message: 'Acceso solo para estudiantes' })
  }
  next()
}

module.exports = { verificarToken, soloProfesor, soloEstudiante }