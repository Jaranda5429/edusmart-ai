import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/admin/Dashboard'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherCursos from './pages/teacher/Cursos'
import TeacherEstudiantes from './pages/teacher/Estudiantes'
import TeacherAnaliticas from './pages/teacher/Analiticas'
import TeacherPerfil from './pages/teacher/Perfil'
import StudentDashboard from './pages/student/Dashboard'
import StudentCursos from './pages/student/Cursos'
import StudentTareas from './pages/student/Tareas'
import StudentProgreso from './pages/student/Progreso'
import StudentJuegos from './pages/student/Juegos'
import StudentNotificaciones from './pages/student/Notificaciones'
import StudentPerfil from './pages/student/Perfil'
import AIBot from './components/AIBot'
import Renovar from './pages/auth/Renovar'
import RecuperarPassword from './pages/auth/RecuperarPassword'

const Ruta = ({ children, rol }) => {
  const { usuario, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-purple-600 font-semibold text-sm">Cargando EduSmart...</p>
      </div>
    </div>
  )
  if (!usuario) return <Navigate to="/login" replace />
  if (rol && usuario.rol !== rol) return <Navigate to="/login" replace />
  return <>{children}{usuario.rol !== 'ADMIN' && <AIBot />}</>
}

export default function App() {
  const { usuario } = useAuth()
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          !usuario ? <Navigate to="/login" replace /> :
          usuario.rol === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
          usuario.rol === 'PROFESOR' ? <Navigate to="/profesor/dashboard" replace /> :
          <Navigate to="/estudiante/dashboard" replace />
        } />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/renovar"  element={<Renovar />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={<Ruta rol="ADMIN"><AdminDashboard /></Ruta>} />

        {/* PROFESOR */}
        <Route path="/profesor/dashboard"   element={<Ruta rol="PROFESOR"><TeacherDashboard /></Ruta>} />
        <Route path="/profesor/cursos"      element={<Ruta rol="PROFESOR"><TeacherCursos /></Ruta>} />
        <Route path="/profesor/estudiantes" element={<Ruta rol="PROFESOR"><TeacherEstudiantes /></Ruta>} />
        <Route path="/profesor/analiticas"  element={<Ruta rol="PROFESOR"><TeacherAnaliticas /></Ruta>} />
        <Route path="/profesor/perfil"      element={<Ruta rol="PROFESOR"><TeacherPerfil /></Ruta>} />
        <Route path="/profesor/periodos"    element={<Navigate to="/profesor/cursos" replace />} />
        <Route path="/profesor/actividades" element={<Navigate to="/profesor/cursos" replace />} />

        {/* ESTUDIANTE */}
        <Route path="/estudiante/dashboard"      element={<Ruta rol="ESTUDIANTE"><StudentDashboard /></Ruta>} />
        <Route path="/estudiante/cursos"         element={<Ruta rol="ESTUDIANTE"><StudentCursos /></Ruta>} />
        <Route path="/estudiante/tareas"         element={<Ruta rol="ESTUDIANTE"><StudentTareas /></Ruta>} />
        <Route path="/estudiante/progreso"       element={<Ruta rol="ESTUDIANTE"><StudentProgreso /></Ruta>} />
        <Route path="/estudiante/juegos"         element={<Ruta rol="ESTUDIANTE"><StudentJuegos /></Ruta>} />
        <Route path="/estudiante/notificaciones" element={<Ruta rol="ESTUDIANTE"><StudentNotificaciones /></Ruta>} />
        <Route path="/estudiante/perfil"         element={<Ruta rol="ESTUDIANTE"><StudentPerfil /></Ruta>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
