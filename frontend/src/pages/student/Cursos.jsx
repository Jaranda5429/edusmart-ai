import { useState, useEffect} from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProfesor } from '../../context/ProfesorContext'
import { academicService, foroService, quizService } from '../../services/api'
import Layout from '../../components/Layout'
import { subirArchivo } from '../../services/supabase'
import { useSearchParams } from 'react-router-dom'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
]

const COLS = [
  { bg: 'bg-[#EDE7FF]', border: 'border-purple-200', text: 'text-purple-700' },
  { bg: 'bg-[#D6E8FF]', border: 'border-blue-200',   text: 'text-blue-700'   },
  { bg: 'bg-[#DDF7E9]', border: 'border-green-200',  text: 'text-green-700'  },
  { bg: 'bg-[#FFF4CC]', border: 'border-yellow-200', text: 'text-yellow-700' },
]

const fmt = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Estado de ventana de tiempo: 'antes' | 'abierto' | 'cerrado'
const estadoVentana = (fechaInicio, fechaLimite) => {
  const ahora = new Date()
  if (fechaInicio && ahora < new Date(fechaInicio)) return 'antes'
  if (fechaLimite && ahora > new Date(fechaLimite)) return 'cerrado'
  return 'abierto'
}

export default function StudentCursos() {
  const { usuario } = useAuth()
  const { getMisInscripciones, cargarInscripciones } = useProfesor()
  const miId = usuario?.id

  const [vista, setVista] = useState('inscripciones')
  const [inscSel, setInscSel] = useState(null)
  const [actividadSel, setActividadSel] = useState(null)
  const [actividades, setActividades] = useState([])
  const [loadingActs, setLoadingActs] = useState(false)
  const [tab, setTab] = useState('contenido')
  const [textoEntrega, setTextoEntrega] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [entregaEnviada, setEntregaEnviada] = useState(false)
  const [respForo, setRespForo] = useState('')
  const [foroEnviado, setForoEnviado] = useState(false)
  const [foros, setForos] = useState([])
  const [foroSel, setForoSel] = useState(null)
  const [pubTexto, setPubTexto] = useState('')
  const [editPubId, setEditPubId] = useState(null)
  const [editPubTexto, setEditPubTexto] = useState('')
  const [comentTemp, setComentTemp] = useState({})
  const [quizzes, setQuizzes] = useState([])
  const [quizSel, setQuizSel] = useState(null)
  const [respuestasQuiz, setRespuestasQuiz] = useState({})
  const [resultadoQuiz, setResultadoQuiz] = useState(null)
  const [enviandoQuiz, setEnviandoQuiz] = useState(false)

  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.toLowerCase() || ''
  const todasInscripciones = getMisInscripciones ? getMisInscripciones() : []
  const misInscripciones = searchQuery
  ? todasInscripciones.filter(i =>
      i.materiaName?.toLowerCase().includes(searchQuery) ||
      i.gradoName?.toLowerCase().includes(searchQuery)
    )
  : todasInscripciones

  const seleccionarInscripcion = async (insc) => {
    setInscSel(insc)
    setLoadingActs(true)
    try {
      const res = await academicService.getActividades(insc.materiaId)
      setActividades(res.data || [])
      cargarForos(insc.materiaId)
      cargarQuizzes(insc.materiaId)
    } catch (err) {
      console.error('Error cargando actividades:', err)
      setActividades([])
    } finally {
      setLoadingActs(false)
    }
    setVista('actividades')
  }

  const cargarForos = async (materiaId) => {
    try {
      const res = await foroService.getForosMateria(materiaId)
      setForos(res.data || [])
    } catch { console.error('Error cargando foros') }
  }

  const cargarQuizzes = async (materiaId) => {
    try {
      const res = await quizService.getQuizzesMateria(materiaId)
      setQuizzes(res.data || [])
    } catch { console.error('Error cargando quizzes') }
  }

  const quizActual = quizSel ? (quizzes.find(q => q.id === quizSel.id) || quizSel) : null
  const miIntentoQuiz = quizActual?.intentos?.find(it => it.estudianteId === miId)
  const estadoQuiz = quizActual ? estadoVentana(quizActual.fechaInicio, quizActual.fechaLimite) : 'abierto'

  const abrirQuiz = (q) => {
    setQuizSel(q)
    setRespuestasQuiz({})
    setResultadoQuiz(null)
    setVista('quiz')
  }

  const enviarQuiz = async () => {
    if (!quizActual) return
    const respuestas = quizActual.preguntas.map((p, i) => respuestasQuiz[i])
    if (respuestas.some(r => r === undefined)) { alert('Responde todas las preguntas'); return }
    setEnviandoQuiz(true)
    try {
      const res = await quizService.responderQuiz(quizActual.id, respuestas)
      setResultadoQuiz(res.data)
      await cargarQuizzes(inscSel.materiaId)
    } catch (err) {
      alert(err.response?.data?.message || 'Error enviando el quiz')
    }
    setEnviandoQuiz(false)
  }

  const foroActual = foroSel ? (foros.find(f => f.id === foroSel.id) || foroSel) : null
  const estadoForo = foroActual ? estadoVentana(foroActual.fechaInicio, foroActual.fechaLimite) : 'abierto'

  const abrirForo = async (f) => {
    setForoSel(f)
    if (inscSel) await cargarForos(inscSel.materiaId)
    setVista('foro')
  }

  const publicarEnForo = async () => {
    if (!pubTexto.trim()) return
    try {
      await foroService.publicar(foroSel.id, pubTexto.trim())
      setPubTexto('')
      await cargarForos(inscSel.materiaId)
    } catch (err) { alert(err.response?.data?.message || 'Error publicando') }
  }

  const guardarEditPub = async (pubId) => {
    if (!editPubTexto.trim()) return
    try {
      await foroService.editarPublicacion(pubId, editPubTexto.trim())
      setEditPubId(null); setEditPubTexto('')
      await cargarForos(inscSel.materiaId)
    } catch (err) { alert(err.response?.data?.message || 'Error editando') }
  }

  const enviarComentario = async (pubId) => {
    const texto = (comentTemp[pubId] || '').trim()
    if (!texto) return
    try {
      await foroService.comentar(pubId, texto)
      setComentTemp(p => ({ ...p, [pubId]: '' }))
      await cargarForos(inscSel.materiaId)
    } catch { alert('Error comentando') }
  }

  const actActual = actividadSel
    ? actividades.find(a => a.id === actividadSel.id) || actividadSel
    : null
  const miEntrega = actActual?.entregas?.find(e => e.estudianteId === miId)
  const vencida = actActual ? new Date(actActual.fechaLimite) < new Date() : false
  const noDisponible = actActual?.fechaInicio ? new Date(actActual.fechaInicio) > new Date() : false
  const diasDisponible = actActual?.fechaInicio
    ? Math.ceil((new Date(actActual.fechaInicio) - new Date()) / (1000 * 60 * 60 * 24))
    : 0
  const miRespForo = actActual?.foro?.respuestas?.find(r => r.estudianteId === miId)

  const volver = () => {
    if (vista === 'actividad') {
      setActividadSel(null)
      setTab('contenido')
      setEntregaEnviada(false)
      setTextoEntrega('')
      setArchivo(null)
      setForoEnviado(false)
      setRespForo('')
      setVista('actividades')
    } else if (vista === 'foro') {
      setForoSel(null)
      setVista('actividades')
    } else if (vista === 'quiz') {
      setQuizSel(null)
      setResultadoQuiz(null)
      setRespuestasQuiz({})
      setVista('actividades')
    } else if (vista === 'actividades') {
      setInscSel(null)
      setActividades([])
      setForos([])
      setQuizzes([])
      setVista('inscripciones')
    }
  }

  const estadoBadge = (act) => {
    const ent = act.entregas?.find(e => e.estudianteId === miId)
    const noDisp = act.fechaInicio && new Date(act.fechaInicio) > new Date()
    if (noDisp) return { txt: '🔒 No disponible', cls: 'bg-blue-50 text-blue-600 border-blue-200' }
    if (new Date(act.fechaLimite) < new Date() && (!ent || !ent.entregado)) return { txt: 'Vencida', cls: 'bg-red-50 text-red-600 border-red-200' }
    if (ent?.entregado && ent?.calificacion != null) return { txt: ent.calificacion + '/10', cls: 'bg-green-50 text-green-700 border-green-200' }
    if (ent?.entregado) return { txt: 'Entregada', cls: 'bg-purple-50 text-purple-700 border-purple-200' }
    return { txt: 'Pendiente', cls: 'bg-orange-50 text-orange-600 border-orange-200' }
  }

  // Badge de estado para foro/quiz segun ventana de tiempo
  const badgeVentana = (estado, intento) => {
    if (intento != null) return { txt: intento + '/10', cls: 'bg-green-50 text-green-700 border-green-200' }
    if (estado === 'antes') return { txt: '🔒 No disponible', cls: 'bg-blue-50 text-blue-600 border-blue-200' }
    if (estado === 'cerrado') return { txt: 'Cerrado', cls: 'bg-red-50 text-red-600 border-red-200' }
    return { txt: 'Abierto', cls: 'bg-orange-50 text-orange-600 border-orange-200' }
  }

  const enviarEntrega = async () => {
    if (!textoEntrega.trim() && !archivo) return
    try {
      let archivoUrl = null
      let archivoNombre = null
      if (archivo) {
        const resultado = await subirArchivo(archivo, usuario?.id, actividadSel.id)
        archivoUrl = resultado.url
        archivoNombre = resultado.nombre
      }
      await academicService.entregarActividad(actividadSel.id, { texto: textoEntrega, archivoUrl, archivoNombre })
      const res = await academicService.getActividades(inscSel.materiaId)
      setActividades(res.data || [])
      await cargarInscripciones()
      setEntregaEnviada(true)
    } catch (err) {
      console.error('Error entregando:', err)
      alert('Error al enviar la entrega')
    }
  }

  const enviarForo = async () => {
    if (!respForo.trim()) return
    try {
      await academicService.responderForo(actividadSel.id, respForo)
      const res = await academicService.getActividades(inscSel.materiaId)
      setActividades(res.data || [])
      await cargarInscripciones()
      setForoEnviado(true)
    } catch (err) {
      console.error('Error foro:', err)
      alert('Error al publicar en el foro')
    }
  }

  const inscId = searchParams.get('insc')

  useEffect(() => {
  if (inscId && vista === 'inscripciones') {
    const insc = todasInscripciones.find(i => String(i.id) === String(inscId))
    if (insc) seleccionarInscripcion(insc)
  }
  }, [inscId, todasInscripciones])

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition-all'

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-5xl mx-auto px-5 py-6">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {vista !== 'inscripciones' && (
              <button onClick={volver} className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all shadow-sm">←</button>
            )}
            <div>
              <h2 className="text-xl font-black text-gray-900">
                <span>{vista === 'inscripciones' ? 'Mis Cursos' : vista === 'actividades' ? (inscSel?.materiaName || '') : vista === 'foro' ? (foroActual?.titulo || 'Foro') : vista === 'quiz' ? (quizActual?.titulo || 'Quiz') : (actActual?.titulo || '')}</span>
              </h2>
              <p className="text-gray-400 text-xs">
                <span>
                  {vista === 'inscripciones'
                    ? (misInscripciones.length + ' materia' + (misInscripciones.length !== 1 ? 's' : '') + ' inscrita' + (misInscripciones.length !== 1 ? 's' : ''))
                    : vista === 'actividades'
                    ? ((inscSel?.gradoName || '') + ' · ' + (inscSel?.periodoName || ''))
                    : ('Limite: ' + fmt(actActual?.fechaLimite))}
                </span>
              </p>
            </div>
          </div>
          {inscSel && vista !== 'inscripciones' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-semibold">{inscSel.periodoName}</span>
              <span className="text-gray-300">›</span>
              <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-semibold">{inscSel.gradoName}</span>
              <span className="text-gray-300">›</span>
              <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg font-semibold">{inscSel.materiaName}</span>
            </div>
          )}
        </div>

        {/* INSCRIPCIONES */}
        {vista === 'inscripciones' && (
          misInscripciones.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
              <span className="text-6xl">🔑</span>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Sin materias inscritas</h3>
              <p className="text-gray-400 text-sm">Ve al Inicio e ingresa el codigo que te dio tu profesor</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {misInscripciones.map((insc, i) => {
                const c = COLS[i % COLS.length]
                const acts = insc.materia?.actividades || []
                const pendientes = acts.filter(act => {
                  const ent = act.entregas?.find(e => e.estudianteId === miId)
                  return (!ent || !ent.entregado) && new Date(act.fechaLimite) >= new Date()
                }).length
                const califs = acts.flatMap(act => {
                  const ent = act.entregas?.find(e => e.estudianteId === miId)
                  return ent?.calificacion != null ? [ent.calificacion] : []
                })
                const prom = califs.length > 0 ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1) : null
                return (
                  <button key={i} onClick={() => seleccionarInscripcion(insc)}
                    className={c.bg + ' border-2 ' + c.border + ' rounded-2xl p-7 text-left hover:scale-[1.02] hover:shadow-lg transition-all shadow-sm group'}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-5xl">📖</span>
                      {prom && (
                        <div className="text-right">
                          <p className={'font-bold text-2xl ' + c.text}>{prom}</p>
                          <p className="text-gray-400 text-xs">promedio</p>
                        </div>
                      )}
                    </div>
                    <h3 className={'text-xl font-bold ' + c.text + ' mb-1'}>{insc.materiaName}</h3>
                    <p className="text-gray-500 text-sm">{insc.gradoName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{insc.periodoName}</p>
                    {pendientes > 0 && (
                      <span className="mt-2 inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs px-2.5 py-1 rounded-full border border-orange-200 font-semibold">
                        {'⚠️ ' + pendientes + ' pendiente' + (pendientes > 1 ? 's' : '')}
                      </span>
                    )}
                    <div className={'mt-3 flex items-center gap-2 ' + c.text + ' text-sm font-semibold'}>
                      <span>{acts.length + ' actividades'}</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {/* ACTIVIDADES */}
        {vista === 'actividades' && (
          loadingActs ? (
            <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Cargando actividades...</p>
            </div>
          ) : actividades.length === 0 && foros.length === 0 && quizzes.length === 0 ? (
            <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
              <span className="text-5xl">📭</span>
              <p className="text-gray-500 mt-3 font-semibold">Sin actividades aun</p>
              <p className="text-gray-400 text-sm mt-1">Tu profesor aun no ha creado actividades en esta materia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actividades.map(act => {
                const badge = estadoBadge(act)
                const dias = Math.ceil((new Date(act.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <button key={act.id} onClick={() => { setActividadSel(act); setTab('contenido'); setVista('actividad') }}
                    className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all text-left group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📝</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-800">{act.titulo}</h4>
                          {act.foro && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">💬 Foro</span>}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-400">
                          {act.fechaInicio && new Date(act.fechaInicio) > new Date()
                            ? <span className="text-blue-500 font-semibold">{'🔒 Disponible: ' + fmt(act.fechaInicio)}</span>
                            : <span>{'⏰ Límite: ' + fmt(act.fechaLimite)}</span>
                          }
                          {dias > 0 && dias <= 5 && !act.fechaInicio && <span className="text-orange-500 font-semibold">{'Faltan ' + dias + ' dias'}</span>}
                        </div>
                      </div>
                      <span className={'text-xs px-3 py-1.5 rounded-full font-semibold border flex-shrink-0 ' + badge.cls}>{badge.txt}</span>
                      <span className="text-gray-300 group-hover:text-purple-400 text-lg">→</span>
                    </div>
                  </button>
                )
              })}

              {foros.length > 0 && (
                <div className="pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Foros de discusión</p>
                  {foros.map(f => {
                    const est = estadoVentana(f.fechaInicio, f.fechaLimite)
                    const b = badgeVentana(est, null)
                    return (
                      <button key={f.id} onClick={() => abrirForo(f)}
                        className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💬</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800">{f.titulo}</h4>
                            {f.descripcion && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{f.descripcion}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">
                              {est === 'antes' ? ('🔒 Abre: ' + fmt(f.fechaInicio)) : est === 'cerrado' ? ('Cerró: ' + fmt(f.fechaLimite)) : ('⏰ Cierra: ' + fmt(f.fechaLimite))}
                            </p>
                          </div>
                          <span className={'text-xs px-3 py-1.5 rounded-full font-semibold border flex-shrink-0 ' + b.cls}>{b.txt}</span>
                          <span className="text-gray-300 group-hover:text-purple-400 text-lg">→</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {quizzes.length > 0 && (
                <div className="pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quizzes</p>
                  {quizzes.map(q => {
                    const intento = q.intentos?.find(it => it.estudianteId === miId)
                    const est = estadoVentana(q.fechaInicio, q.fechaLimite)
                    const b = badgeVentana(est, intento ? intento.nota : null)
                    return (
                      <button key={q.id} onClick={() => abrirQuiz(q)}
                        className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">❓</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800">{q.titulo}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {(q.preguntas?.length || 0) + ' preguntas · '}
                              {est === 'antes' ? ('🔒 Abre: ' + fmt(q.fechaInicio)) : est === 'cerrado' ? ('Cerró: ' + fmt(q.fechaLimite)) : ('⏰ Cierra: ' + fmt(q.fechaLimite))}
                            </p>
                          </div>
                          <span className={'text-xs px-3 py-1.5 rounded-full font-semibold border flex-shrink-0 ' + b.cls}>{b.txt}</span>
                          <span className="text-gray-300 group-hover:text-purple-400 text-lg">→</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        )}

        {/* DETALLE ACTIVIDAD */}
        {vista === 'actividad' && actActual && (
          <div className="space-y-5 max-w-3xl">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 text-lg mb-2">{actActual.titulo}</h3>
              {actActual.descripcion && <p className="text-gray-500 text-sm mb-3">{actActual.descripcion}</p>}
              <div className="flex gap-2 flex-wrap">
                {actActual.fechaInicio && (
                  <span className={'text-xs px-3 py-1.5 rounded-lg border ' + (noDisponible ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-purple-50 text-purple-600 border-purple-100')}>
                    {'📅 Inicio: ' + fmt(actActual.fechaInicio)}
                  </span>
                )}
                <span className={'text-xs px-3 py-1.5 rounded-lg border ' + (vencida && !miEntrega?.entregado ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-100')}>
                  {'⏰ Límite: ' + fmt(actActual.fechaLimite)}
                </span>
                {miEntrega?.calificacion != null && (
                  <span className={'text-xs px-3 py-1.5 rounded-lg border font-bold ' + (miEntrega.calificacion >= 7 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200')}>
                    {'⭐ Nota: ' + miEntrega.calificacion + '/10'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[...(actActual.soloForo ? [] : ['contenido', 'entregar']), ...(actActual.foro ? ['foro'] : [])].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={'px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ' + (tab === t ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700')}>
                  {t === 'contenido' && '📋 Contenido'}
                  {t === 'entregar' && (miEntrega?.entregado ? '✅ Mi entrega' : '📤 Entregar')}
                  {t === 'foro' && '💬 Foro'}
                </button>
              ))}
            </div>

            {tab === 'contenido' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Material</h3></div>
                {!actActual.contenidos?.length ? (
                  <div className="p-10 text-center text-gray-400">Sin contenido subido aun</div>
                ) : (
                  <div className="p-5 space-y-3">
                    {actActual.contenidos.map((c, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-gray-100">
                        <span className="text-2xl flex-shrink-0">{c.icono || c.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                          {c.texto && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{c.texto}</p>}
                          {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-purple-600 text-sm hover:underline mt-1 block break-all">{c.nombre || c.url}</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'entregar' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                {miEntrega?.entregado ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-xl p-5 border border-green-200 text-center">
                      <p className="text-3xl font-black text-green-600">✅</p>
                      <p className="text-green-700 font-bold mt-1">Tarea entregada</p>
                    </div>
                    {miEntrega.calificacion != null ? (
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200 text-center">
                        <p className="text-gray-500 text-sm mb-1">Tu calificacion</p>
                        <p className={'text-6xl font-black ' + (miEntrega.calificacion >= 7 ? 'text-green-600' : 'text-red-500')}>{miEntrega.calificacion}</p>
                        <p className="text-gray-400 text-sm">de 10</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center">
                        <p className="text-gray-500">⏳ Tu profesor aun no ha calificado</p>
                      </div>
                    )}
                    {miEntrega.texto && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Tu respuesta:</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{miEntrega.texto}</p>
                      </div>
                    )}
                    {miEntrega.archivoUrl && (
                      <a href={miEntrega.archivoUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 bg-purple-50 rounded-xl p-4 border border-purple-200 hover:bg-purple-100 transition-colors">
                        <span className="text-2xl">📎</span>
                        <div>
                          <p className="text-sm font-semibold text-purple-700">{miEntrega.archivoNombre || 'Archivo adjunto'}</p>
                          <p className="text-xs text-purple-500">Clic para descargar</p>
                        </div>
                      </a>
                    )}
                  </div>
                ) : noDisponible ? (
                  <div className="bg-blue-50 rounded-xl p-12 border border-blue-200 text-center">
                    <span className="text-5xl">🔒</span>
                    <p className="text-blue-700 font-bold mt-3 text-lg">Aun no disponible</p>
                    <p className="text-blue-500 text-sm mt-1">
                      {diasDisponible > 0
                        ? 'Disponible en ' + diasDisponible + ' dia' + (diasDisponible !== 1 ? 's' : '')
                        : 'Disponible hoy mas tarde'}
                    </p>
                    <p className="text-blue-400 text-xs mt-2">{fmt(actActual.fechaInicio)}</p>
                  </div>
                ) : vencida ? (
                  <div className="bg-red-50 rounded-xl p-12 border border-red-200 text-center">
                    <span className="text-5xl">❌</span>
                    <p className="text-red-700 font-bold mt-3 text-lg">Actividad vencida</p>
                  </div>
                ) : entregaEnviada ? (
                  <div className="bg-green-50 rounded-xl p-12 border border-green-200 text-center">
                    <span className="text-5xl">🎉</span>
                    <p className="text-green-700 font-bold mt-3 text-lg">Entrega enviada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800">📤 Entregar actividad</h3>
                    <textarea value={textoEntrega} onChange={e => setTextoEntrega(e.target.value)} placeholder="Escribe tu respuesta aqui..." rows={5} className={inp} />
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-purple-400 transition-colors" onClick={() => document.getElementById('fileEnt').click()}>
                      <input id="fileEnt" type="file" className="hidden" onChange={e => setArchivo(e.target.files[0])} />
                      {archivo ? <p className="text-purple-600 font-semibold text-sm">{'✅ ' + archivo.name}</p> : <p className="text-gray-500 text-sm">📎 Adjuntar archivo (opcional)</p>}
                    </div>
                    <button onClick={enviarEntrega} disabled={!textoEntrega.trim() && !archivo}
                      className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-40">
                      📤 Enviar entrega
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'foro' && actActual.foro && (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h3 className="font-bold text-purple-800">{'💬 ' + actActual.foro.tema}</h3>
                  {actActual.foro.fechaLimite && <p className="text-purple-500 text-xs mt-0.5">{'⏰ ' + fmt(actActual.foro.fechaLimite)}</p>}
                </div>

                {(miRespForo?.respuesta || foroEnviado) ? (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="font-semibold text-green-700 text-sm mb-1">✅ Tu respuesta:</p>
                    <p className="text-gray-700 text-sm">{miRespForo?.respuesta || respForo}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea value={respForo} onChange={e => setRespForo(e.target.value)} placeholder="Escribe tu participacion..." rows={4} className={inp} />
                    <button onClick={enviarForo} disabled={!respForo.trim()}
                      className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-40">
                      💬 Publicar respuesta
                    </button>
                  </div>
                )}

                {(() => {
                  const otras = (actActual.foro.respuestas || []).filter(r => r.respuesta && r.estudianteId !== miId)
                  if (otras.length === 0) return null
                  return (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Participaciones ({otras.length})</p>
                      {otras.map((r, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold">
                              {r.estudiante?.nombre?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-sm text-gray-800">{r.estudiante?.nombre || 'Estudiante'}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{r.respuesta}</p>
                        </div>
                      ))}
                    </div>
                  )
               })()}
              </div>
            )}
          </div>
        )}

        {/* DETALLE FORO INDEPENDIENTE */}
        {vista === 'foro' && foroActual && (() => {
          const miPub = (foroActual.publicaciones || []).find(p => p.estudianteId === miId)
          const otras = (foroActual.publicaciones || []).filter(p => p.estudianteId !== miId)
          return (
            <div className="space-y-5 max-w-3xl">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💬</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{foroActual.titulo}</h3>
                    {foroActual.descripcion && <p className="text-gray-500 text-sm">{foroActual.descripcion}</p>}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {foroActual.fechaInicio && <span className="text-xs px-3 py-1 rounded-lg border bg-purple-50 text-purple-600 border-purple-100">{'📅 Abre: ' + fmt(foroActual.fechaInicio)}</span>}
                      {foroActual.fechaLimite && <span className="text-xs px-3 py-1 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">{'⏰ Cierra: ' + fmt(foroActual.fechaLimite)}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso de estado */}
              {estadoForo === 'antes' && (
                <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 text-center">
                  <span className="text-5xl">🔒</span>
                  <p className="text-blue-700 font-bold mt-3 text-lg">El foro aún no está disponible</p>
                  <p className="text-blue-500 text-sm mt-1">{'Abre el ' + fmt(foroActual.fechaInicio)}</p>
                </div>
              )}
              {estadoForo === 'cerrado' && !miPub && (
                <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
                  <span className="text-5xl">⏰</span>
                  <p className="text-red-700 font-bold mt-3 text-lg">El foro ya cerró</p>
                  <p className="text-red-500 text-sm mt-1">Ya no se pueden agregar participaciones</p>
                </div>
              )}

              {/* Mi participacion */}
              {miPub ? (
                <div className="bg-green-50 rounded-2xl p-5 border border-green-200">
                  {editPubId === miPub.id ? (
                    <div className="space-y-3">
                      <textarea value={editPubTexto} onChange={e => setEditPubTexto(e.target.value)} rows={4} className={inp + ' bg-white'} />
                      <div className="flex gap-2">
                        <button onClick={() => { setEditPubId(null); setEditPubTexto('') }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">Cancelar</button>
                        <button onClick={() => guardarEditPub(miPub.id)} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700">Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-green-700 text-sm">✅ Tu participación:</p>
                        {estadoForo === 'abierto' && (
                          <button onClick={() => { setEditPubId(miPub.id); setEditPubTexto(miPub.texto) }} className="text-purple-600 text-xs font-semibold hover:underline">✏️ Editar</button>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{miPub.texto}</p>
                      {miPub.comentarios?.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-green-200">
                          {miPub.comentarios.map(com => (
                            <div key={com.id} className="bg-white rounded-lg p-3 border border-gray-100">
                              <p className="text-xs font-semibold text-gray-700">{com.autorNombre}</p>
                              <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{com.texto}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : estadoForo === 'abierto' ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm">Tu participación</h3>
                  <textarea value={pubTexto} onChange={e => setPubTexto(e.target.value)} placeholder="Escribe tu participación..." rows={4} className={inp} />
                  <button onClick={publicarEnForo} disabled={!pubTexto.trim()} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-40">💬 Publicar</button>
                </div>
              ) : null}

              {/* Participaciones de otros */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Participaciones de compañeros ({otras.length})</p>
              {otras.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                  <span className="text-4xl">💭</span>
                  <p className="text-gray-500 mt-2 text-sm">Aún no hay otras participaciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {otras.map(pub => (
                    <div key={pub.id} className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                          {pub.estudiante?.nombre?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{pub.estudiante?.nombre || 'Estudiante'}</p>
                          <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">{pub.texto}</p>
                          <p className="text-xs text-gray-400 mt-1">{fmt(pub.createdAt)}</p>

                          {pub.comentarios?.length > 0 && (
                            <div className="mt-3 space-y-2 pl-4 border-l-2 border-gray-100">
                              {pub.comentarios.map(com => (
                                <div key={com.id} className="bg-slate-50 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-gray-700">{com.autorNombre}</p>
                                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">{com.texto}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {estadoForo === 'abierto' && (
                            <div className="flex gap-2 mt-3">
                              <input value={comentTemp[pub.id] || ''} onChange={e => setComentTemp(p => ({ ...p, [pub.id]: e.target.value }))}
                                placeholder="Responder..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                onKeyDown={e => { if (e.key === 'Enter') enviarComentario(pub.id) }} />
                              <button onClick={() => enviarComentario(pub.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">Enviar</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* RESPONDER QUIZ */}
        {vista === 'quiz' && quizActual && (
          <div className="space-y-5 max-w-3xl">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-3xl">❓</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{quizActual.titulo}</h3>
                  {quizActual.descripcion && <p className="text-gray-500 text-sm">{quizActual.descripcion}</p>}
                  <p className="text-xs text-gray-400 mt-2">{(quizActual.preguntas?.length || 0) + ' preguntas · maximo 2 intentos'}</p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {quizActual.fechaInicio && <span className="text-xs px-3 py-1 rounded-lg border bg-purple-50 text-purple-600 border-purple-100">{'📅 Abre: ' + fmt(quizActual.fechaInicio)}</span>}
                    {quizActual.fechaLimite && <span className="text-xs px-3 py-1 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">{'⏰ Cierra: ' + fmt(quizActual.fechaLimite)}</span>}
                  </div>
                </div>
              </div>
            </div>

            {estadoQuiz === 'antes' ? (
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 text-center">
                <span className="text-5xl">🔒</span>
                <p className="text-blue-700 font-bold mt-3 text-lg">El quiz aún no está disponible</p>
                <p className="text-blue-500 text-sm mt-1">{'Abre el ' + fmt(quizActual.fechaInicio)}</p>
              </div>
            ) : estadoQuiz === 'cerrado' && !miIntentoQuiz ? (
              <div className="bg-red-50 rounded-2xl p-8 border border-red-200 text-center">
                <span className="text-5xl">⏰</span>
                <p className="text-red-700 font-bold mt-3 text-lg">El quiz ya cerró</p>
                <p className="text-red-500 text-sm mt-1">No alcanzaste a responderlo</p>
              </div>
            ) : resultadoQuiz ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
                <span className="text-6xl">{resultadoQuiz.nota >= 7 ? '🎉' : '📚'}</span>
                <div>
                  <p className="text-gray-500 text-sm">Tu calificacion en este intento</p>
                  <p className={'text-6xl font-black ' + (resultadoQuiz.nota >= 7 ? 'text-green-600' : 'text-red-500')}>{resultadoQuiz.nota}</p>
                  <p className="text-gray-400 text-sm">{'Acertaste ' + resultadoQuiz.aciertos + ' de ' + resultadoQuiz.total}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-purple-700 font-semibold">{'Mejor nota: ' + resultadoQuiz.mejorNota + '/10'}</p>
                  <p className="text-xs text-purple-500 mt-0.5">{'Intentos usados: ' + resultadoQuiz.intentos + '/2'}</p>
                </div>
                {resultadoQuiz.intentos < 2 && estadoQuiz === 'abierto' ? (
                  <button onClick={() => { setResultadoQuiz(null); setRespuestasQuiz({}) }}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">
                    🔁 Reintentar (te queda 1 intento)
                  </button>
                ) : (
                  <p className="text-gray-400 text-sm">Se guarda tu mejor nota.</p>
                )}
              </div>
            ) : miIntentoQuiz && (miIntentoQuiz.intentos >= 2 || estadoQuiz === 'cerrado') ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-3">
                <span className="text-5xl">✅</span>
                <p className="text-gray-700 font-bold text-lg">Ya completaste este quiz</p>
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100 inline-block">
                  <p className="text-gray-500 text-sm">Tu mejor nota</p>
                  <p className={'text-5xl font-black ' + (miIntentoQuiz.nota >= 7 ? 'text-green-600' : 'text-red-500')}>{miIntentoQuiz.nota}</p>
                  <p className="text-gray-400 text-xs">{'Intentos: ' + miIntentoQuiz.intentos + '/2'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {miIntentoQuiz && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-sm text-blue-700">
                    {'Ya hiciste este quiz una vez (nota: ' + miIntentoQuiz.nota + '/10). Te queda 1 intento, se guardará la mejor nota.'}
                  </div>
                )}
                {quizActual.preguntas?.map((p, i) => (
                  <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <p className="font-semibold text-gray-800 mb-3">{(i + 1) + '. ' + p.texto}</p>
                    <div className="space-y-2">
                      {p.opciones.map((op, j) => (
                        <label key={j} className={'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ' + (respuestasQuiz[i] === j ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-purple-200')}>
                          <input type="radio" name={'preg-' + i} checked={respuestasQuiz[i] === j} onChange={() => setRespuestasQuiz(prev => ({ ...prev, [i]: j }))} className="w-4 h-4 accent-purple-600" />
                          <span className="text-sm text-gray-700">{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={enviarQuiz} disabled={enviandoQuiz}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md disabled:opacity-40">
                  {enviandoQuiz ? '⏳ Enviando...' : '✅ Enviar quiz'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
