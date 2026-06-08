// frontend/src/components/StudentSidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🤖', label: 'Asistente IA', path: '/estudiante/asistente' },
  { icon: '📈', label: 'Mi Progreso', path: '/estudiante/progreso' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
  { icon: '👤', label: 'Mi Perfil', path: '/estudiante/perfil' },
]

const StudentSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  return (
    <div className="w-64 flex flex-col flex-shrink-0" style={{
      background: 'linear-gradient(180deg, #065F46 0%, #047857 40%, #059669 100%)',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <div className="p-6 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">🎓</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">EduSmart <span className="text-yellow-300">AI+</span></h1>
            <p className="text-emerald-300 text-xs">Panel del Estudiante</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const activo = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                activo ? 'bg-white text-emerald-700 shadow-lg' : 'text-emerald-100 hover:bg-emerald-700 hover:text-white'
              }`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {activo && <span className="ml-auto w-2 h-2 bg-emerald-600 rounded-full" />}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-emerald-700">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-800 mb-2">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-emerald-900 font-bold text-sm flex-shrink-0">
            {usuario?.nombre?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{usuario?.nombre}</p>
            <p className="text-xs text-emerald-300">Estudiante</p>
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

export default StudentSidebar
