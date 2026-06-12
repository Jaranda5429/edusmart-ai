import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cursoService, tareaService, quizService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio',          path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos',       path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas',           path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso',         path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos',           path: '/estudiante/juegos' },
]

const DetalleCurso = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()

  const [curso, setCurso] = useState(null)
  const [tareas, setTareas] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('tareas')
  const [archivo, setArchivo] = useState(null)

  // Modal tarea
  const [showModalTarea, setShowModalTarea] = useState(false)
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const [entrega, setEntrega] = useState('')
  const [entregando, setEntregando] = useState(false)

  // Modal quiz
  const [quizSeleccionado, setQuizSeleccionado] = useState(null)
  const [respuestas, setRespuestas] = useState([])
  const [resultado, setResultado] = useState(null)
  const [respondiendo, setRespondiendo] = useState(false)

  const [quizzesCompletados, setQuizzesCompletados] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`quizzes_completados_${id}`) || '{}') } catch { return {} }
  })
  const [tareasEntregadas, setTareasEntregadas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`tareas_entregadas_${id}`) || '{}') } catch { return {} }
  })

  useEffect(() => { cargarDatos() }, [id])

  const cargarDatos = async () => {
    try {
      const [cursoRes, tareasRes, quizzesRes] = await Promise.all([
        cursoService.obtenerPorId(id),
        tareaService.obtenerPorCurso(id),
        quizService.obtenerPorCurso(id),
      ])
      setCurso(cursoRes.data)
      setTareas(tareasRes.data)
      setQuizzes(quizzesRes.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEntregar = async () => {
    if (!entrega.trim() && !archivo) return
    setEntregando(true)
    try {
      if (archivo) {
        const formData = new FormData()
        formData.append('archivo', archivo)
        if (entrega.trim()) formData.append('contenido', entrega)
        await tareaService.entregarConArchivo(tareaSeleccionada.id, formData)
      } else {
        await tareaService.entregar(tareaSeleccionada.id, { contenido: entrega })
      }
      const nuevas = { ...tareasEntregadas, [tareaSeleccionada.id]: true }
      setTareasEntregadas(nuevas)
      localStorage.setItem(`tareas_entregadas_${id}`, JSON.stringify(nuevas))
      setShowModalTarea(false)
      setEntrega('')
      setArchivo(null)
      setTareaSeleccionada(null)
      alert('¡Tarea entregada exitosamente!')
    } catch (error) {
      alert(error.response?.data?.message || 'Error al entregar')
    } finally {
      setEntregando(false)
    }
  }

  const handleResponderQuiz = async () => {
    if (respuestas.includes(null)) return
    setRespondiendo(true)
    try {
      const res = await quizService.responder(quizSeleccionado.id, { respuestas })
      setResultado(res.data)
      const nuevos = {
        ...quizzesCompletados,
        [quizSeleccionado.id]: {
          calificacion: res.data.calificacion,
          correctas: res.data.correctas,
          total: res.data.total,
        },
      }
      setQuizzesCompletados(nuevos)
      localStorage.setItem(`quizzes_completados_${id}`, JSON.stringify(nuevos))
    } catch (error) {
      console.error(error)
    } finally {
      setRespondiendo(false)
    }
  }

  const abrirQuiz = async (quiz) => {
    try {
      const res = await quizService.obtenerPorId(quiz.id)
      setQuizSeleccionado(res.data)
      setRespuestas(new Array(res.data.preguntas.length).fill(null))
      setResultado(null)
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-lg">Cargando curso...</p>
      </div>
    </Layout>
  )

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-4xl mx-auto px-5 py-6">

        {/* Header del curso */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/estudiante/cursos')}
              className="text-gray-400 hover:text-gray-200 text-xl"
            >←</button>
            <div>
              <h2 className="text-xl font-bold text-gray-100">{curso?.titulo}</h2>
              <p className="text-gray-400 text-sm">Prof. {curso?.profesor?.nombre}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/estudiante/asistente')}
            className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80"
          >
            🤖 Pedir ayuda a IA
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['tareas', 'quizzes'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              {t === 'tareas' ? '📝 Tareas' : '❓ Quizzes'}
            </button>
          ))}
        </div>

        {/* Tareas */}
        {tab === 'tareas' && (
          <div className="space-y-4">
            {tareas.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-[#1C1535] rounded-2xl">
                <div className="text-4xl mb-2">📝</div>
                <p>No hay tareas aún</p>
              </div>
            ) : (
              tareas.map((tarea) => {
                const entregada = tareasEntregadas[tarea.id]
                return (
                  <div
                    key={tarea.id}
                    className="p-5 flex items-center justify-between rounded-2xl"
                    style={{ background: '#1C1535', border: '1px solid rgba(124,58,237,0.18)' }}
                  >
                    <div>
                      <h3 className="font-bold text-gray-100">{tarea.titulo}</h3>
                      <p className="text-gray-400 text-sm mt-1">{tarea.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        📅 Fecha límite: {new Date(tarea.fechaLimite).toLocaleDateString()}
                      </p>
                      {entregada && <p className="text-green-400 text-sm mt-1 font-medium">✅ Entregada</p>}
                    </div>
                    {entregada ? (
                      <div className="bg-green-900/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium">
                        ✅ Entregada
                      </div>
                    ) : (
                      <button
                        onClick={() => { setTareaSeleccionada(tarea); setShowModalTarea(true) }}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Quizzes */}
        {tab === 'quizzes' && (
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <div className="text-center py-16 text-gray-500 bg-[#1C1535] rounded-2xl">
                <div className="text-4xl mb-2">❓</div>
                <p>No hay quizzes aún</p>
              </div>
            ) : (
              quizzes.map((quiz) => {
                const completado = quizzesCompletados[quiz.id]
                return (
                  <div
                    key={quiz.id}
                    className="p-5 flex items-center justify-between rounded-2xl"
                    style={{ background: '#1C1535', border: '1px solid rgba(124,58,237,0.18)' }}
                  >
                    <div>
                      <h3 className="font-bold text-gray-100">{quiz.titulo}</h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {quiz._count?.preguntas || 0} preguntas
                      </p>
                      {completado && (
                        <p className="text-green-400 text-sm mt-1 font-medium">
                          ✅ Completado — {completado.calificacion}/10
                        </p>
                      )}
                    </div>
                    {completado ? (
                      <div className="bg-green-900/20 text-green-400 px-4 py-2 rounded-xl text-sm font-medium">
                        ✅ Completado
                      </div>
                    ) : (
                      <button
                        onClick={() => abrirQuiz(quiz)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
                      >
                        Responder
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Modal — Entregar Tarea */}
      {showModalTarea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="p-6 w-full max-w-lg"
            style={{ background: '#1C1535', borderRadius: 16, border: '1px solid rgba(124,58,237,0.18)' }}
          >
            <h3 className="font-bold text-gray-100 text-lg mb-1">{tareaSeleccionada?.titulo}</h3>
            <p className="text-gray-400 text-sm mb-4">{tareaSeleccionada?.descripcion}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tu respuesta (opcional)
                </label>
                <textarea
                  value={entrega}
                  onChange={(e) => setEntrega(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  rows={4}
                  className="w-full px-4 py-3 text-sm text-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(124,58,237,0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Adjuntar archivo (opcional)
                </label>
                <div className="border-2 border-dashed border-purple-800 rounded-xl p-4 text-center hover:border-purple-500 transition-all">
                  <input
                    type="file"
                    id="archivo"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(e) => setArchivo(e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="archivo" className="cursor-pointer">
                    {archivo ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl">📄</span>
                        <span className="text-sm text-purple-400 font-medium">{archivo.name}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl">📎</span>
                        <p className="text-sm text-gray-400 mt-1">Click para adjuntar archivo</p>
                        <p className="text-xs text-gray-500">PDF, Word, Excel, PowerPoint, imágenes</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowModalTarea(false); setEntrega(''); setArchivo(null) }}
                className="flex-1 border border-purple-800 text-gray-400 py-3 rounded-xl text-sm font-medium hover:bg-purple-900/20"
              >
                Cancelar
              </button>
              <button
                onClick={handleEntregar}
                disabled={entregando || (!entrega.trim() && !archivo)}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {entregando ? 'Entregando...' : 'Entregar Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Quiz */}
      {quizSeleccionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="p-6 w-full max-w-lg my-8"
            style={{ background: '#1C1535', borderRadius: 16, border: '1px solid rgba(124,58,237,0.18)' }}
          >
            <h3 className="font-bold text-gray-100 text-lg mb-4">{quizSeleccionado.titulo}</h3>

            {resultado ? (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">
                  {parseFloat(resultado.calificacion) >= 6 ? '🎉' : '📚'}
                </div>
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {resultado.calificacion}/10
                </div>
                <p className="text-gray-400 mb-2">
                  {resultado.correctas} de {resultado.total} correctas
                </p>
                <div className="space-y-3 mt-6 text-left">
                  {resultado.resultados.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-sm ${
                        r.esCorrecta ? 'bg-green-900/20' : 'bg-red-900/20'
                      }`}
                    >
                      <p className="font-medium text-gray-100">{r.pregunta}</p>
                      <p className={`mt-1 ${r.esCorrecta ? 'text-green-400' : 'text-red-400'}`}>
                        Tu respuesta: {r.tuRespuesta} {r.esCorrecta ? '✅' : '❌'}
                      </p>
                      {!r.esCorrecta && (
                        <p className="text-green-400">Correcta: {r.respuestaCorrecta}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setQuizSeleccionado(null); setResultado(null) }}
                  className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-purple-700"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {quizSeleccionado.preguntas.map((pregunta, index) => (
                  <div key={index}>
                    <p className="font-medium text-gray-100 mb-3">
                      {index + 1}. {pregunta.texto}
                    </p>
                    <div className="space-y-2">
                      {pregunta.opciones.map((opcion, opIndex) => (
                        <button
                          key={opIndex}
                          onClick={() => {
                            const nuevas = [...respuestas]
                            nuevas[index] = opIndex
                            setRespuestas(nuevas)
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border-2 ${
                            respuestas[index] === opIndex
                              ? 'border-purple-500 bg-purple-100/10 text-purple-300'
                              : 'border-purple-900/30 text-gray-300 hover:border-purple-600'
                          }`}
                        >
                          {opcion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <button
                    onClick={() => setQuizSeleccionado(null)}
                    className="flex-1 border border-purple-800 text-gray-400 py-3 rounded-xl text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResponderQuiz}
                    disabled={respondiendo || respuestas.includes(null)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {respondiendo ? 'Enviando...' : 'Enviar respuestas'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default DetalleCurso
