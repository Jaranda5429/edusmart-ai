import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

// ── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  pagarMembresia: (data, token) => axios.post(API_URL + '/auth/pagar-membresia', data, {
    headers: { Authorization: 'Bearer ' + token }
  }),
  renovarMembresia: (data, token) => axios.post(API_URL + '/auth/renovar-membresia', data, {
    headers: { Authorization: 'Bearer ' + token }
  }),
  miPerfil: () => api.get('/auth/perfil'),
  cambiarPassword: (data) => api.put('/auth/cambiar-password', data),
}

// ── Admin ───────────────────────────────────────────────────────────────────
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getProfesores: () => api.get('/admin/profesores'),
  getEstudiantes: () => api.get('/admin/estudiantes'),
  getPagos: () => api.get('/admin/pagos'),
  toggleUsuario: (id) => api.put('/admin/usuarios/' + id + '/toggle'),
  eliminarUsuario: (id) => api.delete('/admin/usuarios/' + id),
  renovarMembresia: (data, token) => axios.post(API_URL + '/auth/renovar-membresia', data, {
  headers: { Authorization: 'Bearer ' + token }
}),
}

// ── Estructura académica ────────────────────────────────────────────────────
export const academicService = {
  // Profesor - Estructura
  getEstructura: () => api.get('/academic/estructura'),

  // Profesor - Periodos
  crearPeriodo: (data) => api.post('/academic/periodos', data),
  editarPeriodo: (id, data) => api.put('/academic/periodos/' + id, data),
  eliminarPeriodo: (id) => api.delete('/academic/periodos/' + id),

  // Profesor - Grados
  crearGrado: (data) => api.post('/academic/grados', data),
  editarGrado: (id, data) => api.put('/academic/grados/' + id, data),
  eliminarGrado: (id) => api.delete('/academic/grados/' + id),

  // Profesor - Materias
  crearMateria: (data) => api.post('/academic/materias', data),
  editarMateria: (id, data) => api.put('/academic/materias/' + id, data),
  eliminarMateria: (id) => api.delete('/academic/materias/' + id),
  setCodigo: (id, codigo) => api.put('/academic/materias/' + id + '/codigo', { codigo }),

  // Profesor - Actividades
  crearActividad: (data) => api.post('/academic/actividades', data),
  getActividades: (materiaId) => api.get('/academic/materias/' + materiaId + '/actividades'),
  calificarEntrega: (actividadId, estudianteId, calificacion) => api.put('/academic/actividades/' + actividadId + '/calificar/' + estudianteId, { calificacion }),

  // Estudiante
  inscribirseConCodigo: (codigo) => api.post('/academic/inscribirse', { codigo }),
  getMisInscripciones: () => api.get('/academic/mis-inscripciones'),
  entregarActividad: (actividadId, data) => api.post('/academic/actividades/' + actividadId + '/entregar', data),
  responderForo: (actividadId, respuesta) => api.post('/academic/actividades/' + actividadId + '/foro', { respuesta }),

  getEstadisticas: () => api.get('/academic/estadisticas'),
}



// ── IA ──────────────────────────────────────────────────────────────────────
export const iaService = {
  chat: (data) => api.post('/ia/chat', data),
}

// ── Cursos (legacy) ─────────────────────────────────────────────────────────
export const cursoService = {
  misCursos: () => api.get('/academic/estructura'),
  cursosInscritos: () => api.get('/academic/mis-inscripciones'),
}

export default api