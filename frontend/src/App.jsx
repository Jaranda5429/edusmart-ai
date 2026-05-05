import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProfesorDashboard from './pages/teacher/Dashboard'
import EstudianteDashboard from './pages/student/Dashboard'

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
      <Route path="/profesor/dashboard" element={
        <ProtectedRoute rol="PROFESOR">
          <ProfesorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/estudiante/dashboard" element={
        <ProtectedRoute rol="ESTUDIANTE">
          <EstudianteDashboard />
        </ProtectedRoute>
      } />
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