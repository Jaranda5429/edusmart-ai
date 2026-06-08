import { useState, useRef, useEffect } from 'react'
import { iaService, cursoService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AIBot() {
  const { usuario } = useAuth()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cursos, setCursos] = useState([])
  const [cursoId, setCursoId] = useState('')
  const endRef = useRef(null)
  const esProf = usuario?.rol === 'PROFESOR'

  useEffect(() => {
    if (open && msgs.length === 0) {
      const saludo = esProf
        ? `¡Hola Profe ${usuario?.nombre?.split(' ')[0]}! 👋 Soy tu asistente IA. ¿En qué te ayudo hoy?`
        : `¡Hola ${usuario?.nombre?.split(' ')[0]}! 👋 Soy tu asistente de estudio. ¿Qué quieres aprender?`
      setMsgs([{ de: 'ia', texto: saludo }])
      cargarCursos()
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, open])

  const cargarCursos = async () => {
    try {
      const fn = esProf ? cursoService.misCursos : cursoService.cursosInscritos
      const r = await fn()
      setCursos(r.data || [])
    } catch {}
  }

  const enviar = async () => {
    if (!input.trim() || loading) return
    const txt = input.trim()
    setMsgs(p => [...p, { de: 'yo', texto: txt }])
    setInput('')
    setLoading(true)
    try {
      const r = await iaService.chat({ mensaje: txt, cursoId: cursoId || null, modo: esProf ? 'explicar' : 'aprender' })
      setMsgs(p => [...p, { de: 'ia', texto: r.data.respuesta }])
    } catch {
      setMsgs(p => [...p, { de: 'ia', texto: 'Hubo un error. Intenta de nuevo 🙏' }])
    } finally { setLoading(false) }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col" style={{ height: 480 }}>
          <div className="flex items-center gap-2 px-4 py-3 rounded-t-2xl" style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-base">🤖</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm leading-none">Asistente IA</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <p className="text-purple-200 text-xs">Activo</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg w-6 h-6 flex items-center justify-center">×</button>
          </div>

          {cursos.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-100">
              <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none bg-gray-50">
                <option value="">📚 Contexto general</option>
                {cursos.map(c => <option key={c.id} value={c.id}>📖 {c.nombre}</option>)}
              </select>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.de === 'yo' ? 'justify-end' : 'justify-start'}`}>
                {m.de === 'ia' && <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs mr-1.5 mt-0.5 flex-shrink-0">🤖</div>}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${m.de === 'yo' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                  {m.texto}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs mr-1.5">🤖</div>
                <div className="bg-gray-100 px-3 py-2 rounded-xl flex gap-1 items-center">
                  {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-2 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
                placeholder="Escribe tu pregunta..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50"
              />
              <button onClick={enviar} disabled={loading || !input.trim()} className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40" style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95"
        style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)', boxShadow: '0 8px 32px rgba(109,40,217,0.4)' }}
      >
        <span className="text-2xl">🤖</span>
        {!open && <span className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }} />}
      </button>
    </>
  )
}
