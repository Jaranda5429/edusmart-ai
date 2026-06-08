import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { academicService } from '../services/api'
import { useAuth } from './AuthContext'

const ProfesorContext = createContext()
export const useProfesor = () => useContext(ProfesorContext)

export const ProfesorProvider = ({ children }) => {
  const { usuario } = useAuth()

  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar estructura completa del profesor
  const cargarEstructura = useCallback(async () => {
    if (!usuario || usuario.rol !== 'PROFESOR') return
    try {
      setLoading(true)
      const res = await academicService.getEstructura()
      const data = res.data || []
      setPeriodos(data)
      localStorage.setItem('periodos', JSON.stringify(data))
    } catch (err) {
      console.error('Error cargando estructura:', err)
    } finally {
      setLoading(false)
    }
  }, [usuario])

  useEffect(() => {
    if (usuario?.rol === 'PROFESOR') cargarEstructura()
  }, [usuario, cargarEstructura])

  // ── Periodos ──────────────────────────────────────────────────────────────
  const agregarPeriodo = async (data) => {
    try {
      await academicService.crearPeriodo({
        nombre: data.nombre,
        fechaInicio: data.fechaInicio || null,
        fechaFin: data.fechaFin || null,
      })
      await cargarEstructura()
    } catch (err) {
      console.error('Error creando periodo:', err)
      throw err
    }
  }

  const editarPeriodo = async (id, data) => {
    try {
      await academicService.editarPeriodo(id, {
        nombre: data.nombre,
        fechaInicio: data.fechaInicio || null,
        fechaFin: data.fechaFin || null,
      })
      await cargarEstructura()
    } catch (err) {
      console.error('Error editando periodo:', err)
      throw err
    }
  }

  const eliminarPeriodo = async (id) => {
    try {
      await academicService.eliminarPeriodo(id)
      await cargarEstructura()
    } catch (err) {
      console.error('Error eliminando periodo:', err)
      throw err
    }
  }

  // ── Grados ────────────────────────────────────────────────────────────────
  const agregarGrado = async (nombre, periodoId) => {
    try {
      await academicService.crearGrado({ nombre, periodoId })
      await cargarEstructura()
    } catch (err) {
      console.error('Error creando grado:', err)
      throw err
    }
  }

  const editarGrado = async (id, nombre) => {
    try {
      await academicService.editarGrado(id, { nombre })
      await cargarEstructura()
    } catch (err) {
      console.error('Error editando grado:', err)
      throw err
    }
  }

  const eliminarGrado = async (id) => {
    try {
      await academicService.eliminarGrado(id)
      await cargarEstructura()
    } catch (err) {
      console.error('Error eliminando grado:', err)
      throw err
    }
  }

  // ── Materias ──────────────────────────────────────────────────────────────
  const agregarMateria = async (gradoId, nombre, icono) => {
    try {
      await academicService.crearMateria({ gradoId, nombre, icono: icono || '📖' })
      await cargarEstructura()
    } catch (err) {
      console.error('Error creando materia:', err)
      throw err
    }
  }

  const editarMateria = async (id, nombre, icono) => {
    try {
      await academicService.editarMateria(id, { nombre, icono })
      await cargarEstructura()
    } catch (err) {
      console.error('Error editando materia:', err)
      throw err
    }
  }

  const eliminarMateria = async (id) => {
    try {
      await academicService.eliminarMateria(id)
      await cargarEstructura()
    } catch (err) {
      console.error('Error eliminando materia:', err)
      throw err
    }
  }

  const setClave = async (periodoId, gradoId, materiaId, clave) => {
    try {
      await academicService.setCodigo(materiaId, clave)
      await cargarEstructura()
    } catch (err) {
      console.error('Error guardando clave:', err)
      throw err
    }
  }

  const getClave = (periodoId, gradoId, materiaId) => {
    for (const p of periodos) {
      for (const g of p.grados || []) {
        for (const m of g.materias || []) {
          if (m.id === materiaId) return m.codigo || null
        }
      }
    }
    return null
  }

  // ── Actividades ───────────────────────────────────────────────────────────
  const [actividadesCache, setActividadesCache] = useState({})

  const getActividades = useCallback((periodoId, gradoId, materiaId) => {
    return actividadesCache[materiaId] || []
  }, [actividadesCache])

  const cargarActividades = async (materiaId) => {
    try {
      const res = await academicService.getActividades(materiaId)
      setActividadesCache(prev => ({ ...prev, [materiaId]: res.data || [] }))
      return res.data || []
    } catch (err) {
      console.error('Error cargando actividades:', err)
      return []
    }
  }

  const agregarActividad = async (periodoId, gradoId, materiaId, actividad) => {
    try {
      await academicService.crearActividad({
        materiaId,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion || null,
        fechaInicio: actividad.fechaInicio || null,
        fechaLimite: actividad.fechaLimite,
        foroActivo: actividad.foroActivo || false,
        soloForo: actividad.soloForo || false,
        foroTema: actividad.foroTema || null,
        foroFechaLimite: actividad.foroFechaLimite || null,
        contenidos: actividad.contenidos || [],
      })
      await cargarActividades(materiaId)
    } catch (err) {
      console.error('Error creando actividad:', err)
      throw err
    }
  }

  const calificarEntrega = async (periodoId, gradoId, materiaId, actividadId, estudianteId, calificacion) => {
    try {
      await academicService.calificarEntrega(actividadId, estudianteId, calificacion)
      await cargarActividades(materiaId)
    } catch (err) {
      console.error('Error calificando:', err)
      throw err
    }
  }

  // ── Matricula (estudiante) ─────────────────────────────────────────────────
  const matricularConClave = async (codigo, datosEstudiante) => {
    try {
      const res = await academicService.inscribirseConCodigo(codigo)
      return { ok: true, msg: res.data.message }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al matricularse'
      return { ok: false, msg }
    }
  }

  // ── Inscripciones (estudiante) ────────────────────────────────────────────
  const [inscripciones, setInscripciones] = useState([])

  const cargarInscripciones = useCallback(async () => {
  if (!usuario || usuario.rol !== 'ESTUDIANTE') return
  try {
    const res = await academicService.getMisInscripciones()
    console.log('INSCRIPCIONES:', JSON.stringify(res.data[0], null, 2))
    const normalized = (res.data || []).map(i => ({
  ...i,
  materiaName: i.materia?.nombre || '',
  gradoName: i.materia?.grado?.nombre || '',
  periodoName: i.materia?.grado?.periodo?.nombre || '',
  profesorId: i.materia?.grado?.periodo?.profesorId || null,
  periodoId: i.materia?.grado?.periodoId || null,
  gradoId: i.materia?.gradoId || null,
  materiaId: i.materiaId || null,
}))
setInscripciones(normalized)
localStorage.setItem('inscripciones_norm', JSON.stringify(normalized))
  } catch (err) {
    console.error('Error cargando inscripciones:', err)
  }
}, [usuario])

  useEffect(() => {
    if (usuario?.rol === 'ESTUDIANTE') cargarInscripciones()
  }, [usuario, cargarInscripciones])

  const getMisInscripciones = useCallback(() => {
    return inscripciones
  }, [inscripciones])

  // ── Entregas (estudiante) ─────────────────────────────────────────────────
  const entregarActividad = async (profesorId, periodoId, gradoId, materiaId, actividadId, estudianteId, datos) => {
    try {
      await academicService.entregarActividad(actividadId, {
        texto: datos.texto || null,
        archivoNombre: datos.archivo || null,
      })
      await cargarInscripciones()
      return { ok: true }
    } catch (err) {
      console.error('Error entregando:', err)
      return { ok: false, msg: err.response?.data?.message || 'Error al entregar' }
    }
  }

  // ── Foro ──────────────────────────────────────────────────────────────────
  const responderForo = async (periodoId, gradoId, materiaId, actividadId, estudianteId, respuesta) => {
    // TODO: conectar cuando se agregue endpoint de foro
    console.log('Foro pendiente de conectar a BD')
  }

  // Datos derivados para compatibilidad con componentes del profesor
  const grados = periodos.flatMap(p => (p.grados || []).map(g => ({
    ...g,
    materias: (g.materias || []).map(m => ({
      ...m,
      icon: m.icono || '📖'
    }))
  })))

  const estudiantes = {}
  grados.forEach(g => { estudiantes[g.id] = [] })

  return (
    <ProfesorContext.Provider value={{
      periodos, grados, estudiantes, loading,
      cargarEstructura, cargarActividades,
      // Periodos
      agregarPeriodo, editarPeriodo, eliminarPeriodo,
      // Grados
      agregarGrado, editarGrado, eliminarGrado,
      // Materias
      agregarMateria, editarMateria, eliminarMateria,
      setClave, getClave,
      // Actividades
      getActividades, agregarActividad, calificarEntrega,
      // Matricula
      matricularConClave,
      // Inscripciones estudiante
      inscripciones, getMisInscripciones, cargarInscripciones,
      // Entregas
      entregarActividad,
      // Foro
      responderForo,
    }}>
      {children}
    </ProfesorContext.Provider>
  )
}