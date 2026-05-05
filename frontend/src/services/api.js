import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data)
}

export const cursoService = {
  obtenerTodos: () => api.get('/cursos'),
  obtenerPorId: (id) => api.get(`/cursos/${id}`),
  misCursos: () => api.get('/cursos/mis-cursos'),
  cursosInscritos: () => api.get('/cursos/inscritos'),
  crear: (data) => api.post('/cursos', data),
  actualizar: (id, data) => api.put(`/cursos/${id}`, data),
  eliminar: (id) => api.delete(`/cursos/${id}`),
  inscribirse: (id) => api.post(`/cursos/${id}/inscribirse`)
}

export const tareaService = {
  obtenerPorCurso: (cursoId) => api.get(`/tareas/curso/${cursoId}`),
  obtenerPorId: (id) => api.get(`/tareas/${id}`),
  crear: (data) => api.post('/tareas', data),
  entregar: (id, data) => api.post(`/tareas/${id}/entregar`, data),
  calificar: (entregaId, data) => api.put(`/tareas/entregas/${entregaId}/calificar`, data)
}

export const quizService = {
  obtenerPorCurso: (cursoId) => api.get(`/quizzes/curso/${cursoId}`),
  obtenerPorId: (id) => api.get(`/quizzes/${id}`),
  crear: (data) => api.post('/quizzes', data),
  responder: (id, data) => api.post(`/quizzes/${id}/responder`, data)
}

export const iaService = {
  chat: (data) => api.post('/ia/chat', data),
  historial: () => api.get('/ia/historial')
}

export default api