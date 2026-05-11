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
  const [showModalQuiz, setShowModalQuiz] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [tareaExpandida, setTareaExpandida] = useState(null)
  const [quizExpandido, setQuizExpandido] = useState(null)
  const [formTarea, setFormTarea] = useState({ titulo: '', descripcion: '', fechaLimite: '' })
  const [formQuiz, setFormQuiz] = useState({
    titulo: '',
    preguntas: [{ texto: '', opciones: ['', '', '', ''], correcta: 0 }]
  })
  const { logout } = useAuth()
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

  const handleCrearTarea = async () => {
    if (!formTarea.titulo || !formTarea.descripcion || !formTarea.fechaLimite) return
    setGuardando(true)
    try {
      await tareaService.crear({ ...formTarea, cursoId: parseInt(id) })
      setShowModalTarea(false)
      setFormTarea({ titulo: '', descripcion: '', fechaLimite: '' })
      cargarDatos()
    } catch (error) {
      console.error(error)
    } finally {
      setGuardando(false)
    }
  }

  const handleCrearQuiz = async () => {
    if (!formQuiz.titulo || formQuiz.preguntas.some(p => !p.texto)) return
    setGuardando(true)
    try {
      await quizService.crear({ ...formQuiz, cursoId: parseInt(id) })
      setShowModalQuiz(false)
      setFormQuiz({ titulo: '', preguntas: [{ texto: '', opciones: ['', '', '', ''], correcta: 0 }] })
      cargarDatos()
    } catch (error) {
      console.error(error)
    } finally {
      setGuardando(false)
    }
  }

  const handleCalificar = async (entregaId, calificacion) => {
    try {
      await tareaService.calificar(entregaId, { calificacion: parseFloat(calificacion) })
      cargarDatos()
    } catch (error) {
      console.error(error)
    }
  }

  const verEntregas = async (tareaId) => {
    if (tareaExpandida === tareaId) {
      setTareaExpandida(null)
      return
    }
    try {
      const res = await tareaService.obtenerPorId(tareaId)
      setTareas(prev => prev.map(t => t.id === tareaId ? { ...t, entregas: res.data.entregas } : t))
      setTareaExpandida(tareaId)
    } catch (error) {
      console.error(error)
    }
  }

  const verResultadosQuiz = async (quizId) => {
    if (quizExpandido === quizId) {
      setQuizExpandido(null)
      return
    }
    try {
      const res = await quizService.obtenerResultados(quizId)
      setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, resultados: res.data } : q))
      setQuizExpandido(quizId)
    } catch (error) {
      console.error(error)
    }
  }

  const agregarPregunta = () => {
    setFormQuiz({
      ...formQuiz,
      preguntas: [...formQuiz.preguntas, { texto: '', opciones: ['', '', '', ''], correcta: 0 }]
    })
  }

  const actualizarPregunta = (index, field, value) => {
    const nuevasPreguntas = [...formQuiz.preguntas]
    if (field === 'opcion') {
      nuevasPreguntas[index].opciones[value.index] = value.texto
    } else {
      nuevasPreguntas[index][field] = value
    }
    setFormQuiz({ ...formQuiz, preguntas: nuevasPreguntas })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-purple-600">
      Cargando...
    </div>
  )

  return (
    <div className="min-h-screen bg-grisSuave flex">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">
            EduSmart <span className="text-purple-600">AI+</span>
          </h1>
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
            <button
              onClick={() => navigate('/profesor/cursos')}
              className="text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{curso?.titulo}</h2>
              <p className="text-gray-500 text-sm">
                {curso?._count?.inscripciones || 0} estudiantes inscritos
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModalTarea(true)}
              className="bg-azulPastel text-blue-700 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-80"
            >
              + Tarea
            </button>
            <button
              onClick={() => setShowModalQuiz(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-700"
            >
              + Quiz
            </button>
          </div>
        </div>

        <div className="flex-1 p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['tareas', 'quizzes'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
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
                tareas.map((tarea) => (
                  <div key={tarea.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{tarea.titulo}</h3>
                        <p className="text-gray-500 text-sm mt-1">{tarea.descripcion}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                          <span>📅 {new Date(tarea.fechaLimite).toLocaleDateString()}</span>
                          <span>📬 {tarea._count?.entregas || 0} entregas</span>
                        </div>
                      </div>
                      <button
                        onClick={() => verEntregas(tarea.id)}
                        className="bg-azulPastel text-blue-700 px-4 py-2 rounded-xl text-xs font-medium hover:opacity-80"
                      >
                        {tareaExpandida === tarea.id ? 'Ocultar entregas' : 'Ver entregas'}
                      </button>
                    </div>

                    {tareaExpandida === tarea.id && (
                      <div className="border-t pt-3 mt-3">
                        {!tarea.entregas || tarea.entregas.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">
                            No hay entregas aún
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {tarea.entregas.map((entrega) => (
                              <div key={entrega.id} className="bg-grisSuave rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-lavanda rounded-full flex items-center justify-center text-xs text-purple-600 font-bold">
                                      {entrega.estudiante?.nombre?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">
                                      {entrega.estudiante?.nombre}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {entrega.calificacion ? (
                                      <span className="bg-verdeMenta text-green-700 px-3 py-1 rounded-lg text-xs font-medium">
                                        {entrega.calificacion}/10
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          min="0"
                                          max="10"
                                          placeholder="Nota"
                                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleCalificar(entrega.id, e.target.value)
                                            }
                                          }}
                                        />
                                        <span className="text-xs text-gray-400">Enter para calificar</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-sm text-gray-600">{entrega.contenido}</p>
                                  {entrega.archivoUrl && (
                                    <a
                                      href={entrega.archivoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 mt-2 text-purple-600 text-sm font-medium hover:underline"
                                    >
                                      <span>📎</span>
                                      <span>{entrega.archivoNombre || 'Ver archivo adjunto'}</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
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
                quizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{quiz.titulo}</h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {quiz._count?.preguntas || 0} preguntas
                        </p>
                      </div>
                      <button
                        onClick={() => verResultadosQuiz(quiz.id)}
                        className="bg-lavanda text-purple-700 px-4 py-2 rounded-xl text-xs font-medium hover:opacity-80"
                      >
                        {quizExpandido === quiz.id ? 'Ocultar resultados' : 'Ver resultados'}
                      </button>
                    </div>

                    {quizExpandido === quiz.id && (
                      <div className="border-t pt-3 mt-3">
                        {!quiz.resultados || quiz.resultados.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-4">
                            Ningún estudiante ha respondido aún
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {quiz.resultados.map((resultado) => (
                              <div key={resultado.id} className="bg-grisSuave rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-lavanda rounded-full flex items-center justify-center text-xs text-purple-600 font-bold">
                                      {resultado.estudiante?.nombre?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">
                                      {resultado.estudiante?.nombre}
                                    </span>
                                  </div>
                                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                    resultado.calificacion >= 6
                                      ? 'bg-verdeMenta text-green-700'
                                      : 'bg-red-50 text-red-600'
                                  }`}>
                                    {resultado.calificacion.toFixed(1)}/10 — {resultado.correctas}/{resultado.total} correctas
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {resultado.respuestas.map((r, i) => (
                                    <div
                                      key={i}
                                      className={`p-2 rounded-lg text-xs ${r.esCorrecta ? 'bg-verdeMenta' : 'bg-red-50'}`}
                                    >
                                      <p className="font-medium text-gray-700">{r.pregunta}</p>
                                      <p className={r.esCorrecta ? 'text-green-700' : 'text-red-600'}>
                                        Respondió: {r.tuRespuesta} {r.esCorrecta ? '✅' : '❌'}
                                      </p>
                                      {!r.esCorrecta && (
                                        <p className="text-green-700">Correcta: {r.respuestaCorrecta}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Crear Tarea */}
      {showModalTarea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Crear Tarea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formTarea.titulo}
                  onChange={(e) => setFormTarea({ ...formTarea, titulo: e.target.value })}
                  placeholder="Ej: Ensayo sobre la Revolución"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formTarea.descripcion}
                  onChange={(e) => setFormTarea({ ...formTarea, descripcion: e.target.value })}
                  placeholder="Describe la tarea..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
                <input
                  type="date"
                  value={formTarea.fechaLimite}
                  onChange={(e) => setFormTarea({ ...formTarea, fechaLimite: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModalTarea(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-grisSuave"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearTarea}
                disabled={guardando}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {guardando ? 'Creando...' : 'Crear Tarea'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Quiz */}
      {showModalQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-8">
            <h3 className="font-bold text-gray-800 text-lg mb-4">Crear Quiz</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título del Quiz</label>
                <input
                  type="text"
                  value={formQuiz.titulo}
                  onChange={(e) => setFormQuiz({ ...formQuiz, titulo: e.target.value })}
                  placeholder="Ej: Quiz de Programación"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              {formQuiz.preguntas.map((pregunta, index) => (
                <div key={index} className="bg-grisSuave rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Pregunta {index + 1}</p>
                  <input
                    type="text"
                    value={pregunta.texto}
                    onChange={(e) => actualizarPregunta(index, 'texto', e.target.value)}
                    placeholder="Escribe la pregunta..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 mb-3 bg-white"
                  />
                  <div className="space-y-2">
                    {pregunta.opciones.map((opcion, opIndex) => (
                      <div key={opIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correcta-${index}`}
                          checked={pregunta.correcta === opIndex}
                          onChange={() => actualizarPregunta(index, 'correcta', opIndex)}
                          className="accent-purple-600"
                        />
                        <input
                          type="text"
                          value={opcion}
                          onChange={(e) => actualizarPregunta(index, 'opcion', { index: opIndex, texto: e.target.value })}
                          placeholder={`Opción ${opIndex + 1}`}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Selecciona el radio de la respuesta correcta</p>
                </div>
              ))}
              <button
                onClick={agregarPregunta}
                className="w-full border-2 border-dashed border-gray-200 text-gray-500 py-3 rounded-xl text-sm hover:border-purple-400 hover:text-purple-600 transition-all"
              >
                + Agregar pregunta
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModalQuiz(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-grisSuave"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearQuiz}
                disabled={guardando}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {guardando ? 'Creando...' : 'Crear Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DetalleCurso