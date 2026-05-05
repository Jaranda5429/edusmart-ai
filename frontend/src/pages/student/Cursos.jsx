import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cursoService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Cursos = () => {
  const [cursos, setCursos] = useState([])
  const [cursosInscritos, setCursosInscritos] = useState([])
  const [loading, setLoading] = useState(true)
  const [inscribiendo, setInscribiendo] = useState(null)
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [todosRes, inscritosRes] = await Promise.all([
        cursoService.obtenerTodos(),
        cursoService.cursosInscritos()
      ])
      setCursos(todosRes.data)
      setCursosInscritos(inscritosRes.data.map(c => c.id))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInscribirse = async (cursoId) => {
    setInscribiendo(cursoId)
    try {
      await cursoService.inscribirse(cursoId)
      setCursosInscritos([...cursosInscritos, cursoId])
    } catch (error) {
      console.error(error)
    } finally {
      setInscribiendo(null)
    }
  }

  const colores = ['bg-lavanda', 'bg-azulPastel', 'bg-verdeMenta', 'bg-durazno', 'bg-amarillo', 'bg-rosaPastel']

  return (
    <div className="min-h-screen bg-grisSuave flex">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">EduSmart <span className="text-purple-600">AI+</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
            { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
            { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
            { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
            { icon: '🤖', label: 'Asistente IA', path: '/estudiante/asistente' },
            { icon: '📊', label: 'Mi Progreso', path: '/estudiante/progreso' },
            { icon: '💬', label: 'Mensajes', path: '/estudiante/mensajes' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                item.path === '/estudiante/cursos'
                  ? 'bg-lavanda text-purple-700'
                  : 'text-gray-600 hover:bg-lavanda hover:text-purple-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Explorar Cursos 📚</h2>
            <p className="text-gray-500 text-sm">Inscríbete en los cursos disponibles</p>
          </div>
          <div className="w-10 h-10 bg-lavanda rounded-full flex items-center justify-center text-purple-600 font-bold">
            {usuario?.nombre?.charAt(0)}
          </div>
        </div>

        <div className="flex-1 p-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Cargando cursos...</div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📚</div>
              <p>No hay cursos disponibles aún</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {cursos.map((curso, index) => {
                const inscrito = cursosInscritos.includes(curso.id)
                return (
                  <div key={curso.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className={`${colores[index % colores.length]} p-6 flex items-center justify-center`}>
                      <span className="text-5xl">📚</span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 mb-1">{curso.titulo}</h3>
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">{curso.descripcion}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-lavanda rounded-full flex items-center justify-center text-xs text-purple-600 font-bold">
                          {curso.profesor?.nombre?.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500">Prof. {curso.profesor?.nombre}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-400">{curso._count?.inscripciones || 0} estudiantes</span>
                        <span className="text-xs text-gray-400">{curso._count?.contenidos || 0} contenidos</span>
                      </div>
                      {inscrito ? (
                        <button
                          onClick={() => navigate(`/estudiante/cursos/${curso.id}`)}
                          className="w-full bg-verdeMenta text-green-700 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
                        >
                          ✅ Continuar curso
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInscribirse(curso.id)}
                          disabled={inscribiendo === curso.id}
                          className="w-full bg-purple-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                          {inscribiendo === curso.id ? 'Inscribiendo...' : 'Inscribirse'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cursos