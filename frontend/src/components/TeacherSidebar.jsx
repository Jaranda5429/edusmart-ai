// frontend/src/components/TeacherSidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📅', label: 'Periodos', path: '/profesor/periodos' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📝', label: 'Actividades', path: '/profesor/actividades' },
  { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
  { icon: '🤖', label: 'Asistente IA', path: '/profesor/asistente' },
  { icon: '👤', label: 'Mi Perfil', path: '/profesor/perfil' },
]

const TeacherSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  return (
    <div className="w-64 flex flex-col flex-shrink-0" style={{
      background: 'linear-gradient(180deg, #4C1D95 0%, #5B21B6 40%, #6D28D9 100%)',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Logo */}
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">EduSmart <span className="text-yellow-300">AI+</span></h1>
            <p className="text-purple-300 text-xs">Panel del Profesor</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const activo = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activo
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-purple-200 hover:bg-purple-700 hover:text-white'
              }`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {activo && <span className="ml-auto w-2 h-2 bg-purple-600 rounded-full" />}
            </button>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="p-4 border-t border-purple-700">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-purple-800 mb-2">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-purple-900 font-bold text-sm flex-shrink-0">
            {usuario?.nombre?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{usuario?.nombre}</p>
            <p className="text-xs text-purple-300">Profesor</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-900 hover:text-red-200 transition-all text-sm font-medium">
          <span>🚪</span><span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

export default TeacherSidebar
