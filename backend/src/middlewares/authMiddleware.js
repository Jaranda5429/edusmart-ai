const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token requerido' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Token invalido' })
  }
}

const soloProfesor = (req, res, next) => {
  if (req.usuario.rol !== 'PROFESOR') return res.status(403).json({ message: 'Solo profesores' })
  next()
}

const soloEstudiante = (req, res, next) => {
  if (req.usuario.rol !== 'ESTUDIANTE') return res.status(403).json({ message: 'Solo estudiantes' })
  next()
}

const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') return res.status(403).json({ message: 'Solo administradores' })
  next()
}

const profeOAdmin = (req, res, next) => {
  if (!['PROFESOR', 'ADMIN'].includes(req.usuario.rol)) return res.status(403).json({ message: 'Sin permiso' })
  next()
}

module.exports = { verificarToken, soloProfesor, soloEstudiante, soloAdmin, profeOAdmin }
