const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const { enviarCodigoRecuperacion } = require('../utils/mailer')
const prisma = new PrismaClient()

const PRECIOS = { mensual: 70000, anual: 700000 }

const DIAS_GRACIA = 3

// Devuelve: 'activa' | 'gracia' | 'bloqueada' | 'sin_membresia'
const estadoMembresia = (usuario) => {
  if (usuario.rol !== 'PROFESOR') return 'activa'
  if (!usuario.membresiaVence) return 'sin_membresia'

  const ahora = new Date()
  const vence = new Date(usuario.membresiaVence)
  const finGracia = new Date(vence)
  finGracia.setDate(finGracia.getDate() + DIAS_GRACIA)

  if (ahora <= vence) return 'activa'           // aún vigente
  if (ahora <= finGracia) return 'gracia'        // venció pero dentro de los 3 días
  return 'bloqueada'                             // pasó el periodo de gracia
}

const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body
    if (!nombre || !email || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' })

    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) return res.status(400).json({ message: 'El email ya esta registrado' })

    const hash = await bcrypt.hash(password, 10)

    // Estudiante: activo de inmediato. Profesor: activo pero sin membresía aún
    const usuario = await prisma.user.create({
      data: {
        nombre, email, password: hash,
        rol: rol || 'ESTUDIANTE',
        activo: true,
        membresiaActiva: rol === 'ESTUDIANTE',
      }
    })

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({
      message: 'Registro exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, membresiaActiva: usuario.membresiaActiva }
    })
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email y contrasena requeridos' })

    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) return res.status(400).json({ message: 'Credenciales incorrectas' })

    const valido = await bcrypt.compare(password, usuario.password)
    if (!valido) return res.status(400).json({ message: 'Credenciales incorrectas' })

    if (!usuario.activo) return res.status(403).json({ message: 'Cuenta desactivada. Contacta al administrador.' })

    const estado = estadoMembresia(usuario)

    // Profesor bloqueado: token temporal solo para renovar
    if (estado === 'bloqueada' || estado === 'sin_membresia') {
      const tokenTemporal = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '1h' })
      return res.status(403).json({
        message: estado === 'sin_membresia' ? 'Necesitas activar tu membresia.' : 'Tu periodo de gracia termino. Renueva para continuar.',
        requiereMembresia: true,
        tokenTemporal,
        usuario: {
          id: usuario.id, nombre: usuario.nombre, email: usuario.email,
          rol: usuario.rol, membresiaVence: usuario.membresiaVence
        }
      })
    }

    // Activa o en gracia: entra normal
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id, nombre: usuario.nombre, email: usuario.email,
        rol: usuario.rol, membresiaActiva: usuario.membresiaActiva,
        membresiaTipo: usuario.membresiaTipo, membresiaVence: usuario.membresiaVence,
        estadoMembresia: estado   // 'activa' | 'gracia'
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message })
  }
}

const pagarMembresia = async (req, res) => {
  try {
    const { tipo, datosTarjeta } = req.body
    const userId = req.usuario.id

    if (!['mensual', 'anual'].includes(tipo)) return res.status(400).json({ message: 'Tipo invalido. Usa mensual o anual.' })
    if (!datosTarjeta?.numero || !datosTarjeta?.nombre) return res.status(400).json({ message: 'Datos de tarjeta incompletos' })

    const monto = PRECIOS[tipo]
    const fechaVence = new Date()
    if (tipo === 'mensual') fechaVence.setMonth(fechaVence.getMonth() + 1)
    else fechaVence.setFullYear(fechaVence.getFullYear() + 1)

    const [usuario, pago] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { membresiaActiva: true, membresiaTipo: tipo, membresiaVence: fechaVence }
      }),
      prisma.pago.create({
        data: { userId, tipo, monto, estado: 'aprobado' }
      })
    ])

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      message: 'Pago procesado exitosamente',
      token,
      pago: { id: pago.id, tipo, monto, fecha: pago.createdAt },
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, membresiaActiva: true, membresiaTipo: tipo, membresiaVence: fechaVence }
    })
  } catch (err) {
    res.status(500).json({ message: 'Error procesando pago', error: err.message })
  }
}

const renovarMembresia = async (req, res) => {
  try {
    const { tipo, datosTarjeta } = req.body
    const userId = req.usuario.id
    if (!['mensual', 'anual'].includes(tipo)) return res.status(400).json({ message: 'Tipo invalido' })

    const monto = PRECIOS[tipo]
    const usuario = await prisma.user.findUnique({ where: { id: userId } })
    const base = usuario.membresiaVence && new Date(usuario.membresiaVence) > new Date() ? new Date(usuario.membresiaVence) : new Date()
    const fechaVence = new Date(base)
    if (tipo === 'mensual') fechaVence.setMonth(fechaVence.getMonth() + 1)
    else fechaVence.setFullYear(fechaVence.getFullYear() + 1)

    const [actualizado, pago] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { membresiaActiva: true, membresiaTipo: tipo, membresiaVence: fechaVence } }),
      prisma.pago.create({ data: { userId, tipo, monto, estado: 'aprobado' } })
    ])

    const token = jwt.sign({ id: actualizado.id, rol: actualizado.rol }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ message: 'Membresia renovada', token, pago, usuario: { ...actualizado, membresiaActiva: true } })
  } catch (err) {
    res.status(500).json({ message: 'Error renovando membresia', error: err.message })
  }
}

const miPerfil = async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, membresiaActiva: true, membresiaTipo: true, membresiaVence: true, createdAt: true }
    })
    res.json(usuario)
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo perfil', error: err.message })
  }
}

const cambiarPassword = async (req, res) => {
  try {
    const { actual, nueva } = req.body
    if (!actual || !nueva) return res.status(400).json({ message: 'Faltan datos' })
    if (nueva.length < 6) return res.status(400).json({ message: 'La nueva contrasena debe tener al menos 6 caracteres' })

    const usuario = await prisma.user.findUnique({ where: { id: req.usuario.id } })
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' })

    const valido = await bcrypt.compare(actual, usuario.password)
    if (!valido) return res.status(400).json({ message: 'La contrasena actual es incorrecta' })

    const hash = await bcrypt.hash(nueva, 10)
    await prisma.user.update({ where: { id: usuario.id }, data: { password: hash } })

    res.json({ message: 'Contrasena actualizada correctamente' })
  } catch (err) {
    console.error('ERROR CAMBIAR PASSWORD:', err)
    res.status(500).json({ message: 'Error cambiando contrasena', error: err.message })
  }
}

// ── RECUPERACION DE CONTRASENA ────────────────────────────────────────────────

const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'El correo es requerido' })

    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) return res.status(404).json({ message: 'No existe una cuenta con ese correo' })

    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    const resetExpira = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({ where: { id: usuario.id }, data: { resetCodigo: codigo, resetExpira } })

    await enviarCodigoRecuperacion(usuario.email, usuario.nombre, codigo)

    res.json({ message: 'Codigo enviado al correo' })
  } catch (err) {
    console.error('ERROR SOLICITAR RECUPERACION:', err)
    res.status(500).json({ message: 'Error enviando el codigo', error: err.message })
  }
}

const verificarCodigoRecuperacion = async (req, res) => {
  try {
    const { email, codigo } = req.body
    if (!email || !codigo) return res.status(400).json({ message: 'Faltan datos' })

    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario || !usuario.resetCodigo || !usuario.resetExpira)
      return res.status(400).json({ message: 'Codigo invalido o expirado' })

    if (usuario.resetCodigo !== codigo) return res.status(400).json({ message: 'Codigo incorrecto' })
    if (new Date() > new Date(usuario.resetExpira)) return res.status(400).json({ message: 'El codigo ha expirado' })

    res.json({ message: 'Codigo valido' })
  } catch (err) {
    console.error('ERROR VERIFICAR CODIGO:', err)
    res.status(500).json({ message: 'Error verificando el codigo', error: err.message })
  }
}

const restablecerPassword = async (req, res) => {
  try {
    const { email, codigo, nueva } = req.body
    if (!email || !codigo || !nueva) return res.status(400).json({ message: 'Faltan datos' })
    if (nueva.length < 6) return res.status(400).json({ message: 'La nueva contrasena debe tener al menos 6 caracteres' })

    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario || !usuario.resetCodigo || !usuario.resetExpira)
      return res.status(400).json({ message: 'Codigo invalido o expirado' })

    if (usuario.resetCodigo !== codigo) return res.status(400).json({ message: 'Codigo incorrecto' })
    if (new Date() > new Date(usuario.resetExpira)) return res.status(400).json({ message: 'El codigo ha expirado' })

    const hash = await bcrypt.hash(nueva, 10)
    await prisma.user.update({ where: { id: usuario.id }, data: { password: hash, resetCodigo: null, resetExpira: null } })

    res.json({ message: 'Contrasena restablecida correctamente' })
  } catch (err) {
    console.error('ERROR RESTABLECER PASSWORD:', err)
    res.status(500).json({ message: 'Error restableciendo la contrasena', error: err.message })
  }
}

module.exports = { register, login, pagarMembresia, renovarMembresia, miPerfil, estadoMembresia, cambiarPassword, solicitarRecuperacion, verificarCodigoRecuperacion, restablecerPassword }
