import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProfesorDashboard from './pages/teacher/Dashboard'
import ProfesorCursos from './pages/teacher/Cursos'
import ProfesorDetalleCurso from './pages/teacher/DetalleCurso'
import EstudianteDashboard from './pages/student/Dashboard'
import EstudianteCursos from './pages/student/Cursos'
import EstudianteAsistente from './pages/student/Asistente'
import EstudianteDetalleCurso from './pages/student/DetalleCurso'

const ProtectedRoute = ({ children, rol }) => {
  const { usuario, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-purple-600 text-xl font-semibold">Cargando...</div>
    </div>
  )

  if (!usuario) return <Navigate to="/login" />
  if (rol && usuario.rol !== rol) return <Navigate to="/login" />

  return children
}

const AppRoutes = () => {
  const { usuario } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas del Profesor */}
      <Route path="/profesor/dashboard" element={
        <ProtectedRoute rol="PROFESOR">
          <ProfesorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profesor/cursos" element={
        <ProtectedRoute rol="PROFESOR">
          <ProfesorCursos />
        </ProtectedRoute>
      } />
      <Route path="/profesor/cursos/:id" element={
        <ProtectedRoute rol="PROFESOR">
          <ProfesorDetalleCurso />
        </ProtectedRoute>
      } />

      {/* Rutas del Estudiante */}
      <Route path="/estudiante/dashboard" element={
        <ProtectedRoute rol="ESTUDIANTE">
          <EstudianteDashboard />
        </ProtectedRoute>
      } />
      <Route path="/estudiante/cursos" element={
        <ProtectedRoute rol="ESTUDIANTE">
          <EstudianteCursos />
        </ProtectedRoute>
      } />
      <Route path="/estudiante/asistente" element={
        <ProtectedRoute rol="ESTUDIANTE">
          <EstudianteAsistente />
        </ProtectedRoute>
      } />

      <Route path="/estudiante/cursos/:id" element={
        <ProtectedRoute rol="ESTUDIANTE">
          <EstudianteDetalleCurso />
        </ProtectedRoute>
      } />

      {/* Ruta raíz */}
      <Route path="/" element={
        usuario
          ? usuario.rol === 'PROFESOR'
            ? <Navigate to="/profesor/dashboard" />
            : <Navigate to="/estudiante/dashboard" />
          : <Navigate to="/login" />
      } />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App