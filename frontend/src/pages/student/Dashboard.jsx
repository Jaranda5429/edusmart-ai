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
      const res = await cursoService.cursosInscritos()
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
            <h2 className="text-xl font-bold text-gray-800">¡Hola, {usuario?.nombre}! 🌟</h2>
            <p className="text-gray-500 text-sm">Vamos a seguir aprendiendo juntos ✨</p>
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
              { label: 'Cursos Activos', value: cursos.length, icon: '📚', color: 'bg-lavanda' },
              { label: 'Tareas Pendientes', value: '8', icon: '📝', color: 'bg-azulPastel' },
              { label: 'Progreso General', value: '78%', icon: '📊', color: 'bg-verdeMenta' },
              { label: 'Logros', value: '12', icon: '🏆', color: 'bg-amarillo' },
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

          <div className="grid grid-cols-3 gap-6">

            {/* Mis cursos */}
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Mis Cursos</h3>
                <button
                  onClick={() => navigate('/estudiante/cursos')}
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
                  <p>No estás inscrito en ningún curso aún</p>
                  <button
                    onClick={() => navigate('/estudiante/cursos')}
                    className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
                  >
                    Explorar cursos
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursos.map((curso) => (
                    <div key={curso.id} className="flex items-center justify-between p-3 bg-grisSuave rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lavanda rounded-xl flex items-center justify-center">📚</div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{curso.titulo}</div>
                          <div className="text-gray-400 text-xs">Prof. {curso.profesor?.nombre}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/estudiante/cursos/${curso.id}`)}
                        className="text-purple-600 text-xs font-medium hover:underline"
                      >
                        Continuar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asistente IA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Asistente IA</h3>
                <button
                  onClick={() => navigate('/estudiante/asistente')}
                  className="text-purple-600 text-sm font-medium hover:underline"
                >
                  Ver historial
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-lavanda rounded-xl flex items-center justify-center text-2xl">🤖</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">¡Hola {usuario?.nombre}! 👋</p>
                  <p className="text-xs text-gray-500">¿En qué tema necesitas ayuda hoy?</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  'Explícame este tema',
                  'Ayúdame con mi tarea',
                  'Dame un resumen',
                  'Genera ejercicios'
                ].map((opcion) => (
                  <button
                    key={opcion}
                    onClick={() => navigate('/estudiante/asistente')}
                    className="bg-grisSuave text-gray-600 text-xs px-3 py-2 rounded-xl hover:bg-lavanda hover:text-purple-700 transition-all"
                  >
                    {opcion}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate('/estudiante/asistente')}
                className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition-all"
              >
                Abrir Asistente IA 🤖
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard