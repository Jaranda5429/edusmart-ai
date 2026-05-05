import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { cursoService } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { usuario, logout } = useAuth()
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    cargarCursos()
  }, [])

  const cargarCursos = async () => {
    try {
      const res = await cursoService.misCursos()
      setCursos(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-grisSuave flex">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">EduSmart <span className="text-purple-600">AI+</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
            { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
            { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
            { icon: '📝', label: 'Actividades', path: '/profesor/actividades' },
            { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
            { icon: '🤖', label: 'Asistente IA', path: '/profesor/asistente' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-lavanda hover:text-purple-700 transition-all text-sm font-medium"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header */}
        <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">¡Bienvenido, {usuario?.nombre}! 👋</h2>
            <p className="text-gray-500 text-sm">Aquí tienes un resumen de tu actividad académica</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lavanda rounded-full flex items-center justify-center text-purple-600 font-bold">
              {usuario?.nombre?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Cursos Creados', value: cursos.length, icon: '📚', color: 'bg-lavanda' },
              { label: 'Estudiantes', value: cursos.reduce((acc, c) => acc + (c._count?.inscripciones || 0), 0), icon: '👨‍🎓', color: 'bg-azulPastel' },
              { label: 'Tareas Activas', value: cursos.reduce((acc, c) => acc + (c._count?.tareas || 0), 0), icon: '📝', color: 'bg-verdeMenta' },
              { label: 'Promedio General', value: '87%', icon: '📊', color: 'bg-durazno' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Cursos y Crear */}
          <div className="grid grid-cols-3 gap-6">

            {/* Lista de cursos */}
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Vista General de Cursos</h3>
                <button
                  onClick={() => navigate('/profesor/cursos')}
                  className="text-purple-600 text-sm font-medium hover:underline"
                >
                  Ver todos
                </button>
              </div>
              {loading ? (
                <div className="text-center py-8 text-gray-400">Cargando...</div>
              ) : cursos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📚</div>
                  <p>No tienes cursos aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursos.map((curso) => (
                    <div key={curso.id} className="flex items-center justify-between p-3 bg-grisSuave rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lavanda rounded-xl flex items-center justify-center">📚</div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{curso.titulo}</div>
                          <div className="text-gray-400 text-xs">{curso._count?.inscripciones || 0} estudiantes</div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/profesor/cursos/${curso.id}`)}
                        className="text-purple-600 text-xs font-medium hover:underline"
                      >
                        Ver
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Crear contenido */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Crear Nuevo Contenido</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '🎥', label: 'Subir Video', color: 'bg-lavanda' },
                  { icon: '📝', label: 'Crear Tarea', color: 'bg-azulPastel' },
                  { icon: '❓', label: 'Crear Quiz', color: 'bg-verdeMenta' },
                  { icon: '🎮', label: 'Juego', color: 'bg-durazno' },
                  { icon: '📖', label: 'Guía Paso a Paso', color: 'bg-amarillo' },
                  { icon: '📄', label: 'Documento', color: 'bg-rosaPastel' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate('/profesor/cursos')}
                    className={`${item.color} rounded-xl p-3 flex flex-col items-center gap-1 hover:opacity-80 transition-all`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard