import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cursoService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Cursos = () => {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ titulo: '', descripcion: '', imagen: '' })
  const [guardando, setGuardando] = useState(false)
  const { usuario, logout } = useAuth()
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

  const handleSubmit = async () => {
    if (!form.titulo || !form.descripcion) return
    setGuardando(true)
    try {
      if (editando) {
        await cursoService.actualizar(editando, form)
      } else {
        await cursoService.crear(form)
      }
      setShowModal(false)
      setForm({ titulo: '', descripcion: '', imagen: '' })
      setEditando(null)
      cargarCursos()
    } catch (error) {
      console.error(error)
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (curso) => {
    setEditando(curso.id)
    setForm({ titulo: curso.titulo, descripcion: curso.descripcion, imagen: curso.imagen || '' })
    setShowModal(true)
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return
    try {
      await cursoService.eliminar(id)
      cargarCursos()
    } catch (error) {
      console.error(error)
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                item.path === '/profesor/cursos'
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
            <h2 className="text-xl font-bold text-gray-800">Mis Cursos 📚</h2>
            <p className="text-gray-500 text-sm">Gestiona tus cursos y contenido</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditando(null); setForm({ titulo: '', descripcion: '', imagen: '' }) }}
            className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 transition-all"
          >
            + Nuevo Curso
          </button>
        </div>

        <div className="flex-1 p-8">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Cargando cursos...</div>
          ) : cursos.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">📚</div>
              <p className="mb-4">No tienes cursos aún</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
              >
                Crear primer curso
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {cursos.map((curso, index) => (
                <div key={curso.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className={`${colores[index % colores.length]} p-6 flex items-center justify-center`}>
                    <span className="text-5xl">📚</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 mb-1">{curso.titulo}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{curso.descripcion}</p>
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-400">
                      <span>👨‍🎓 {curso._count?.inscripciones || 0} estudiantes</span>
                      <span>📝 {curso._count?.tareas || 0} tareas</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/profesor/cursos/${curso.id}`)}
                        className="flex-1 bg-lavanda text-purple-700 py-2 rounded-xl text-xs font-medium hover:opacity-80"
                      >
                        Ver curso
                      </button>
                      <button
                        onClick={() => handleEditar(curso)}
                        className="px-3 py-2 bg-grisSuave text-gray-600 rounded-xl text-xs hover:bg-gray-200"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminar(curso.id)}
                        className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs hover:bg-red-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">
              {editando ? 'Editar Curso' : 'Crear Nuevo Curso'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Matemáticas Avanzadas"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Describe el curso..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de imagen (opcional)</label>
                <input
                  type="text"
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setEditando(null) }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-grisSuave"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={guardando}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear Curso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cursos