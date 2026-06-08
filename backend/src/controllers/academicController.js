const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ── PERIODOS ─────────────────────────────────────────────────────────────────

const getPeriodos = async (req, res) => {
  try {
    const periodos = await prisma.periodo.findMany({
      where: { profesorId: req.usuario.id },
      orderBy: { createdAt: 'desc' },
      include: {
        grados: {
          include: {
            materias: {
              include: {
                _count: { select: { actividades: true, inscripciones: true } }
              }
            }
          }
        }
      }
    })
    res.json(periodos)
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo periodos', error: err.message })
  }
}

const crearPeriodo = async (req, res) => {
  try {
    const { nombre, fechaInicio, fechaFin } = req.body
    if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' })
    const periodo = await prisma.periodo.create({
      data: {
        nombre,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        profesorId: req.usuario.id
      }
    })
    res.status(201).json(periodo)
  } catch (err) {
    console.error('ERROR CREAR PERIODO:', err)
    res.status(500).json({ message: 'Error creando periodo', error: err.message })
  }
}

const editarPeriodo = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, fechaInicio, fechaFin, activo } = req.body
    const periodo = await prisma.periodo.findUnique({ where: { id: parseInt(id) } })
    if (!periodo) return res.status(404).json({ message: 'Periodo no encontrado' })
    if (periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    const actualizado = await prisma.periodo.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        activo: activo ?? periodo.activo
      }
    })
    res.json(actualizado)
  } catch (err) {
    res.status(500).json({ message: 'Error editando periodo', error: err.message })
  }
}

const eliminarPeriodo = async (req, res) => {
  try {
    const { id } = req.params
    const periodo = await prisma.periodo.findUnique({ where: { id: parseInt(id) } })
    if (!periodo) return res.status(404).json({ message: 'Periodo no encontrado' })
    if (periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    await prisma.periodo.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Periodo eliminado' })
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando periodo', error: err.message })
  }
}

// ── GRADOS ───────────────────────────────────────────────────────────────────

const crearGrado = async (req, res) => {
  try {
    const { periodoId, nombre } = req.body
    if (!nombre || !periodoId) return res.status(400).json({ message: 'Nombre y periodoId requeridos' })
    const periodo = await prisma.periodo.findUnique({ where: { id: parseInt(periodoId) } })
    if (!periodo || periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    const grado = await prisma.grado.create({ data: { nombre, periodoId: parseInt(periodoId) } })
    res.status(201).json(grado)
  } catch (err) {
    res.status(500).json({ message: 'Error creando grado', error: err.message })
  }
}

const editarGrado = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre } = req.body
    const grado = await prisma.grado.findUnique({ where: { id: parseInt(id) }, include: { periodo: true } })
    if (!grado || grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    const actualizado = await prisma.grado.update({ where: { id: parseInt(id) }, data: { nombre } })
    res.json(actualizado)
  } catch (err) {
    res.status(500).json({ message: 'Error editando grado', error: err.message })
  }
}

const eliminarGrado = async (req, res) => {
  try {
    const { id } = req.params
    const grado = await prisma.grado.findUnique({ where: { id: parseInt(id) }, include: { periodo: true } })
    if (!grado || grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    await prisma.grado.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Grado eliminado' })
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando grado', error: err.message })
  }
}

// ── MATERIAS ─────────────────────────────────────────────────────────────────

const crearMateria = async (req, res) => {
  try {
    const { gradoId, nombre, icono } = req.body
    if (!nombre || !gradoId) return res.status(400).json({ message: 'Nombre y gradoId requeridos' })
    const grado = await prisma.grado.findUnique({ where: { id: parseInt(gradoId) }, include: { periodo: true } })
    if (!grado || grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    const materia = await prisma.materia.create({ data: { nombre, icono: icono || '📖', gradoId: parseInt(gradoId) } })
    res.status(201).json(materia)
  } catch (err) {
    res.status(500).json({ message: 'Error creando materia', error: err.message })
  }
}

const editarMateria = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, icono, codigo } = req.body
    const materia = await prisma.materia.findUnique({
      where: { id: parseInt(id) },
      include: { grado: { include: { periodo: true } } }
    })
    if (!materia || materia.grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    const data = {}
    if (nombre) data.nombre = nombre
    if (icono) data.icono = icono
    if (codigo !== undefined) data.codigo = codigo ? codigo.toUpperCase().trim() : null
    const actualizada = await prisma.materia.update({ where: { id: parseInt(id) }, data })
    res.json(actualizada)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Ese codigo ya existe. Usa uno diferente.' })
    res.status(500).json({ message: 'Error editando materia', error: err.message })
  }
}

const eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params
    const materia = await prisma.materia.findUnique({
      where: { id: parseInt(id) },
      include: { grado: { include: { periodo: true } } }
    })
    if (!materia || materia.grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    await prisma.materia.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Materia eliminada' })
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando materia', error: err.message })
  }
}

const setCodigo = async (req, res) => {
  try {
    const { id } = req.params
    const { codigo } = req.body
    if (!codigo) return res.status(400).json({ message: 'Codigo requerido' })
    const materia = await prisma.materia.findUnique({
      where: { id: parseInt(id) },
      include: { grado: { include: { periodo: true } } }
    })
    if (!materia || materia.grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })
    const actualizada = await prisma.materia.update({
      where: { id: parseInt(id) },
      data: { codigo: codigo.toUpperCase().trim() }
    })
    res.json(actualizada)
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ message: 'Ese codigo ya esta en uso.' })
    res.status(500).json({ message: 'Error guardando codigo', error: err.message })
  }
}

const inscribirseConCodigo = async (req, res) => {
  try {
    const { codigo } = req.body
    if (!codigo) return res.status(400).json({ message: 'Codigo requerido' })

    const materia = await prisma.materia.findUnique({
      where: { codigo: codigo.toUpperCase().trim() },
      include: { grado: { include: { periodo: true } } }
    })
    if (!materia) return res.status(404).json({ message: 'Clave incorrecta. Verifica con tu profesor.' })

    const yaExiste = await prisma.inscripcion.findUnique({
      where: { estudianteId_materiaId: { estudianteId: req.usuario.id, materiaId: materia.id } }
    })
    if (yaExiste) return res.status(400).json({ message: 'Ya estas matriculado en esta materia.' })

    const inscripcion = await prisma.inscripcion.create({
      data: { estudianteId: req.usuario.id, materiaId: materia.id }
    })

    // Crear entregas para actividades que ya existen en esta materia
    const actividadesExistentes = await prisma.actividad.findMany({
      where: { materiaId: materia.id }
    })

    if (actividadesExistentes.length > 0) {
      await prisma.entrega.createMany({
        data: actividadesExistentes.map(act => ({
          estudianteId: req.usuario.id,
          actividadId: act.id,
          entregado: false
        })),
        skipDuplicates: true
      })
    }

    res.status(201).json({
      message: 'Matriculado en ' + materia.nombre + ' - ' + materia.grado.nombre + ' - ' + materia.grado.periodo.nombre,
      inscripcion, materia
    })
  } catch (err) {
    console.error('ERROR INSCRIBIRSE:', err)
    res.status(500).json({ message: 'Error inscribiendo', error: err.message })
  }
}

const getMiEstructura = async (req, res) => {
  try {
    const periodos = await prisma.periodo.findMany({
      where: { profesorId: req.usuario.id },
      orderBy: { createdAt: 'asc' },
      include: {
        grados: {
          orderBy: { createdAt: 'asc' },
          include: {
            materias: {
              orderBy: { createdAt: 'asc' },
              include: {
                _count: { select: { actividades: true, inscripciones: true } }
              }
            }
          }
        }
      }
    })
    res.json(periodos)
  } catch (err) {
    console.error('ERROR ESTRUCTURA:', err)
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const getMisInscripciones = async (req, res) => {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      where: { estudianteId: req.usuario.id },
      include: {
        materia: {
          include: {
            grado: { include: { periodo: true } },
            actividades: {
              include: {
                entregas: { where: { estudianteId: req.usuario.id } }
              }
            }
          }
        }
      }
    })
    res.json(inscripciones)
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo inscripciones', error: err.message })
  }
}

// ── ACTIVIDADES ───────────────────────────────────────────────────────────────

const crearActividad = async (req, res) => {
  try {
    const { materiaId, titulo, descripcion, fechaInicio, fechaLimite, foroActivo, soloForo, foroTema, foroFechaLimite, contenidos } = req.body
    if (!titulo || !fechaLimite || !materiaId) return res.status(400).json({ message: 'Faltan campos obligatorios' })

    const materia = await prisma.materia.findUnique({
      where: { id: parseInt(materiaId) },
      include: {
        grado: { include: { periodo: true } },
        inscripciones: true
      }
    })
    if (!materia || materia.grado.periodo.profesorId !== req.usuario.id) return res.status(403).json({ message: 'Sin permiso' })

    const actividad = await prisma.actividad.create({
      data: {
        titulo,
        descripcion: descripcion || null,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaLimite: new Date(fechaLimite),
        foroActivo: foroActivo || false,
        soloForo: soloForo || false,
        foroTema: foroTema || null,
        materiaId: parseInt(materiaId),
        contenidos: contenidos?.length ? {
          create: contenidos.map(c => ({
            tipo: c.tipo,
            label: c.label,
            icono: c.icon || '📄',
            texto: c.texto || null,
            url: c.url || null,
            nombre: c.nombre || null
          }))
        } : undefined,
        entregas: {
          create: materia.inscripciones.map(i => ({
            estudianteId: i.estudianteId,
            entregado: false
          }))
        }
      },
      include: { contenidos: true, entregas: true }
    })

    if (foroActivo && foroTema) {
      await prisma.foro.create({
        data: {
          tema: foroTema,
          fechaLimite: foroFechaLimite ? new Date(foroFechaLimite) : null,
          actividadId: actividad.id,
          respuestas: {
            create: materia.inscripciones.map(i => ({ estudianteId: i.estudianteId }))
          }
        }
      })
    }

    res.status(201).json(actividad)
  } catch (err) {
    console.error('ERROR CREAR ACTIVIDAD:', err)
    res.status(500).json({ message: 'Error creando actividad', error: err.message })
  }
}

const getActividades = async (req, res) => {
  try {
    const { materiaId } = req.params
    const actividades = await prisma.actividad.findMany({
      where: { materiaId: parseInt(materiaId) },
      orderBy: { createdAt: 'desc' },
      include: {
        contenidos: true,
        foro: {
          include: {
            respuestas: {
              include: { estudiante: { select: { id: true, nombre: true } } },
              orderBy: { createdAt: 'asc' }
            }
          }
        },
        entregas: {
          include: {
            estudiante: { select: { id: true, nombre: true, email: true } }
          }
        }
      }
    })
    res.json(actividades)
  } catch (err) {
    console.error('ERROR GET ACTIVIDADES:', err)
    res.status(500).json({ message: 'Error obteniendo actividades', error: err.message })
  }
}

const entregarActividad = async (req, res) => {
  try {
    const { actividadId } = req.params
    const { texto, archivoUrl, archivoNombre } = req.body

    const entrega = await prisma.entrega.upsert({
      where: {
        estudianteId_actividadId: {
          estudianteId: req.usuario.id,
          actividadId: parseInt(actividadId)
        }
      },
      update: {
        texto,
        archivoUrl: archivoUrl || null,
        archivoNombre: archivoNombre || null,
        entregado: true
      },
      create: {
        estudianteId: req.usuario.id,
        actividadId: parseInt(actividadId),
        texto,
        archivoUrl: archivoUrl || null,
        archivoNombre: archivoNombre || null,
        entregado: true
      }
    })
    res.json({ message: 'Entrega guardada', entrega })
  } catch (err) {
    console.error('ERROR ENTREGAR:', err)
    res.status(500).json({ message: 'Error guardando entrega', error: err.message })
  }
}

const calificarEntrega = async (req, res) => {
  try {
    const { actividadId, estudianteId } = req.params
    const { calificacion } = req.body
    if (calificacion === undefined) return res.status(400).json({ message: 'Calificacion requerida' })

    const entrega = await prisma.entrega.update({
      where: {
        estudianteId_actividadId: {
          estudianteId: parseInt(estudianteId),
          actividadId: parseInt(actividadId)
        }
      },
      data: { calificacion: parseFloat(calificacion) }
    })
    res.json({ message: 'Calificacion guardada', entrega })
  } catch (err) {
    console.error('ERROR CALIFICAR:', err)
    res.status(500).json({ message: 'Error calificando', error: err.message })
  }
}

const getEstadisticas = async (req, res) => {
  try {
    const periodos = await prisma.periodo.findMany({
      where: { profesorId: req.usuario.id },
      include: {
        grados: {
          include: {
            materias: {
              include: {
                inscripciones: { include: { estudiante: { select: { id: true, nombre: true, email: true } } } },
                actividades: {
                  include: {
                    entregas: true
                  }
                }
              }
            }
          }
        }
      }
    })
    res.json(periodos)
  } catch (err) {
    console.error('ERROR ESTADISTICAS:', err)
    res.status(500).json({ message: 'Error', error: err.message })
  }
}

const responderForo = async (req, res) => {
  try {
    const { actividadId } = req.params
    const { respuesta } = req.body
    if (!respuesta || !respuesta.trim()) return res.status(400).json({ message: 'Respuesta requerida' })

    // Buscar el foro de esa actividad (incluyendo la actividad para saber si es soloForo)
    const foro = await prisma.foro.findUnique({
      where: { actividadId: parseInt(actividadId) },
      include: { actividad: true }
    })
    if (!foro) return res.status(404).json({ message: 'Esta actividad no tiene foro' })

    // Guardar / actualizar la respuesta del foro
    const resp = await prisma.respuestaForo.upsert({
      where: {
        estudianteId_foroId: {
          estudianteId: req.usuario.id,
          foroId: foro.id
        }
      },
      update: { respuesta: respuesta.trim() },
      create: {
        estudianteId: req.usuario.id,
        foroId: foro.id,
        respuesta: respuesta.trim()
      }
    })

    // Si la actividad es SOLO FORO, marcar la entrega como entregada
    if (foro.actividad.soloForo) {
      await prisma.entrega.upsert({
        where: {
          estudianteId_actividadId: {
            estudianteId: req.usuario.id,
            actividadId: parseInt(actividadId)
          }
        },
        update: {
          texto: respuesta.trim(),
          entregado: true
        },
        create: {
          estudianteId: req.usuario.id,
          actividadId: parseInt(actividadId),
          texto: respuesta.trim(),
          entregado: true
        }
      })
    }

    res.json({ message: 'Respuesta publicada', respuesta: resp })
  } catch (err) {
    console.error('ERROR FORO:', err)
    res.status(500).json({ message: 'Error publicando en el foro', error: err.message })
  }
}

module.exports = {
  getPeriodos, crearPeriodo, editarPeriodo, eliminarPeriodo,
  crearGrado, editarGrado, eliminarGrado,
  crearMateria, editarMateria, eliminarMateria, setCodigo,
  inscribirseConCodigo, getMiEstructura, getMisInscripciones,
  crearActividad, getActividades, entregarActividad, calificarEntrega,
  crearActividad, getActividades, entregarActividad, calificarEntrega, 
  getEstadisticas, responderForo,
}