import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cursoService, tareaService, quizService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const DetalleCurso = () => {
  const { id } = useParams()
  const [curso, setCurso] = useState(null)
  const [tareas, setTareas] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('tareas')
  const [showModalTarea, setShowModalTarea] = useState(false)
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null)
  const [entrega, setEntrega] = useState('')
  const [entregando, setEntregando] = useState(false)
  const [quizSeleccionado, setQuizSeleccionado] = useState(null)
  const [respuestas, setRespuestas] = useState([])
  const [resultado, setResultado] = useState(null)
  const [respondiendo, setRespondiendo] = useState(false)
  const [quizzesCompletados, setQuizzesCompletados] = useState(() => {
    const guardados = localStorage.getItem(`quizzes_completados_${id}`)
    return guardados ? JSON.parse(guardados) : {}
  })
  const [tareasEntregadas, setTareasEntregadas] = useState(() => {
    const guardadas = localStorage.getItem(`tareas_entregadas_${id}`)
    return guardadas ? JSON.parse(guardadas) : {}
  })
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    cargarDatos()
  }, [id])

  const cargarDatos = async () => {
    try {
      const [cursoRes, tareasRes, quizzesRes] = await Promise.all([
        cursoService.obtenerPorId(id),
        tareaService.obtenerPorCurso(id),
        quizService.obtenerPorCurso(id)
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
    if (!entrega.trim()) return
    setEntregando(true)
    try {
      await tareaService.entregar(tareaSeleccionada.id, { contenido: entrega })
      const nuevasEntregadas = { ...tareasEntregadas, [tareaSeleccionada.id]: true }
      setTareasEntregadas(nuevasEntregadas)
      localStorage.setItem(`tareas_entregadas_${id}`, JSON.stringify(nuevasEntregadas))
      setShowModalTarea(false)
      setEntrega('')
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
      const nuevosCompletados = {
        ...quizzesCompletados,
        [quizSeleccionado.id]: {
          calificacion: res.data.calificacion,
          correctas: res.data.correctas,
          total: res.data.total
        }
      }
      setQuizzesCompletados(nuevosCompletados)
      localStorage.setItem(`quizzes_completados_${id}`, JSON.stringify(nuevosCompletados))
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-purple-600">Cargando...</div>

  return (
    <div className="min-h-screen bg-grisSuave flex">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">EduSmart <span className="text-purple-600">AI+</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
            { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
            { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
            { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
            { icon: '🤖', label: 'Asistente IA', path: '/estudiante/asistente' },
            { icon: '📊', label: 'Mi Progreso', path: '/estudiante/progreso' },
            { icon: '💬', label: 'Mensajes', path: '/estudiante/mensajes' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-lavanda hover:text-purple-700 transition-all text-sm font-medium"
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
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/estudiante/cursos')} className="text-gray-400 hover:text-gray-600">←</button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{curso?.titulo}</h2>
              <p className="text-gray-500 text-sm">Prof. {curso?.profesor?.nombre}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/estudiante/asistente')}
            className="bg-lavanda text-purple-700 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80"
          >
            🤖 Pedir ayuda a IA
          </button>
        </div>

        <div className="flex-1 p-8">

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['tareas', 'quizzes'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === t ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-lavanda'
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
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No hay tareas aún</p>
                </div>
              ) : (
                tareas.map((tarea) => {
                  const entregada = tareasEntregadas[tarea.id]
                  return (
                    <div key={tarea.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{tarea.titulo}</h3>
                        <p className="text-gray-500 text-sm mt-1">{tarea.descripcion}</p>
                        <p className="text-xs text-gray-400 mt-2">📅 Fecha límite: {new Date(tarea.fechaLimite).toLocaleDateString()}</p>
                        {entregada && <p className="text-green-600 text-sm mt-1 font-medium">✅ Entregada</p>}
                      </div>
                      {entregada ? (
                        <div className="bg-verdeMenta text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
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
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
                  <div className="text-4xl mb-2">❓</div>
                  <p>No hay quizzes aún</p>
                </div>
              ) : (
                quizzes.map((quiz) => {
                  const completado = quizzesCompletados[quiz.id]
                  return (
                    <div key={quiz.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{quiz.titulo}</h3>
                        <p className="text-gray-400 text-sm mt-1">{quiz._count?.preguntas || 0} preguntas</p>
                        {completado && (
                          <p className="text-green-600 text-sm mt-1 font-medium">
                            ✅ Completado — {completado.calificacion}/10
                          </p>
                        )}
                      </div>
                      {completado ? (
                        <div className="bg-verdeMenta text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
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
      </div>

      {/* Modal Entregar Tarea */}
      {showModalTarea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-1">{tareaSeleccionada?.titulo}</h3>
            <p className="text-gray-500 text-sm mb-4">{tareaSeleccionada?.descripcion}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu entrega</label>
              <textarea
                value={entrega}
                onChange={(e) => setEntrega(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                rows={6}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowModalTarea(false); setEntrega('') }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-grisSuave"
              >
                Cancelar
              </button>
              <button
                onClick={handleEntregar}
                disabled={entregando}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {entregando ? 'Entregando...' : 'Entregar Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quiz */}
      {quizSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-8">
            <h3 className="font-bold text-gray-800 text-lg mb-4">{quizSeleccionado.titulo}</h3>

            {resultado ? (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">{parseFloat(resultado.calificacion) >= 6 ? '🎉' : '📚'}</div>
                <div className="text-4xl font-bold text-purple-600 mb-2">{resultado.calificacion}/10</div>
                <p className="text-gray-600 mb-2">{resultado.correctas} de {resultado.total} correctas</p>
                <div className="space-y-3 mt-6 text-left">
                  {resultado.resultados.map((r, i) => (
                    <div key={i} className={`p-3 rounded-xl text-sm ${r.esCorrecta ? 'bg-verdeMenta' : 'bg-red-50'}`}>
                      <p className="font-medium text-gray-800">{r.pregunta}</p>
                      <p className={`mt-1 ${r.esCorrecta ? 'text-green-700' : 'text-red-600'}`}>
                        Tu respuesta: {r.tuRespuesta} {r.esCorrecta ? '✅' : '❌'}
                      </p>
                      {!r.esCorrecta && <p className="text-green-700">Correcta: {r.respuestaCorrecta}</p>}
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
                    <p className="font-medium text-gray-800 mb-3">{index + 1}. {pregunta.texto}</p>
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
                              ? 'border-purple-500 bg-lavanda text-purple-700'
                              : 'border-gray-100 bg-grisSuave text-gray-700 hover:border-purple-300'
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
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium"
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
    </div>
  )
}

export default DetalleCurso