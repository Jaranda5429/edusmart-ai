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
]

const COLS = [
  { bg: 'bg-[#1C1535]', border: 'border-[rgba(124,58,237,0.3)]', text: 'text-purple-700' },
  { bg: 'bg-[#1C1535]', border: 'border-[rgba(59,130,246,0.3)]',   text: 'text-[#60A5FA]'   },
  { bg: 'bg-[#1C1535]', border: 'border-[rgba(16,185,129,0.3)]',  text: 'text-[#34D399]'  },
  { bg: 'bg-[#1C1535]', border: 'border-[rgba(245,158,11,0.3)]', text: 'text-[#FBBF24]' },
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
    if (noDisp) return { txt: '🔒 No disponible', cls: 'bg-[rgba(59,130,246,0.1)] text-[#60A5FA] border-[rgba(59,130,246,0.3)]' }
    if (new Date(act.fechaLimite) < new Date() && (!ent || !ent.entregado)) return { txt: 'Vencida', cls: 'bg-[rgba(239,68,68,0.1)] text-[#F87171] border-[rgba(239,68,68,0.3)]' }
    if (ent?.entregado && ent?.calificacion != null) return { txt: ent.calificacion + '/10', cls: 'bg-[rgba(16,185,129,0.1)] text-[#34D399] border-[rgba(16,185,129,0.3)]' }
    if (ent?.entregado) return { txt: 'Entregada', cls: 'bg-[rgba(124,58,237,0.12)] text-purple-700 border-[rgba(124,58,237,0.3)]' }
    return { txt: 'Pendiente', cls: 'bg-orange-50 text-orange-600 border-[rgba(245,158,11,0.3)]' }
  }

  // Badge de estado para foro/quiz segun ventana de tiempo
  const badgeVentana = (estado, intento) => {
    if (intento != null) return { txt: intento + '/10', cls: 'bg-[rgba(16,185,129,0.1)] text-[#34D399] border-[rgba(16,185,129,0.3)]' }
    if (estado === 'antes') return { txt: '🔒 No disponible', cls: 'bg-[rgba(59,130,246,0.1)] text-[#60A5FA] border-[rgba(59,130,246,0.3)]' }
    if (estado === 'cerrado') return { txt: 'Cerrado', cls: 'bg-[rgba(239,68,68,0.1)] text-[#F87171] border-[rgba(239,68,68,0.3)]' }
    return { txt: 'Abierto', cls: 'bg-orange-50 text-orange-600 border-[rgba(245,158,11,0.3)]' }
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

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition-all'
  const inpStyle = { background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(124,58,237,0.3)', color: '#E5E7EB', fontFamily: 'Poppins,sans-serif' }

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-5xl mx-auto px-5 py-6">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {vista !== 'inscripciones' && (
              <button onClick={volver} className="w-9 h-9 bg-[#1C1535] rounded-xl border border-[rgba(124,58,237,0.2)] flex items-center justify-center text-[rgba(156,163,175,0.7)] hover:bg-[rgba(124,58,237,0.12)] hover:text-purple-600 transition-all shadow-none">←</button>
            )}
            <div style={{ background: "rgba(28,21,53,0.8)", backdropFilter: "blur(8px)" }} className=" px-4 py-2 rounded-xl">
              <h2 className="text-xl font-black text-[#F3F4F6]">
                <span>{vista === 'inscripciones' ? 'Mis Cursos' : vista === 'actividades' ? (inscSel?.materiaName || '') : vista === 'foro' ? (foroActual?.titulo || 'Foro') : vista === 'quiz' ? (quizActual?.titulo || 'Quiz') : (actActual?.titulo || '')}</span>
              </h2>
              <p className="text-[#E5E7EB] text-sm">
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
              <span className="bg-[rgba(124,58,237,0.15)] text-purple-700 px-2.5 py-1 rounded-lg font-semibold">{inscSel.periodoName}</span>
              <span className="text-gray-300">›</span>
              <span className="bg-[rgba(59,130,246,0.15)] text-[#60A5FA] px-2.5 py-1 rounded-lg font-semibold">{inscSel.gradoName}</span>
              <span className="text-gray-300">›</span>
              <span className="bg-[rgba(16,185,129,0.15)] text-[#34D399] px-2.5 py-1 rounded-lg font-semibold">{inscSel.materiaName}</span>
            </div>
          )}
        </div>

        {/* INSCRIPCIONES */}
        {vista === 'inscripciones' && (
          misInscripciones.length === 0 ? (
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-16 text-center shadow-none">
              <span className="text-6xl">🔑</span>
              <h3 className="text-xl font-bold text-[#E5E7EB] mt-4 mb-2">Sin materias inscritas</h3>
              <p className="text-[rgba(156,163,175,0.5)] text-sm">Ve al Inicio e ingresa el codigo que te dio tu profesor</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {misInscripciones.map((insc, i) => {
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
                const IMGS = [
                  { bg: 'linear-gradient(135deg,#7C3AED,#A855F7)', accent: '#A78BFA' },
                  { bg: 'linear-gradient(135deg,#0369A1,#38BDF8)', accent: '#60A5FA' },
                  { bg: 'linear-gradient(135deg,#065F46,#34D399)',  accent: '#34D399' },
                  { bg: 'linear-gradient(135deg,#B45309,#F59E0B)',  accent: '#FBBF24' },
                ]
                const col = IMGS[i % IMGS.length]
                return (
                  <div key={i} className="relative group" style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(124,58,237,0.25)', cursor: 'pointer' }}>
                    <button onClick={() => seleccionarInscripcion(insc)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}>
                      {/* Imagen superior con gradiente */}
                      <div style={{ background: col.bg, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ position: 'absolute', left: -10, top: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                        <span style={{ fontSize: 52, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', position: 'relative', zIndex: 1 }}>
                          {insc.materia?.icono || insc.materia?.icon || '📖'}
                        </span>
                        {prom && (
                          <div style={{ position: 'absolute', top: 10, right: 12, textAlign: 'right', zIndex: 2 }}>
                            <p style={{ fontWeight: 900, fontSize: 22, color: '#fff', margin: 0, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{prom}</p>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 600 }}>promedio</p>
                          </div>
                        )}
                      </div>
                      {/* Info inferior */}
                      <div style={{ background: '#1C1535', padding: '14px 18px 16px' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insc.materiaName}</h3>
                        <p style={{ fontSize: 12, color: 'rgba(156,163,175,0.65)', margin: '0 0 1px' }}>{insc.gradoName}</p>
                        <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.45)', margin: '0 0 10px' }}>{insc.periodoName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: col.accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                            {acts.length + ' actividades'} <span>→</span>
                          </span>
                          {pendientes > 0 && (
                            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#FBBF24', fontSize: 11, padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }}>
                              {'⚠️ ' + pendientes + ' pend.'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* ACTIVIDADES */}
        {vista === 'actividades' && (
          loadingActs ? (
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-14 text-center shadow-none">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[rgba(156,163,175,0.5)] text-sm">Cargando actividades...</p>
            </div>
          ) : actividades.length === 0 && foros.length === 0 && quizzes.length === 0 ? (
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-14 text-center shadow-none">
              <span className="text-5xl">📭</span>
              <p className="text-[rgba(156,163,175,0.7)] mt-3 font-semibold">Sin actividades aun</p>
              <p className="text-[rgba(156,163,175,0.5)] text-sm mt-1">Tu profesor aun no ha creado actividades en esta materia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actividades.map(act => {
                const badge = estadoBadge(act)
                const dias = Math.ceil((new Date(act.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <button key={act.id} onClick={() => { setActividadSel(act); setTab('contenido'); setVista('actividad') }}
                    className="w-full bg-[#1C1535] rounded-2xl p-5 shadow-none hover:shadow-md border-2 border-transparent hover:border-[rgba(124,58,237,0.3)] transition-all text-left group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[rgba(124,58,237,0.12)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📝</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#E5E7EB]">{act.titulo}</h4>
                          {act.foro && <span className="text-xs bg-[rgba(124,58,237,0.15)] text-purple-600 px-2 py-0.5 rounded-full">💬 Foro</span>}
                        </div>
                        <div className="flex gap-3 text-xs text-[rgba(156,163,175,0.5)]">
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
                  <p className="text-xs font-semibold text-[rgba(156,163,175,0.5)] uppercase tracking-wider">Foros de discusión</p>
                  {foros.map(f => {
                    const est = estadoVentana(f.fechaInicio, f.fechaLimite)
                    const b = badgeVentana(est, null)
                    return (
                      <button key={f.id} onClick={() => abrirForo(f)}
                        className="w-full bg-[#1C1535] rounded-2xl p-5 shadow-none hover:shadow-md border-2 border-transparent hover:border-[rgba(124,58,237,0.3)] transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[rgba(124,58,237,0.12)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💬</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[#E5E7EB]">{f.titulo}</h4>
                            {f.descripcion && <p className="text-xs text-[rgba(156,163,175,0.7)] line-clamp-1 mt-0.5">{f.descripcion}</p>}
                            <p className="text-xs text-[rgba(156,163,175,0.5)] mt-0.5">
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
                  <p className="text-xs font-semibold text-[rgba(156,163,175,0.5)] uppercase tracking-wider">Quizzes</p>
                  {quizzes.map(q => {
                    const intento = q.intentos?.find(it => it.estudianteId === miId)
                    const est = estadoVentana(q.fechaInicio, q.fechaLimite)
                    const b = badgeVentana(est, intento ? intento.nota : null)
                    return (
                      <button key={q.id} onClick={() => abrirQuiz(q)}
                        className="w-full bg-[#1C1535] rounded-2xl p-5 shadow-none hover:shadow-md border-2 border-transparent hover:border-[rgba(124,58,237,0.3)] transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[rgba(124,58,237,0.12)] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">❓</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[#E5E7EB]">{q.titulo}</h4>
                            <p className="text-xs text-[rgba(156,163,175,0.5)] mt-0.5">
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
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-none">
              <h3 className="font-bold text-[#E5E7EB] text-lg mb-2">{actActual.titulo}</h3>
              {actActual.descripcion && <p className="text-[rgba(156,163,175,0.7)] text-sm mb-3">{actActual.descripcion}</p>}
              <div className="flex gap-2 flex-wrap">
                {actActual.fechaInicio && (
                  <span className={'text-xs px-3 py-1.5 rounded-lg border ' + (noDisponible ? 'bg-[rgba(59,130,246,0.1)] text-[#60A5FA] border-[rgba(59,130,246,0.3)]' : 'bg-[rgba(124,58,237,0.12)] text-purple-600 border-purple-100')}>
                    {'📅 Inicio: ' + fmt(actActual.fechaInicio)}
                  </span>
                )}
                <span className={'text-xs px-3 py-1.5 rounded-lg border ' + (vencida && !miEntrega?.entregado ? 'bg-[rgba(239,68,68,0.1)] text-[#F87171] border-[rgba(239,68,68,0.3)]' : 'bg-orange-50 text-orange-600 border-orange-100')}>
                  {'⏰ Límite: ' + fmt(actActual.fechaLimite)}
                </span>
                {miEntrega?.calificacion != null && (
                  <span className={'text-xs px-3 py-1.5 rounded-lg border font-bold ' + (miEntrega.calificacion >= 7 ? 'bg-[rgba(16,185,129,0.1)] text-[#34D399] border-[rgba(16,185,129,0.3)]' : 'bg-[rgba(239,68,68,0.1)] text-[#F87171] border-[rgba(239,68,68,0.3)]')}>
                    {'⭐ Nota: ' + miEntrega.calificacion + '/10'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[...(actActual.soloForo ? [] : ['contenido', 'entregar']), ...(actActual.foro ? ['foro'] : [])].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={'px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border ' + (tab === t ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-[rgba(124,58,237,0.08)] text-[rgba(167,139,250,0.7)] border-[rgba(124,58,237,0.2)] hover:border-[rgba(124,58,237,0.5)] hover:text-[#A78BFA]')}>
                  {t === 'contenido' && '📋 Contenido'}
                  {t === 'entregar' && (miEntrega?.entregado ? '✅ Mi entrega' : '📤 Entregar')}
                  {t === 'foro' && '💬 Foro'}
                </button>
              ))}
            </div>

            {tab === 'contenido' && (
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(124,58,237,0.15)]"><h3 className="font-bold text-[#E5E7EB]">Material</h3></div>
                {!actActual.contenidos?.length ? (
                  <div className="p-10 text-center text-[rgba(156,163,175,0.5)]">Sin contenido subido aun</div>
                ) : (
                  <div className="p-5 space-y-3">
                    {actActual.contenidos.map((c, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-[rgba(124,58,237,0.06)] rounded-xl border border-[rgba(124,58,237,0.15)]">
                        <span className="text-2xl flex-shrink-0">{c.icono || c.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#E5E7EB] text-sm">{c.label}</p>
                          {c.texto && <p className="text-[#9CA3AF] text-sm mt-1 leading-relaxed">{c.texto}</p>}
                          {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-purple-600 text-sm hover:underline mt-1 block break-all">{c.nombre || c.url}</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'entregar' && (
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-none space-y-4">
                {miEntrega?.entregado ? (
                  <div className="space-y-4">
                    <div className="bg-[rgba(16,185,129,0.1)] rounded-xl p-5 border border-[rgba(16,185,129,0.3)] text-center">
                      <p className="text-3xl font-black text-[#34D399]">✅</p>
                      <p className="text-[#34D399] font-bold mt-1">Tarea entregada</p>
                    </div>
                    {miEntrega.calificacion != null ? (
                      <div className="bg-[rgba(124,58,237,0.12)] rounded-xl p-6 border border-[rgba(124,58,237,0.3)] text-center">
                        <p className="text-[rgba(156,163,175,0.7)] text-sm mb-1">Tu calificacion</p>
                        <p className={'text-6xl font-black ' + (miEntrega.calificacion >= 7 ? 'text-[#34D399]' : 'text-[#F87171]')}>{miEntrega.calificacion}</p>
                        <p className="text-[rgba(156,163,175,0.5)] text-sm">de 10</p>
                      </div>
                    ) : (
                      <div style={{ background: "rgba(124,58,237,0.06)" }} className="rounded-xl p-5 border border-[rgba(124,58,237,0.2)] text-center">
                        <p className="text-[rgba(156,163,175,0.7)]">⏳ Tu profesor aun no ha calificado</p>
                      </div>
                    )}
                    {miEntrega.texto && (
                      <div style={{ background: "rgba(124,58,237,0.06)" }} className="rounded-xl p-4 border border-[rgba(124,58,237,0.15)]">
                        <p className="text-xs font-semibold text-[rgba(156,163,175,0.7)] mb-2">Tu respuesta:</p>
                        <p className="text-sm text-[#D1D5DB] leading-relaxed">{miEntrega.texto}</p>
                      </div>
                    )}
                    {miEntrega.archivoUrl && (
                      <a href={miEntrega.archivoUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 bg-[rgba(124,58,237,0.12)] rounded-xl p-4 border border-[rgba(124,58,237,0.3)] hover:bg-[rgba(124,58,237,0.15)] transition-colors">
                        <span className="text-2xl">📎</span>
                        <div>
                          <p className="text-sm font-semibold text-purple-700">{miEntrega.archivoNombre || 'Archivo adjunto'}</p>
                          <p className="text-xs text-purple-500">Clic para descargar</p>
                        </div>
                      </a>
                    )}
                  </div>
                ) : noDisponible ? (
                  <div className="bg-[rgba(59,130,246,0.1)] rounded-xl p-12 border border-[rgba(59,130,246,0.3)] text-center">
                    <span className="text-5xl">🔒</span>
                    <p className="text-[#60A5FA] font-bold mt-3 text-lg">Aun no disponible</p>
                    <p className="text-blue-500 text-sm mt-1">
                      {diasDisponible > 0
                        ? 'Disponible en ' + diasDisponible + ' dia' + (diasDisponible !== 1 ? 's' : '')
                        : 'Disponible hoy mas tarde'}
                    </p>
                    <p className="text-blue-400 text-xs mt-2">{fmt(actActual.fechaInicio)}</p>
                  </div>
                ) : vencida ? (
                  <div className="bg-[rgba(239,68,68,0.1)] rounded-xl p-12 border border-[rgba(239,68,68,0.3)] text-center">
                    <span className="text-5xl">❌</span>
                    <p className="text-red-700 font-bold mt-3 text-lg">Actividad vencida</p>
                  </div>
                ) : entregaEnviada ? (
                  <div className="bg-[rgba(16,185,129,0.1)] rounded-xl p-12 border border-[rgba(16,185,129,0.3)] text-center">
                    <span className="text-5xl">🎉</span>
                    <p className="text-[#34D399] font-bold mt-3 text-lg">Entrega enviada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#E5E7EB]">📤 Entregar actividad</h3>
                    <textarea value={textoEntrega} onChange={e => setTextoEntrega(e.target.value)} placeholder="Escribe tu respuesta aqui..." rows={5} className={inp} style={inpStyle} />
                    <div className="border-2 border-dashed border-[rgba(124,58,237,0.25)] rounded-xl p-5 text-center cursor-pointer hover:border-purple-400 transition-colors" onClick={() => document.getElementById('fileEnt').click()}>
                      <input id="fileEnt" type="file" className="hidden" onChange={e => setArchivo(e.target.files[0])} />
                      {archivo ? <p className="text-purple-600 font-semibold text-sm">{'✅ ' + archivo.name}</p> : <p className="text-[rgba(156,163,175,0.7)] text-sm">📎 Adjuntar archivo (opcional)</p>}
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
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-none space-y-4">
                <div className="bg-[rgba(124,58,237,0.12)] rounded-xl p-4 border border-[rgba(124,58,237,0.3)]">
                  <h3 className="font-bold text-purple-800">{'💬 ' + actActual.foro.tema}</h3>
                  {actActual.foro.fechaLimite && <p className="text-purple-500 text-xs mt-0.5">{'⏰ ' + fmt(actActual.foro.fechaLimite)}</p>}
                </div>

                {(miRespForo?.respuesta || foroEnviado) ? (
                  <div className="bg-[rgba(16,185,129,0.1)] rounded-xl p-4 border border-[rgba(16,185,129,0.3)]">
                    <p className="font-semibold text-[#34D399] text-sm mb-1">✅ Tu respuesta:</p>
                    <p className="text-[#D1D5DB] text-sm">{miRespForo?.respuesta || respForo}</p>
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
                      <p className="text-xs font-semibold text-[rgba(156,163,175,0.5)] uppercase tracking-wider">Participaciones ({otras.length})</p>
                      {otras.map((r, i) => (
                        <div key={i} style={{ background: "rgba(124,58,237,0.06)" }} className="rounded-xl p-4 border border-[rgba(124,58,237,0.15)]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-[rgba(124,58,237,0.15)] rounded-full flex items-center justify-center text-purple-700 text-xs font-bold">
                              {r.estudiante?.nombre?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-sm text-[#E5E7EB]">{r.estudiante?.nombre || 'Estudiante'}</span>
                          </div>
                          <p className="text-[#D1D5DB] text-sm">{r.respuesta}</p>
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
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-none">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💬</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">{foroActual.titulo}</h3>
                    {foroActual.descripcion && <p className="text-[rgba(156,163,175,0.7)] text-sm">{foroActual.descripcion}</p>}
                    <div className="flex gap-2 flex-wrap mt-2">
                      {foroActual.fechaInicio && <span className="text-xs px-3 py-1 rounded-lg border bg-[rgba(124,58,237,0.12)] text-purple-600 border-purple-100">{'📅 Abre: ' + fmt(foroActual.fechaInicio)}</span>}
                      {foroActual.fechaLimite && <span className="text-xs px-3 py-1 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">{'⏰ Cierra: ' + fmt(foroActual.fechaLimite)}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso de estado */}
              {estadoForo === 'antes' && (
                <div className="bg-[rgba(59,130,246,0.1)] rounded-2xl p-8 border border-[rgba(59,130,246,0.3)] text-center">
                  <span className="text-5xl">🔒</span>
                  <p className="text-[#60A5FA] font-bold mt-3 text-lg">El foro aún no está disponible</p>
                  <p className="text-blue-500 text-sm mt-1">{'Abre el ' + fmt(foroActual.fechaInicio)}</p>
                </div>
              )}
              {estadoForo === 'cerrado' && !miPub && (
                <div className="bg-[rgba(239,68,68,0.1)] rounded-2xl p-8 border border-[rgba(239,68,68,0.3)] text-center">
                  <span className="text-5xl">⏰</span>
                  <p className="text-red-700 font-bold mt-3 text-lg">El foro ya cerró</p>
                  <p className="text-[#F87171] text-sm mt-1">Ya no se pueden agregar participaciones</p>
                </div>
              )}

              {/* Mi participacion */}
              {miPub ? (
                <div className="bg-[rgba(16,185,129,0.1)] rounded-2xl p-5 border border-[rgba(16,185,129,0.3)]">
                  {editPubId === miPub.id ? (
                    <div className="space-y-3">
                      <textarea value={editPubTexto} onChange={e => setEditPubTexto(e.target.value)} rows={4} className={inp} style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(124,58,237,0.3)', color: '#E5E7EB' }} />
                      <div className="flex gap-2">
                        <button onClick={() => { setEditPubId(null); setEditPubTexto('') }} className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-2.5 rounded-xl font-semibold text-sm hover:bg-[rgba(124,58,237,0.1)]">Cancelar</button>
                        <button onClick={() => guardarEditPub(miPub.id)} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700">Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-[#34D399] text-sm">✅ Tu participación:</p>
                        {estadoForo === 'abierto' && (
                          <button onClick={() => { setEditPubId(miPub.id); setEditPubTexto(miPub.texto) }} className="text-purple-600 text-xs font-semibold hover:underline">✏️ Editar</button>
                        )}
                      </div>
                      <p className="text-[#D1D5DB] text-sm whitespace-pre-wrap">{miPub.texto}</p>
                      {miPub.comentarios?.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-[rgba(16,185,129,0.3)]">
                          {miPub.comentarios.map(com => (
                            <div key={com.id} style={{ background: "#1C1535", borderRadius: 10 }} className=" p-3 border border-[rgba(124,58,237,0.15)]">
                              <p className="text-xs font-semibold text-[#D1D5DB]">{com.autorNombre}</p>
                              <p className="text-sm text-[#9CA3AF] mt-0.5 whitespace-pre-wrap">{com.texto}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : estadoForo === 'abierto' ? (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-5 shadow-none space-y-3">
                  <h3 className="font-bold text-[#E5E7EB] text-sm">Tu participación</h3>
                  <textarea value={pubTexto} onChange={e => setPubTexto(e.target.value)} placeholder="Escribe tu participación..." rows={4} className={inp} />
                  <button onClick={publicarEnForo} disabled={!pubTexto.trim()} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-40">💬 Publicar</button>
                </div>
              ) : null}

              {/* Participaciones de otros */}
              <p className="text-xs font-semibold text-[rgba(156,163,175,0.5)] uppercase tracking-wider">Participaciones de compañeros ({otras.length})</p>
              {otras.length === 0 ? (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-10 text-center shadow-none">
                  <span className="text-4xl">💭</span>
                  <p className="text-[rgba(156,163,175,0.7)] mt-2 text-sm">Aún no hay otras participaciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {otras.map(pub => (
                    <div key={pub.id} style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-5 shadow-none">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-[rgba(124,58,237,0.15)] rounded-full flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                          {pub.estudiante?.nombre?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#E5E7EB] text-sm">{pub.estudiante?.nombre || 'Estudiante'}</p>
                          <p className="text-[#D1D5DB] text-sm mt-1 whitespace-pre-wrap">{pub.texto}</p>
                          <p className="text-xs text-[rgba(156,163,175,0.5)] mt-1">{fmt(pub.createdAt)}</p>

                          {pub.comentarios?.length > 0 && (
                            <div className="mt-3 space-y-2 pl-4 border-l-2 border-[rgba(124,58,237,0.15)]">
                              {pub.comentarios.map(com => (
                                <div key={com.id} style={{ background: "rgba(124,58,237,0.06)" }} className="rounded-lg p-3">
                                  <p className="text-xs font-semibold text-[#D1D5DB]">{com.autorNombre}</p>
                                  <p className="text-sm text-[#9CA3AF] mt-0.5 whitespace-pre-wrap">{com.texto}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {estadoForo === 'abierto' && (
                            <div className="flex gap-2 mt-3">
                              <input value={comentTemp[pub.id] || ''} onChange={e => setComentTemp(p => ({ ...p, [pub.id]: e.target.value }))}
                               placeholder="Responder..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300"                                onKeyDown={e => { if (e.key === 'Enter') enviarComentario(pub.id) }} />
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
            <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-none">
              <div className="flex items-start gap-3">
                <span className="text-3xl">❓</span>
                <div className="flex-1">
                  <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">{quizActual.titulo}</h3>
                  {quizActual.descripcion && <p className="text-[rgba(156,163,175,0.7)] text-sm">{quizActual.descripcion}</p>}
                  <p className="text-xs text-[rgba(156,163,175,0.5)] mt-2">{(quizActual.preguntas?.length || 0) + ' preguntas · maximo 2 intentos'}</p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {quizActual.fechaInicio && <span className="text-xs px-3 py-1 rounded-lg border bg-[rgba(124,58,237,0.12)] text-purple-600 border-purple-100">{'📅 Abre: ' + fmt(quizActual.fechaInicio)}</span>}
                    {quizActual.fechaLimite && <span className="text-xs px-3 py-1 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">{'⏰ Cierra: ' + fmt(quizActual.fechaLimite)}</span>}
                  </div>
                </div>
              </div>
            </div>

            {estadoQuiz === 'antes' ? (
              <div className="bg-[rgba(59,130,246,0.1)] rounded-2xl p-8 border border-[rgba(59,130,246,0.3)] text-center">
                <span className="text-5xl">🔒</span>
                <p className="text-[#60A5FA] font-bold mt-3 text-lg">El quiz aún no está disponible</p>
                <p className="text-blue-500 text-sm mt-1">{'Abre el ' + fmt(quizActual.fechaInicio)}</p>
              </div>
            ) : estadoQuiz === 'cerrado' && !miIntentoQuiz ? (
              <div className="bg-[rgba(239,68,68,0.1)] rounded-2xl p-8 border border-[rgba(239,68,68,0.3)] text-center">
                <span className="text-5xl">⏰</span>
                <p className="text-red-700 font-bold mt-3 text-lg">El quiz ya cerró</p>
                <p className="text-[#F87171] text-sm mt-1">No alcanzaste a responderlo</p>
              </div>
            ) : resultadoQuiz ? (
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 shadow-none text-center space-y-4">
                <span className="text-6xl">{resultadoQuiz.nota >= 7 ? '🎉' : '📚'}</span>
                <div>
                  <p className="text-[rgba(156,163,175,0.7)] text-sm">Tu calificacion en este intento</p>
                  <p className={'text-6xl font-black ' + (resultadoQuiz.nota >= 7 ? 'text-[#34D399]' : 'text-[#F87171]')}>{resultadoQuiz.nota}</p>
                  <p className="text-[rgba(156,163,175,0.5)] text-sm">{'Acertaste ' + resultadoQuiz.aciertos + ' de ' + resultadoQuiz.total}</p>
                </div>
                <div className="bg-[rgba(124,58,237,0.12)] rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-purple-700 font-semibold">{'Mejor nota: ' + resultadoQuiz.mejorNota + '/10'}</p>
                  <p className="text-xs text-purple-500 mt-0.5">{'Intentos usados: ' + resultadoQuiz.intentos + '/2'}</p>
                </div>
                {resultadoQuiz.intentos < 2 && estadoQuiz === 'abierto' ? (
                  <button onClick={() => { setResultadoQuiz(null); setRespuestasQuiz({}) }}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">
                    🔁 Reintentar (te queda 1 intento)
                  </button>
                ) : (
                  <p className="text-[rgba(156,163,175,0.5)] text-sm">Se guarda tu mejor nota.</p>
                )}
              </div>
            ) : miIntentoQuiz && (miIntentoQuiz.intentos >= 2 || estadoQuiz === 'cerrado') ? (
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 shadow-none text-center space-y-3">
                <span className="text-5xl">✅</span>
                <p className="text-[#D1D5DB] font-bold text-lg">Ya completaste este quiz</p>
                <div className="bg-[rgba(124,58,237,0.12)] rounded-xl p-5 border border-purple-100 inline-block">
                  <p className="text-[rgba(156,163,175,0.7)] text-sm">Tu mejor nota</p>
                  <p className={'text-5xl font-black ' + (miIntentoQuiz.nota >= 7 ? 'text-[#34D399]' : 'text-[#F87171]')}>{miIntentoQuiz.nota}</p>
                  <p className="text-[rgba(156,163,175,0.5)] text-xs">{'Intentos: ' + miIntentoQuiz.intentos + '/2'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {miIntentoQuiz && (
                  <div className="bg-[rgba(59,130,246,0.1)] rounded-xl p-4 border border-[rgba(59,130,246,0.3)] text-sm text-[#60A5FA]">
                    {'Ya hiciste este quiz una vez (nota: ' + miIntentoQuiz.nota + '/10). Te queda 1 intento, se guardará la mejor nota.'}
                  </div>
                )}
                {quizActual.preguntas?.map((p, i) => (
                  <div key={p.id} style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-5 shadow-none">
                    <p className="font-semibold text-[#E5E7EB] mb-3">{(i + 1) + '. ' + p.texto}</p>
                    <div className="space-y-2">
                      {p.opciones.map((op, j) => (
                        <label key={j} className={'flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ' + (respuestasQuiz[i] === j ? 'border-purple-400 bg-[rgba(124,58,237,0.12)]' : 'border-[rgba(124,58,237,0.15)] hover:border-[rgba(124,58,237,0.3)]')}>
                          <input type="radio" name={'preg-' + i} checked={respuestasQuiz[i] === j} onChange={() => setRespuestasQuiz(prev => ({ ...prev, [i]: j }))} className="w-4 h-4 accent-purple-600" />
                          <span className="text-sm text-[#D1D5DB]">{op}</span>
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
