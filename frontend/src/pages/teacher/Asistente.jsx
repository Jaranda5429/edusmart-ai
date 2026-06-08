import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { iaService, cursoService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const Asistente = () => {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('explicar')
  const [cursos, setCursos] = useState([])
  const [cursoSeleccionado, setCursoSeleccionado] = useState('')
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    cargarCursos()
    setMensajes([{
      rol: 'ia',
      contenido: `¡Hola Profesor ${usuario?.nombre}! 👋 Soy tu asistente IA. Puedo ayudarte a crear contenido, explicar temas, generar ejercicios o revisar material para tus estudiantes.`
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const cargarCursos = async () => {
    try {
      const res = await cursoService.misCursos()
      setCursos(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleEnviar = async () => {
    if (!input.trim() || loading) return
    const mensajeUsuario = { rol: 'usuario', contenido: input }
    setMensajes(prev => [...prev, mensajeUsuario])
    setInput('')
    setLoading(true)
    try {
      const res = await iaService.chat({
        mensaje: input,
        cursoId: cursoSeleccionado || null,
        modo
      })
      setMensajes(prev => [...prev, { rol: 'ia', contenido: res.data.respuesta }])
    } catch (error) {
      setMensajes(prev => [...prev, { rol: 'ia', contenido: 'Lo siento, hubo un error. Por favor intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  const modos = [
    { value: 'explicar', label: '📖 Explicar tema' },
    { value: 'guiar', label: '🎯 Crear ejercicios' },
    { value: 'corregir', label: '✏️ Revisar contenido' },
    { value: 'ejercicios', label: '💪 Generar evaluación' },
  ]

  return (
    <div className="min-h-screen bg-grisSuave flex">
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
                item.path === '/profesor/asistente'
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

      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Asistente IA 🤖</h2>
            <p className="text-gray-500 text-sm">Tu asistente para crear contenido educativo</p>
          </div>
          <div className="w-10 h-10 bg-lavanda rounded-full flex items-center justify-center text-purple-600 font-bold">
            {usuario?.nombre?.charAt(0)}
          </div>
        </div>

        <div className="flex-1 flex p-6 gap-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ height: '500px' }}>
              {mensajes.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.rol === 'usuario' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.rol === 'ia' ? 'bg-lavanda text-purple-600' : 'bg-purple-600 text-white'
                  }`}>
                    {msg.rol === 'ia' ? '🤖' : usuario?.nombre?.charAt(0)}
                  </div>
                  <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm ${
                    msg.rol === 'ia' ? 'bg-grisSuave text-gray-800' : 'bg-purple-600 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.contenido}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-lavanda flex items-center justify-center text-sm">🤖</div>
                  <div className="bg-grisSuave px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleEnviar}
                  disabled={loading || !input.trim()}
                  className="bg-purple-600 text-white px-6 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 font-medium"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>

          <div className="w-64 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Modo de ayuda</h3>
              <div className="space-y-2">
                {modos.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setModo(m.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      modo === m.value ? 'bg-lavanda text-purple-700 font-medium' : 'text-gray-600 hover:bg-grisSuave'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Contexto del curso</h3>
              <select
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Sin curso específico</option>
                {cursos.map((curso) => (
                  <option key={curso.id} value={curso.id}>{curso.titulo}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Sugerencias</h3>
              <div className="space-y-2">
                {[
                  'Genera 5 preguntas sobre este tema',
                  'Crea un resumen para mis estudiantes',
                  'Dame ideas para una actividad',
                  'Explica este concepto de forma simple',
                  'Crea una rúbrica de evaluación'
                ].map((sugerencia) => (
                  <button
                    key={sugerencia}
                    onClick={() => setInput(sugerencia)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-lavanda hover:text-purple-700 transition-all border border-gray-100"
                  >
                    {sugerencia}
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

export default Asistente