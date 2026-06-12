// frontend/src/pages/student/Asistente.jsx
import { useState, useEffect, useRef } from 'react'
import { iaService, cursoService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StudentSidebar from '../../components/StudentSidebar'

const Asistente = () => {
  const [mensajes, setMensajes] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('explicar')
  const [cursos, setCursos] = useState([])
  const [cursoSeleccionado, setCursoSeleccionado] = useState('')
  const { usuario } = useAuth()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    cargarCursos()
    setMensajes([{
      rol: 'ia',
      contenido: `¡Hola ${usuario?.nombre}! 👋 Soy tu asistente de aprendizaje. ¿En qué tema necesitas ayuda hoy?`
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const cargarCursos = async () => {
    try {
      const res = await cursoService.cursosInscritos()
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
      const res = await iaService.chat({ mensaje: input, cursoId: cursoSeleccionado || null, modo })
      setMensajes(prev => [...prev, { rol: 'ia', contenido: res.data.respuesta }])
    } catch {
      setMensajes(prev => [...prev, { rol: 'ia', contenido: 'Lo siento, hubo un error. Por favor intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar() }
  }

  const modos = [
    { value: 'explicar', label: '📖 Explicar tema' },
    { value: 'guiar', label: '🎯 Guiar tarea' },
    { value: 'corregir', label: '✏️ Corregir' },
    { value: 'ejercicios', label: '💪 Ejercicios' },
  ]

  return (
    <div className="min-h-screen bg-[rgba(124,58,237,0.06)] flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div style={{ background: "#1C1535" }} className="border-b border-[rgba(124,58,237,0.2)] px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#E5E7EB]">Asistente IA 🤖</h2>
            <p className="text-[rgba(156,163,175,0.5)] text-sm">Tu compañero de aprendizaje inteligente</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            {usuario?.nombre?.charAt(0)}
          </div>
        </div>

        <div className="flex-1 flex p-6 gap-6 overflow-hidden">

          {/* Chat */}
          <div className="flex-1 bg-[#1C1535] rounded-2xl shadow-none border border-[rgba(124,58,237,0.15)] flex flex-col overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {mensajes.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.rol === 'usuario' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    msg.rol === 'ia' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-600 text-white'
                  }`}>
                    {msg.rol === 'ia' ? '🤖' : usuario?.nombre?.charAt(0)}
                  </div>
                  <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm ${
                    msg.rol === 'ia' ? 'bg-[rgba(124,58,237,0.06)] text-[#E5E7EB] border border-[rgba(124,58,237,0.15)]' : 'bg-emerald-600 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.contenido}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm">🤖</div>
                  <div style={{ background: "rgba(124,58,237,0.06)" }} className="border border-[rgba(124,58,237,0.15)] px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[rgba(124,58,237,0.15)] flex-shrink-0">
              <div className="flex gap-3">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  rows={2} onKeyDown={handleKeyDown} />
                <button onClick={handleEnviar} disabled={loading || !input.trim()}
                  className="bg-emerald-600 text-white px-6 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 font-medium shadow-md">
                  ➤
                </button>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="w-64 space-y-4 overflow-y-auto">

            {/* Modo */}
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" border border-[rgba(124,58,237,0.15)] p-4">
              <h3 className="font-bold text-[#E5E7EB] mb-3 text-sm">Modo de ayuda</h3>
              <div className="space-y-2">
                {modos.map(m => (
                  <button key={m.value} onClick={() => setModo(m.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border ${
                      modo === m.value ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium' : 'text-[#9CA3AF] border-transparent hover:bg-[rgba(124,58,237,0.1)]'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Curso */}
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" border border-[rgba(124,58,237,0.15)] p-4">
              <h3 className="font-bold text-[#E5E7EB] mb-3 text-sm">Contexto del curso</h3>
              <select value={cursoSeleccionado} onChange={e => setCursoSeleccionado(e.target.value)}
                className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
                <option value="">Sin curso específico</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>{curso.titulo}</option>
                ))}
              </select>
            </div>

            {/* Sugerencias */}
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" border border-[rgba(124,58,237,0.15)] p-4">
              <h3 className="font-bold text-[#E5E7EB] mb-3 text-sm">Preguntas sugeridas</h3>
              <div className="space-y-2">
                {[
                  'Explícame este tema con ejemplos',
                  'No entiendo este concepto',
                  'Ayúdame paso a paso',
                  'Dame ejercicios para practicar',
                  'Revisa mi respuesta'
                ].map(sugerencia => (
                  <button key={sugerencia} onClick={() => setInput(sugerencia)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#9CA3AF] hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-[rgba(124,58,237,0.15)]">
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
