import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await authService.login(form)
      login(res.data)
      const rol = res.data.usuario.rol
      if (rol === 'ADMIN') navigate('/admin/dashboard')
      else if (rol === 'PROFESOR') navigate('/profesor/dashboard')
      else navigate('/estudiante/dashboard')
    } catch (err) {
      const data = err.response?.data
      // Profesor bloqueado: tiene token temporal para renovar
      if (data?.requiereMembresia && data?.tokenTemporal) {
        // Guardamos datos temporales para la pantalla de renovacion
        sessionStorage.setItem('renovar_token', data.tokenTemporal)
        sessionStorage.setItem('renovar_usuario', JSON.stringify(data.usuario))
        navigate('/renovar')
        return
      }
      setError(data?.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavanda to-azulPastel flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800">EduSmart <span className="text-purple-600">AI+</span></h1>
          <p className="text-gray-500 mt-1">Inicia sesion en tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
            <input
              type="password" name="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
              required
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Verificando...' : 'Iniciar Sesion'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No tienes cuenta?{' '}
          <Link to="/register" className="text-purple-600 font-semibold hover:underline">Registrate</Link>
        </p>

       
        </div>
      </div>
  )
}

export default Login