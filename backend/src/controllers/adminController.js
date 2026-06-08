const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const getStats = async (req, res) => {
  try {
    const [totalProfesores, totalEstudiantes, totalPagos, profesoresActivos] = await Promise.all([
      prisma.user.count({ where: { rol: 'PROFESOR' } }),
      prisma.user.count({ where: { rol: 'ESTUDIANTE' } }),
      prisma.pago.aggregate({ _sum: { monto: true } }),
      prisma.user.count({ where: { rol: 'PROFESOR', membresiaActiva: true } }),
    ])

    const now = new Date()
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
    const pagosMes = await prisma.pago.aggregate({
      where: { createdAt: { gte: inicioMes } },
      _sum: { monto: true }
    })

    res.json({
      totalProfesores,
      totalEstudiantes,
      ingresoTotal: totalPagos._sum.monto || 0,
      ingresoMes: pagosMes._sum.monto || 0,
      profesoresActivos,
    })
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const getProfesores = async (req, res) => {
  try {
    const profesores = await prisma.user.findMany({
      where: { rol: 'PROFESOR' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, nombre: true, email: true, activo: true,
        membresiaActiva: true, membresiaTipo: true, membresiaVence: true, createdAt: true,
        _count: { select: { periodos: true } }
      }
    })
    res.json(profesores)
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const getEstudiantes = async (req, res) => {
  try {
    const estudiantes = await prisma.user.findMany({
      where: { rol: 'ESTUDIANTE' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, nombre: true, email: true, activo: true, createdAt: true,
        _count: { select: { inscripciones: true, entregas: true } }
      }
    })
    res.json(estudiantes)
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const getPagos = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nombre: true, email: true } }
      }
    })
    res.json(pagos)
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params
    const usuario = await prisma.user.findUnique({ where: { id: parseInt(id) } })
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })
    const actualizado = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { activo: !usuario.activo }
    })
    res.json({ message: 'Estado actualizado', activo: actualizado.activo })
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.user.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Usuario eliminado' })
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const renovarMembresia = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo } = req.body
    if (!['mensual', 'anual'].includes(tipo)) return res.status(400).json({ message: 'Tipo invalido' })

    const monto = tipo === 'mensual' ? 70000 : 700000
    const fechaVence = new Date()
    if (tipo === 'mensual') fechaVence.setMonth(fechaVence.getMonth() + 1)
    else fechaVence.setFullYear(fechaVence.getFullYear() + 1)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: parseInt(id) },
        data: { membresiaActiva: true, membresiaTipo: tipo, membresiaVence: fechaVence }
      }),
      prisma.pago.create({
        data: { userId: parseInt(id), tipo, monto, estado: 'aprobado' }
      })
    ])

    res.json({ message: 'Membresia renovada' })
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

module.exports = { getStats, getProfesores, getEstudiantes, getPagos, toggleUsuario, eliminarUsuario, renovarMembresia }