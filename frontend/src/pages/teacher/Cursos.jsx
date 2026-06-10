import { useState } from 'react'
import { useProfesor } from '../../context/ProfesorContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import { useSearchParams } from 'react-router-dom'
import { foroService, quizService } from '../../services/api'
import { subirContenido } from '../../services/supabase'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analiticas', path: '/profesor/analiticas' },
]

const ICONOS_MATERIA = ['📖','🔢','🔬','🌍','🎨','💻','🏃','🎵','📐','🧪','📝','🔍','🏛️','🎭','⚽']
const TIPO_PERIODO = ['Periodo', 'Semestre', 'Trimestre', 'Bimestre', 'Año']
const TIPOS_CONTENIDO = [
  { id: 'archivo',      icon: '📄', label: 'Documento',     accept: '.pdf,.doc,.docx,.xls,.xlsx' },
  { id: 'imagen',       icon: '🖼️', label: 'Imagen',        accept: 'image/*' },
  { id: 'video_link',   icon: '🎥', label: 'Video YouTube' },
  { id: 'video_propio', icon: '📹', label: 'Video propio',  accept: 'video/*' },
  { id: 'explicacion',  icon: '📋', label: 'Instrucciones' },
  { id: 'link',         icon: '🔗', label: 'Enlace' },
]

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all'
const lbl = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

export default function TeacherCursos() {
  const { usuario } = useAuth()
  const {
    periodos, loading, cargarActividades,
    getActividades, agregarActividad, calificarEntrega,
    editarActividad, eliminarActividad,
    setClave, getClave,
    agregarGrado, editarGrado, eliminarGrado,
    agregarMateria, editarMateria, eliminarMateria,
    agregarPeriodo, editarPeriodo, eliminarPeriodo,
  } = useProfesor()

  const [vista, setVista] = useState('periodos')
  const [periodoSel, setPeriodoSel] = useState(null)
  const [gradoSel, setGradoSel] = useState(null)
  const [materiaSel, setMateriaSel] = useState(null)
  const [actividadSel, setActividadSel] = useState(null)
  const [estudianteSel, setEstudianteSel] = useState(null)
  const [entregaSel, setEntregaSel] = useState(null)
  const [tabActiva, setTabActiva] = useState('contenido')
  const [notaTemp, setNotaTemp] = useState('')
  const [loadingActs, setLoadingActs] = useState(false)
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.toLowerCase() || ''

  const [showModalPeriodo, setShowModalPeriodo] = useState(false)
  const [editandoPeriodo, setEditandoPeriodo] = useState(null)
  const [formPeriodo, setFormPeriodo] = useState({ nombre: '', tipo: 'Periodo', fechaInicio: '', fechaFin: '' })
  const [confirmDelPeriodo, setConfirmDelPeriodo] = useState(null)

  const [showModalGrado, setShowModalGrado] = useState(false)
  const [editandoGrado, setEditandoGrado] = useState(null)
  const [formGrado, setFormGrado] = useState({ nombre: '' })
  const [confirmDelGrado, setConfirmDelGrado] = useState(null)

  const [showModalMateria, setShowModalMateria] = useState(false)
  const [editandoMateria, setEditandoMateria] = useState(null)
  const [formMateria, setFormMateria] = useState({ nombre: '', icon: '📖' })
  const [confirmDelMateria, setConfirmDelMateria] = useState(null)

  const [showModalClave, setShowModalClave] = useState(false)
  const [claveInput, setClaveInput] = useState('')
  const [claveMateria, setClaveMateria] = useState(null)

  const [showModalAct, setShowModalAct] = useState(false)
  const [nuevaAct, setNuevaAct] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, soloForo: false, foroTema: '', foroFechaLimite: '' })
  const [editandoAct, setEditandoAct] = useState(null)
  const [formEditAct, setFormEditAct] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '' })
  const [confirmDelAct, setConfirmDelAct] = useState(null)
  const [tipoSel, setTipoSel] = useState(null)
  const [contTemp, setContTemp] = useState({ texto: '', url: '', archivo: null })
  const [preguntas, setPreguntas] = useState([])
  const [foros, setForos] = useState([])
  const [loadingForos, setLoadingForos] = useState(false)
  const [foroSel, setForoSel] = useState(null)
  const [showModalForo, setShowModalForo] = useState(false)
  const [editandoForo, setEditandoForo] = useState(null)
  const [formForo, setFormForo] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '' })
  const [confirmDelForo, setConfirmDelForo] = useState(null)
  const [comentTemp, setComentTemp] = useState({})
  const [confirmDelPub, setConfirmDelPub] = useState(null)
  const [motivoDel, setMotivoDel] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [quizSel, setQuizSel] = useState(null)
  const [showModalQuiz, setShowModalQuiz] = useState(false)
  const [formQuiz, setFormQuiz] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '' })
  const [preguntasQuiz, setPreguntasQuiz] = useState([])
  const [pregTemp, setPregTemp] = useState({ texto: '', opciones: ['', '', '', ''], correcta: 0 })
  const [confirmDelQuiz, setConfirmDelQuiz] = useState(null)

  const [subiendoCont, setSubiendoCont] = useState(false)
  const [tipoSelEdit, setTipoSelEdit] = useState(null)
  const [contTempEdit, setContTempEdit] = useState({ texto: '', url: '', archivo: null })
  const [subiendoContEdit, setSubiendoContEdit] = useState(false)

  const gradosDelPeriodo = periodoSel ? (periodos.find(p => p.id === periodoSel.id)?.grados || []) : []
  const gradoActual = gradoSel ? (gradosDelPeriodo.find(g => g.id === gradoSel.id) || gradoSel) : null
  const actsActuales = materiaSel ? getActividades(periodoSel?.id, gradoSel?.id, materiaSel.id) : []
  const actActual = actividadSel ? actsActuales.find(a => a.id === actividadSel.id) || actividadSel : null
  const claveActual = materiaSel ? getClave(periodoSel?.id, gradoSel?.id, materiaSel.id) : null

  const periodosFiltrados = searchQuery ? periodos.filter(p => p.nombre.toLowerCase().includes(searchQuery)) : periodos
  const actsActualesFiltradas = searchQuery ? actsActuales.filter(a => a.titulo.toLowerCase().includes(searchQuery)) : actsActuales

  const abrirNuevoPeriodo = () => { setEditandoPeriodo(null); setFormPeriodo({ nombre: '', tipo: 'Periodo', fechaInicio: '', fechaFin: '' }); setShowModalPeriodo(true) }
  const abrirEditarPeriodo = (p, e) => { e.stopPropagation(); setEditandoPeriodo(p); setFormPeriodo({ nombre: p.nombre, tipo: p.tipo || 'Periodo', fechaInicio: p.fechaInicio ? p.fechaInicio.slice(0, 10) : '', fechaFin: p.fechaFin ? p.fechaFin.slice(0, 10) : '' }); setShowModalPeriodo(true) }

  const guardarPeriodo = async () => {
    if (!formPeriodo.nombre.trim()) return
    const label = formPeriodo.tipo + ' — ' + formPeriodo.nombre
    try {
      if (editandoPeriodo) await editarPeriodo(editandoPeriodo.id, { ...formPeriodo, nombre: label })
      else await agregarPeriodo({ ...formPeriodo, nombre: label })
      setShowModalPeriodo(false)
    } catch { alert('Error guardando periodo') }
  }

  const abrirNuevoGrado = () => { setEditandoGrado(null); setFormGrado({ nombre: '' }); setShowModalGrado(true) }
  const abrirEditarGrado = (g, e) => { e.stopPropagation(); setEditandoGrado(g); setFormGrado({ nombre: g.nombre }); setShowModalGrado(true) }

  const guardarGrado = async () => {
    if (!formGrado.nombre.trim()) return
    try {
      if (editandoGrado) await editarGrado(editandoGrado.id, formGrado.nombre)
      else await agregarGrado(formGrado.nombre, periodoSel.id)
      setShowModalGrado(false)
    } catch { alert('Error guardando grado') }
  }

  const abrirNuevaMateria = () => { setEditandoMateria(null); setFormMateria({ nombre: '', icon: '📖' }); setShowModalMateria(true) }
  const abrirEditarMateria = (m, e) => { e.stopPropagation(); setEditandoMateria(m); setFormMateria({ nombre: m.nombre, icon: m.icono || m.icon || '📖' }); setShowModalMateria(true) }

  const guardarMateria = async () => {
    if (!formMateria.nombre.trim()) return
    try {
      if (editandoMateria) await editarMateria(editandoMateria.id, formMateria.nombre, formMateria.icon)
      else await agregarMateria(gradoActual.id, formMateria.nombre, formMateria.icon)
      setShowModalMateria(false)
    } catch { alert('Error guardando materia') }
  }

  const seleccionarMateria = async (m) => {
    setMateriaSel(m); setLoadingActs(true)
    await cargarActividades(m.id)
    cargarForos(m.id)
    cargarQuizzes(m.id)
    setLoadingActs(false); setVista('actividades')
  }

  const addContenidoEdit = async () => {
    if (!tipoSelEdit) return
    let c = { tipo: tipoSelEdit.id, label: tipoSelEdit.label, icon: tipoSelEdit.icon }
    if (tipoSelEdit.id === 'explicacion') { if (!contTempEdit.texto) return; c = { ...c, texto: contTempEdit.texto } }
    else if (['video_link', 'link'].includes(tipoSelEdit.id)) { if (!contTempEdit.url) return; c = { ...c, url: contTempEdit.url } }
    else if (['archivo', 'video_propio', 'imagen'].includes(tipoSelEdit.id)) {
      if (!contTempEdit.archivo) return
      setSubiendoContEdit(true)
      try {
        const res = await subirContenido(contTempEdit.archivo, materiaSel.id)
        c = { ...c, nombre: res.nombre, url: res.url }
      } catch { setSubiendoContEdit(false); alert('Error subiendo el archivo'); return }
      setSubiendoContEdit(false)
    }
    setFormEditAct(p => ({ ...p, contenidos: [...(p.contenidos || []), c] }))
    setTipoSelEdit(null); setContTempEdit({ texto: '', url: '', archivo: null })
  }

  const addContenido = async () => {
    if (!tipoSel) return
    let c = { tipo: tipoSel.id, label: tipoSel.label, icon: tipoSel.icon }
    if (tipoSel.id === 'explicacion') { if (!contTemp.texto) return; c = { ...c, texto: contTemp.texto } }
    else if (['video_link', 'link'].includes(tipoSel.id)) { if (!contTemp.url) return; c = { ...c, url: contTemp.url } }
    else if (['archivo', 'video_propio', 'imagen'].includes(tipoSel.id)) {
      if (!contTemp.archivo) return
      setSubiendoCont(true)
      try {
        const res = await subirContenido(contTemp.archivo, materiaSel.id)
        c = { ...c, nombre: res.nombre, url: res.url }
      } catch {
        setSubiendoCont(false)
        alert('Error subiendo el archivo')
        return
      }
      setSubiendoCont(false)
    }
    setNuevaAct(p => ({ ...p, contenidos: [...p.contenidos, c] }))
    setTipoSel(null); setContTemp({ texto: '', url: '', archivo: null }); setPreguntas([])
  }

  const crearActividad = async () => {
    if (!nuevaAct.titulo || !nuevaAct.fechaLimite) return
    try {
      await agregarActividad(periodoSel.id, gradoSel.id, materiaSel.id, nuevaAct)
      setNuevaAct({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' })
      setShowModalAct(false)
    } catch { alert('Error creando actividad') }
  }

  const fmtInput = iso => {
    if (!iso) return ''
    const d = new Date(iso)
    const off = d.getTimezoneOffset()
    const local = new Date(d.getTime() - off * 60000)
    return local.toISOString().slice(0, 16)
  }

  const abrirEditarAct = (act, e) => {
    e.stopPropagation()
    setEditandoAct(act)
    setFormEditAct({
      titulo: act.titulo || '',
      descripcion: act.descripcion || '',
      fechaInicio: fmtInput(act.fechaInicio),
      fechaLimite: fmtInput(act.fechaLimite),
      contenidos: (act.contenidos || []).map(c => ({
        tipo: c.tipo, label: c.label, icon: c.icono || c.icon || '📄',
        texto: c.texto || null, url: c.url || null, nombre: c.nombre || null
      })),
    })
  }

  const guardarEditAct = async () => {
    if (!formEditAct.titulo || !formEditAct.fechaLimite) return
    try {
      await editarActividad(materiaSel.id, editandoAct.id, formEditAct)
      setEditandoAct(null)
    } catch { alert('Error editando actividad') }
  }

  const confirmarEliminarAct = async () => {
    try {
      await eliminarActividad(materiaSel.id, confirmDelAct.id)
      setConfirmDelAct(null)
      if (vista === 'actividad_detalle') { setActividadSel(null); setVista('actividades') }
    } catch { alert('Error eliminando actividad') }
  }

  const cargarForos = async (materiaId) => {
    setLoadingForos(true)
    try {
      const res = await foroService.getForosMateria(materiaId)
      setForos(res.data || [])
    } catch { console.error('Error cargando foros') }
    setLoadingForos(false)
  }

  const abrirNuevoForo = () => { setEditandoForo(null); setFormForo({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '' }); setShowModalForo(true) }
  const abrirEditarForo = (f, e) => { e.stopPropagation(); setEditandoForo(f); setFormForo({ titulo: f.titulo, descripcion: f.descripcion || '', fechaInicio: fmtInput(f.fechaInicio), fechaLimite: fmtInput(f.fechaLimite) }); setShowModalForo(true) }

  const guardarForo = async () => {
    if (!formForo.titulo.trim()) return
    try {
      if (editandoForo) await foroService.editarForo(editandoForo.id, formForo)
      else await foroService.crearForo({ ...formForo, materiaId: materiaSel.id })
      setShowModalForo(false)
      await cargarForos(materiaSel.id)
    } catch { alert('Error guardando foro') }
  }

  const confirmarEliminarForo = async () => {
    try {
      await foroService.eliminarForo(confirmDelForo.id)
      setConfirmDelForo(null)
      if (vista === 'foro_detalle') { setForoSel(null); setVista('actividades') }
      await cargarForos(materiaSel.id)
    } catch { alert('Error eliminando foro') }
  }

  const abrirForo = async (f) => {
    setForoSel(f); setVista('foro_detalle')
    await cargarForos(materiaSel.id)
  }

  const foroActual = foroSel ? (foros.find(f => f.id === foroSel.id) || foroSel) : null

  const enviarComentario = async (pubId) => {
    const texto = (comentTemp[pubId] || '').trim()
    if (!texto) return
    try {
      await foroService.comentar(pubId, texto)
      setComentTemp(p => ({ ...p, [pubId]: '' }))
      await cargarForos(materiaSel.id)
    } catch { alert('Error comentando') }
  }

  const confirmarEliminarPub = async () => {
    try {
      await foroService.eliminarPublicacion(confirmDelPub.id, motivoDel.trim() || null)
      setConfirmDelPub(null); setMotivoDel('')
      await cargarForos(materiaSel.id)
    } catch { alert('Error eliminando publicacion') }
  }

  const cargarQuizzes = async (materiaId) => {
    try {
      const res = await quizService.getQuizzesMateria(materiaId)
      setQuizzes(res.data || [])
    } catch { console.error('Error cargando quizzes') }
  }

  const abrirNuevoQuiz = () => {
    setFormQuiz({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '' })
    setPreguntasQuiz([])
    setPregTemp({ texto: '', opciones: ['', '', '', ''], correcta: 0 })
    setShowModalQuiz(true)
  }

  const agregarPregunta = () => {
    if (!pregTemp.texto.trim()) return
    if (pregTemp.opciones.some(o => !o.trim())) { alert('Completa las 4 opciones'); return }
    setPreguntasQuiz(p => [...p, { ...pregTemp }])
    setPregTemp({ texto: '', opciones: ['', '', '', ''], correcta: 0 })
  }

  const guardarQuiz = async () => {
    if (!formQuiz.titulo.trim()) { alert('Ponle un titulo al quiz'); return }
    if (preguntasQuiz.length === 0) { alert('Agrega al menos una pregunta'); return }
    try {
      await quizService.crearQuiz({ ...formQuiz, materiaId: materiaSel.id, preguntas: preguntasQuiz })
      setShowModalQuiz(false)
      await cargarQuizzes(materiaSel.id)
    } catch { alert('Error creando quiz') }
  }

  const confirmarEliminarQuiz = async () => {
    try {
      await quizService.eliminarQuiz(confirmDelQuiz.id)
      setConfirmDelQuiz(null)
      if (vista === 'quiz_detalle') { setQuizSel(null); setVista('actividades') }
      await cargarQuizzes(materiaSel.id)
    } catch { alert('Error eliminando quiz') }
  }

  const quizActual = quizSel ? (quizzes.find(q => q.id === quizSel.id) || quizSel) : null

  const guardarNota = async () => {
    const n = parseFloat(notaTemp)
    if (isNaN(n) || n < 0 || n > 10) return
    try {
      await calificarEntrega(periodoSel.id, gradoSel.id, materiaSel.id, actividadSel.id, estudianteSel.id, n)
      setVista('actividad_detalle'); setEntregaSel(null); setEstudianteSel(null); setNotaTemp('')
    } catch { alert('Error guardando nota') }
  }

  const volver = () => {
    const mapa = { calificar: 'actividad_detalle', actividad_detalle: 'actividades', foro_detalle: 'actividades', quiz_detalle: 'actividades', actividades: 'materias', materias: 'grados', grados: 'periodos' }
    if (vista === 'actividad_detalle') setTabActiva('contenido')
    if (vista === 'foro_detalle') setForoSel(null)
    if (vista === 'quiz_detalle') setQuizSel(null)
    if (vista === 'actividades') setMateriaSel(null)
    if (vista === 'materias') setGradoSel(null)
    if (vista === 'grados') setPeriodoSel(null)
    if (vista === 'calificar') { setEntregaSel(null); setNotaTemp('') }
    setVista(mapa[vista] || 'periodos')
  }

  const fmt = iso => {
    if (!iso) return ''
    return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const COLS = [
    { bg: 'bg-[#EDE7FF]', border: 'border-purple-200', text: 'text-purple-700', btn: 'bg-purple-600 hover:bg-purple-700' },
    { bg: 'bg-[#D6E8FF]', border: 'border-blue-200',   text: 'text-blue-700',   btn: 'bg-blue-600 hover:bg-blue-700' },
    { bg: 'bg-[#DDF7E9]', border: 'border-green-200',  text: 'text-green-700',  btn: 'bg-green-600 hover:bg-green-700' },
    { bg: 'bg-[#FFF4CC]', border: 'border-yellow-200', text: 'text-yellow-700', btn: 'bg-yellow-600 hover:bg-yellow-700' },
  ]

  const titulos = {
    periodos: 'Mis Cursos', grados: (periodoSel?.nombre || '') + ' — Grados',
    materias: (gradoSel?.nombre || '') + ' — Materias', actividades: (materiaSel?.nombre || '') + ' — Actividades',
    actividad_detalle: actActual?.titulo || '', calificar: 'Calificar — ' + (estudianteSel?.nombre || ''),
    foro_detalle: foroActual?.titulo || 'Foro',
    quiz_detalle: quizActual?.titulo || 'Quiz',
  }

  return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between py-4 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {vista !== 'periodos' && (
              <button onClick={volver} className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all shadow-sm">←</button>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800">{titulos[vista]}</h2>
              <p className="text-gray-400 text-xs">
                {vista === 'periodos' && (searchQuery ? ('Resultados para "' + searchQuery + '"') : 'Gestiona tus periodos academicos')}
                {vista === 'grados' && 'Gestiona los grados de este periodo'}
                {vista === 'materias' && 'Gestiona las materias de este grado'}
                {vista === 'actividades' && (actsActualesFiltradas.length + ' actividades')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            {periodoSel && <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-semibold">{periodoSel.nombre}</span>}
            {gradoSel && <><span className="text-gray-300">›</span><span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-semibold">{gradoSel.nombre}</span></>}
            {materiaSel && <><span className="text-gray-300">›</span><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg font-semibold">{materiaSel.nombre}</span></>}
          </div>
        </div>

        <div className="pb-10">

          {/* PERIODOS */}
          {vista === 'periodos' && (
            <div className="space-y-5">
              <div className="flex justify-end">
                <button onClick={abrirNuevoPeriodo} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm shadow-md">+ Nuevo Periodo</button>
              </div>
              {loading ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Cargando...</p>
                </div>
              ) : periodosFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
                  <span className="text-6xl">{searchQuery ? '🔍' : '📅'}</span>
                  <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">{searchQuery ? 'Sin resultados' : 'Sin periodos aun'}</h3>
                  <p className="text-gray-400 text-sm mb-6">{searchQuery ? 'No se encontraron periodos con "' + searchQuery + '"' : 'Crea tu primer periodo para empezar'}</p>
                  {!searchQuery && <button onClick={abrirNuevoPeriodo} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">+ Crear primer periodo</button>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {periodosFiltrados.map((p, i) => {
                    const c = COLS[i % COLS.length]
                    const numGrados = p.grados?.length || 0
                    return (
                      <div key={p.id} className={c.bg + ' border-2 ' + c.border + ' rounded-2xl p-6 shadow-sm relative group'}>
                        <button onClick={() => { setPeriodoSel(p); setVista('grados') }} className="w-full text-left">
                          <div className="text-4xl mb-3">📅</div>
                          <h3 className={'text-xl font-bold ' + c.text + ' mb-1'}>{p.nombre}</h3>
                          {(p.fechaInicio || p.fechaFin) && (
                            <p className="text-gray-500 text-sm">{(p.fechaInicio ? fmt(p.fechaInicio) : '?') + ' — ' + (p.fechaFin ? fmt(p.fechaFin) : '?')}</p>
                          )}
                          <p className={'mt-2 text-sm font-semibold ' + c.text}>{numGrados + ' grado' + (numGrados !== 1 ? 's' : '')}</p>
                        </button>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => abrirEditarPeriodo(p, e)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 shadow-sm text-sm">✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelPeriodo(p) }} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm text-sm">🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* GRADOS */}
          {vista === 'grados' && (
            <div className="space-y-5">
              <div className="flex justify-end">
                <button onClick={abrirNuevoGrado} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 text-sm shadow-md">+ Nuevo Grado</button>
              </div>
              {gradosDelPeriodo.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <span className="text-5xl">🎒</span>
                  <p className="text-gray-500 mt-3 font-semibold">Sin grados aun</p>
                  <button onClick={abrirNuevoGrado} className="mt-4 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 shadow-md">+ Agregar grado</button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {gradosDelPeriodo.map((g, i) => {
                    const numMaterias = g.materias?.length || 0
                    const numEsts = g.materias?.reduce((a, m) => a + (m._count?.inscripciones || 0), 0) || 0
                    return (
                      <div key={g.id} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:border-purple-200 transition-all relative group">
                        <button onClick={() => { setGradoSel(g); setVista('materias') }} className="w-full text-left">
                          <div className="text-4xl mb-3">🎒</div>
                          <h3 className="text-xl font-bold text-gray-800 mb-1">{g.nombre}</h3>
                          <p className="text-gray-400 text-sm">{numMaterias + ' materias · ' + numEsts + ' estudiantes'}</p>
                        </button>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => abrirEditarGrado(g, e)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 shadow-sm text-sm">✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelGrado(g) }} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm text-sm">🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* MATERIAS */}
          {vista === 'materias' && (
            <div className="space-y-5">
              <div className="flex justify-end">
                <button onClick={abrirNuevaMateria} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 text-sm shadow-md">+ Nueva Materia</button>
              </div>
              {!gradoActual?.materias?.length ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <span className="text-5xl">📚</span>
                  <p className="text-gray-500 mt-3 font-semibold">Sin materias aun</p>
                  <button onClick={abrirNuevaMateria} className="mt-4 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 shadow-md">+ Agregar materia</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5">
                  {gradoActual.materias.map((m, i) => {
                    const c = COLS[i % COLS.length]
                    const clave = getClave(periodoSel?.id, gradoSel?.id, m.id)
                    const numActs = m._count?.actividades || 0
                    return (
                      <div key={m.id} className={c.bg + ' border-2 ' + c.border + ' rounded-2xl p-6 shadow-sm relative group'}>
                        <button onClick={() => seleccionarMateria(m)} className="w-full text-left">
                          <div className="text-4xl mb-3">{m.icono || m.icon || '📖'}</div>
                          <h3 className={'text-xl font-bold ' + c.text + ' mb-1'}>{m.nombre}</h3>
                          <p className="text-gray-500 text-sm">{numActs + ' actividades'}</p>
                        </button>
                        <div className="mt-4 pt-4 border-t border-white/50">
                          {clave ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Clave de matricula</p>
                                <p className={'font-bold text-lg tracking-widest ' + c.text}>{clave}</p>
                              </div>
                              <button onClick={() => { setClaveMateria(m); setClaveInput(clave); setShowModalClave(true) }}
                                className="text-xs bg-white/70 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors">Cambiar</button>
                            </div>
                          ) : (
                            <button onClick={() => { setClaveMateria(m); setClaveInput(''); setShowModalClave(true) }}
                              className={'w-full text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm ' + c.btn}>🔑 Crear clave de matricula</button>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => abrirEditarMateria(m, e)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 shadow-sm text-sm">✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelMateria(m) }} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm text-sm">🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ACTIVIDADES */}
          {vista === 'actividades' && (
            <div className="space-y-5">
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setShowModalAct(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 text-sm shadow-md">+ Nueva Actividad</button>
                <button onClick={abrirNuevoForo} className="bg-white border-2 border-purple-200 text-purple-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 text-sm">💬 Publicar foro</button>
                <button onClick={abrirNuevoQuiz} className="bg-white border-2 border-purple-200 text-purple-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 text-sm">❓ Crear quiz</button>
                <button onClick={() => { setClaveMateria(materiaSel); setClaveInput(claveActual || ''); setShowModalClave(true) }}
                  className="bg-white border-2 border-purple-200 text-purple-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 text-sm">
                  🔑 {claveActual ? 'Clave: ' + claveActual : 'Crear clave de matricula'}
                </button>
              </div>

              {foros.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Foros de discusión</p>
                  {foros.map(f => (
                    <div key={f.id} className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all group relative">
                      <button onClick={() => abrirForo(f)} className="w-full text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💬</div>
                          <div className="flex-1 min-w-0 pr-16">
                            <h4 className="font-bold text-gray-800 mb-1">{f.titulo}</h4>
                            {f.descripcion && <p className="text-xs text-gray-500 line-clamp-1">{f.descripcion}</p>}
                            <p className="text-xs text-gray-400 mt-0.5">{(f.publicaciones?.length || 0) + ' participaciones'}</p>
                          </div>
                        </div>
                      </button>
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => abrirEditarForo(f, e)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 shadow-sm text-sm border border-gray-100">✏️</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelForo(f) }} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm text-sm border border-gray-100">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {quizzes.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Quizzes</p>
                  {quizzes.map(q => (
                    <div key={q.id} className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all group relative">
                      <button onClick={() => { setQuizSel(q); setVista('quiz_detalle') }} className="w-full text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">❓</div>
                          <div className="flex-1 min-w-0 pr-16">
                            <h4 className="font-bold text-gray-800 mb-1">{q.titulo}</h4>
                            <p className="text-xs text-gray-400">{(q.preguntas?.length || 0) + ' preguntas · ' + (q.intentos?.length || 0) + ' resueltos'}</p>
                          </div>
                        </div>
                      </button>
                      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelQuiz(q) }} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm text-sm border border-gray-100">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Actividades</p>
              {loadingActs ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Cargando actividades...</p>
                </div>
              ) : actsActualesFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <span className="text-5xl">{searchQuery ? '🔍' : '📭'}</span>
                  <p className="text-gray-500 mt-3 font-semibold">{searchQuery ? 'Sin resultados para "' + searchQuery + '"' : 'Sin actividades aun'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actsActualesFiltradas.map(act => {
                    const ent = act.entregas?.filter(e => e.entregado).length || 0
                    const tot = act.entregas?.length || 0
                    const pct = tot > 0 ? Math.round((ent / tot) * 100) : 0
                    return (
                      <div key={act.id} className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all group relative">
                        <button onClick={() => { setActividadSel(act); setTabActiva('contenido'); setVista('actividad_detalle') }} className="w-full text-left">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📝</div>
                            <div className="flex-1 min-w-0 pr-16">
                              <h4 className="font-bold text-gray-800 mb-1">{act.titulo}</h4>
                              <p className="text-xs text-gray-400">{'⏰ ' + fmt(act.fechaLimite) + ' · ' + ent + '/' + tot + ' entregas'}</p>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                                <div className={'h-1.5 rounded-full ' + (pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: pct + '%' }} />
                              </div>
                            </div>
                            <span className={'text-sm font-bold ' + (pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-yellow-600')}>{pct}%</span>
                          </div>
                        </button>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => abrirEditarAct(act, e)} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-purple-600 hover:bg-purple-50 shadow-sm text-sm border border-gray-100">✏️</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmDelAct(act) }} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 shadow-sm text-sm border border-gray-100">🗑️</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* DETALLE ACTIVIDAD */}
          {vista === 'actividad_detalle' && actActual && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{actActual.titulo}</h3>
                {actActual.descripcion && <p className="text-gray-500 text-sm mb-3">{actActual.descripcion}</p>}
                <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                  {actActual.fechaInicio && <span>{'📅 ' + fmt(actActual.fechaInicio)}</span>}
                  <span>{'⏰ ' + fmt(actActual.fechaLimite)}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['contenido', 'entregas'].map(tab => (
                  <button key={tab} onClick={() => setTabActiva(tab)}
                    className={'px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ' + (tabActiva === tab ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200')}>
                    {tab === 'contenido' && '📋 Contenido'}
                    {tab === 'entregas' && ('📬 Entregas (' + (actActual.entregas?.filter(e => e.entregado).length || 0) + '/' + (actActual.entregas?.length || 0) + ')')}
                  </button>
                ))}
              </div>

              {tabActiva === 'contenido' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Contenido subido</h3></div>
                  {!actActual.contenidos?.length ? (
                    <div className="p-8 text-center text-gray-400">Sin contenidos</div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {actActual.contenidos.map((c, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                          <span className="text-2xl">{c.icono || c.icon || '📄'}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                            {c.texto && <p className="text-gray-600 text-sm mt-1">{c.texto}</p>}
                            {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-purple-600 text-sm hover:underline mt-1 block">{c.nombre || c.url}</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tabActiva === 'entregas' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-slate-50 border-b border-gray-100">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Nota</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Accion</th>
                    </tr></thead>
                    <tbody>
                      {actActual.entregas?.map((ent, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">{ent.estudiante?.nombre?.charAt(0) || '?'}</div>
                              <span className="font-semibold text-sm text-gray-800">{ent.estudiante?.nombre || 'Estudiante'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {(() => {
                              const vencio = new Date(actActual.fechaLimite) < new Date()
                              if (ent.entregado) return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">Entregado</span>
                              if (vencio) return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-red-100 text-red-700">No entregó</span>
                              return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-orange-100 text-orange-700">Pendiente</span>
                            })()}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {ent.calificacion != null
                              ? <span className={'font-bold text-sm ' + (ent.calificacion >= 7 ? 'text-green-600' : 'text-red-500')}>{ent.calificacion}/10</span>
                              : <span className="text-gray-400 text-xs">—</span>}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {ent.entregado && (
                              <button onClick={() => { setEstudianteSel({ id: ent.estudianteId, nombre: ent.estudiante?.nombre || 'Estudiante' }); setEntregaSel(ent); setNotaTemp(ent.calificacion ?? ''); setVista('calificar') }}
                                className="bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-200 transition-colors">
                                {ent.calificacion != null ? 'Ver/Editar' : 'Calificar'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* CALIFICAR */}
          {vista === 'calificar' && entregaSel && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-1">Entrega de {estudianteSel?.nombre}</h3>
                {entregaSel.texto && <div className="bg-slate-50 rounded-xl p-4 text-sm text-gray-700 mt-3">{entregaSel.texto}</div>}
                {entregaSel.archivoUrl && (
                  <a href={entregaSel.archivoUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 bg-purple-50 rounded-xl p-4 border border-purple-200 hover:bg-purple-100 transition-colors mt-3">
                    <span className="text-2xl">📎</span>
                    <div>
                      <p className="text-sm font-semibold text-purple-700">{entregaSel.archivoNombre || 'Archivo adjunto'}</p>
                      <p className="text-xs text-purple-500">Clic para descargar</p>
                    </div>
                  </a>
                )}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Asignar calificacion</h3>
                <div className="flex items-center gap-4">
                  <input type="number" min="0" max="10" step="0.5" value={notaTemp} onChange={e => setNotaTemp(e.target.value)}
                    placeholder="0.0" className="w-32 border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-purple-400 transition-all" />
                  <span className="text-gray-400">/ 10</span>
                  <button onClick={guardarNota} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md">Guardar Calificacion</button>
                </div>
              </div>
            </div>
          )}

          {/* DETALLE FORO */}
          {vista === 'foro_detalle' && foroActual && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💬</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{foroActual.titulo}</h3>
                    {foroActual.descripcion && <p className="text-gray-500 text-sm">{foroActual.descripcion}</p>}
                    <div className="flex gap-3 flex-wrap mt-2">
                      {foroActual.fechaInicio && <span className="text-xs px-3 py-1 rounded-lg border bg-purple-50 text-purple-600 border-purple-100">{'📅 Abre: ' + fmt(foroActual.fechaInicio)}</span>}
                      {foroActual.fechaLimite && <span className="text-xs px-3 py-1 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">{'⏰ Cierra: ' + fmt(foroActual.fechaLimite)}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Participaciones ({foroActual.publicaciones?.length || 0})
              </p>

              {!foroActual.publicaciones?.length ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <span className="text-5xl">💭</span>
                  <p className="text-gray-500 mt-3 font-semibold">Aún no hay participaciones</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {foroActual.publicaciones.map(pub => (
                    <div key={pub.id} className="bg-white rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                          {pub.estudiante?.nombre?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-800 text-sm">{pub.estudiante?.nombre || 'Estudiante'}</p>
                            <button onClick={() => setConfirmDelPub(pub)} className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">🗑️</button>
                          </div>
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

                          <div className="flex gap-2 mt-3">
                            <input
                              value={comentTemp[pub.id] || ''}
                              onChange={e => setComentTemp(p => ({ ...p, [pub.id]: e.target.value }))}
                              placeholder="Responder..."
                              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                              onKeyDown={e => { if (e.key === 'Enter') enviarComentario(pub.id) }}
                            />
                            <button onClick={() => enviarComentario(pub.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700">Enviar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DETALLE QUIZ (profesor) */}
          {vista === 'quiz_detalle' && quizActual && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">❓</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{quizActual.titulo}</h3>
                    {quizActual.descripcion && <p className="text-gray-500 text-sm">{quizActual.descripcion}</p>}
                    <p className="text-xs text-gray-400 mt-2">{(quizActual.preguntas?.length || 0) + ' preguntas'}</p>
                    <div className="flex gap-3 flex-wrap mt-2">
                      {quizActual.fechaInicio && <span className="text-xs px-3 py-1 rounded-lg border bg-purple-50 text-purple-600 border-purple-100">{'📅 Abre: ' + fmt(quizActual.fechaInicio)}</span>}
                      {quizActual.fechaLimite && <span className="text-xs px-3 py-1 rounded-lg border bg-orange-50 text-orange-600 border-orange-100">{'⏰ Cierra: ' + fmt(quizActual.fechaLimite)}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Resultados ({quizActual.intentos?.length || 0})
              </p>

              {!quizActual.intentos?.length ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <span className="text-5xl">📊</span>
                  <p className="text-gray-500 mt-3 font-semibold">Nadie ha resuelto el quiz aún</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-slate-50 border-b border-gray-100">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Intentos</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Mejor nota</th>
                    </tr></thead>
                    <tbody>
                      {[...quizActual.intentos].sort((a, b) => b.nota - a.nota).map((it, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-slate-50">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">{it.estudiante?.nombre?.charAt(0) || '?'}</div>
                              <span className="font-semibold text-sm text-gray-800">{it.estudiante?.nombre || 'Estudiante'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center text-gray-600 text-sm">{it.intentos}/2</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className={'font-bold text-sm ' + (it.nota >= 7 ? 'text-green-600' : 'text-red-500')}>{it.nota}/10</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PERIODO */}
      {showModalPeriodo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="font-black text-gray-900 text-xl mb-1">{editandoPeriodo ? 'Editar Periodo' : 'Nuevo Periodo'}</h3>
            <p className="text-gray-400 text-sm mb-6">Define el tipo, nombre y fechas</p>
            <div className="space-y-4">
              <div>
                <label className={lbl}>Tipo de periodo</label>
                <select value={formPeriodo.tipo} onChange={e => setFormPeriodo(p => ({ ...p, tipo: e.target.value }))} className={inp}>
                  {TIPO_PERIODO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Nombre o numero</label>
                <input value={formPeriodo.nombre} onChange={e => setFormPeriodo(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: 1, 2, Primero..." className={inp} autoFocus />
                {formPeriodo.nombre && <p className="text-xs text-purple-600 mt-1 font-semibold">Vista previa: {formPeriodo.tipo} — {formPeriodo.nombre}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Fecha inicio</label><input type="date" value={formPeriodo.fechaInicio} onChange={e => setFormPeriodo(p => ({ ...p, fechaInicio: e.target.value }))} className={inp} /></div>
                <div><label className={lbl}>Fecha fin</label><input type="date" value={formPeriodo.fechaFin} onChange={e => setFormPeriodo(p => ({ ...p, fechaFin: e.target.value }))} className={inp} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModalPeriodo(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={guardarPeriodo} disabled={!formPeriodo.nombre.trim()} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">
                {editandoPeriodo ? 'Guardar cambios' : 'Crear Periodo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GRADO */}
      {showModalGrado && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-gray-900 text-xl mb-1">{editandoGrado ? 'Editar Grado' : 'Nuevo Grado'}</h3>
            <p className="text-gray-400 text-sm mb-6">{periodoSel?.nombre}</p>
            <input value={formGrado.nombre} onChange={e => setFormGrado(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Grado 6, 7..." className={inp} autoFocus onKeyDown={e => { if (e.key === 'Enter') guardarGrado() }} />
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModalGrado(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={guardarGrado} disabled={!formGrado.nombre.trim()} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">{editandoGrado ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MATERIA */}
      {showModalMateria && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-gray-900 text-xl mb-1">{editandoMateria ? 'Editar Materia' : 'Nueva Materia'}</h3>
            <p className="text-gray-400 text-sm mb-5">{gradoSel?.nombre}</p>
            <input value={formMateria.nombre} onChange={e => setFormMateria(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Matematicas..." className={inp + ' mb-4'} autoFocus />
            <div className="mb-5">
              <label className={lbl}>Icono</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {ICONOS_MATERIA.map(ic => (
                  <button key={ic} onClick={() => setFormMateria(p => ({ ...p, icon: ic }))}
                    className={'text-2xl p-2 rounded-xl transition-all border-2 ' + (formMateria.icon === ic ? 'border-purple-400 bg-purple-50' : 'border-transparent hover:border-gray-200')}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModalMateria(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={guardarMateria} disabled={!formMateria.nombre.trim()} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">{editandoMateria ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLAVE */}
      {showModalClave && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-gray-900 text-lg mb-1">🔑 Clave de matricula</h3>
            <p className="text-gray-400 text-sm mb-5">{gradoSel?.nombre} · {claveMateria?.nombre}</p>
            <input value={claveInput} onChange={e => setClaveInput(e.target.value.toUpperCase().slice(0, 10))} placeholder="Ej: MAT6A" maxLength={10} autoFocus
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-center text-2xl font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-purple-400 mb-5 transition-all" />
            <div className="flex gap-3">
              <button onClick={() => { setShowModalClave(false); setClaveInput(''); setClaveMateria(null) }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={async () => { if (claveInput.trim() && claveMateria) { await setClave(periodoSel?.id, gradoSel?.id, claveMateria.id, claveInput.trim()); setShowModalClave(false); setClaveInput(''); setClaveMateria(null) } }}
                disabled={!claveInput.trim()} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">Guardar clave</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA ACTIVIDAD */}
      {showModalAct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-7 py-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-black text-gray-900 text-lg">Nueva Actividad</h3>
              <p className="text-gray-400 text-sm">{gradoSel?.nombre} · {materiaSel?.nombre}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-7 space-y-4">
              <div><label className={lbl}>Titulo *</label><input value={nuevaAct.titulo} onChange={e => setNuevaAct(p => ({ ...p, titulo: e.target.value }))} placeholder="Titulo de la actividad" className={inp} /></div>
              <div><label className={lbl}>Descripcion</label><textarea value={nuevaAct.descripcion} onChange={e => setNuevaAct(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Instrucciones..." className={inp + ' resize-none'} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Fecha inicio</label><input type="datetime-local" value={nuevaAct.fechaInicio} onChange={e => setNuevaAct(p => ({ ...p, fechaInicio: e.target.value }))} className={inp} /></div>
                <div><label className={lbl}>Fecha limite *</label><input type="datetime-local" value={nuevaAct.fechaLimite} onChange={e => setNuevaAct(p => ({ ...p, fechaLimite: e.target.value }))} className={inp} /></div>
              </div>
              {nuevaAct.contenidos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Contenidos ({nuevaAct.contenidos.length})</p>
                  {nuevaAct.contenidos.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      <span>{c.icon}</span>
                      <span className="text-sm text-gray-700 flex-1">{c.label}{c.nombre ? ' — ' + c.nombre : ''}</span>
                      <button onClick={() => setNuevaAct(p => ({ ...p, contenidos: p.contenidos.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Agregar contenido</p>
                {!tipoSel ? (
                  <div className="grid grid-cols-4 gap-2">
                    {TIPOS_CONTENIDO.map(t => (
                      <button key={t.id} onClick={() => setTipoSel(t)} className="bg-slate-50 hover:bg-purple-50 rounded-xl p-3 text-center transition-all border-2 border-transparent hover:border-purple-200">
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tipoSel.icon}</span>
                      <span className="font-semibold text-gray-800 text-sm">{tipoSel.label}</span>
                      <button onClick={() => { setTipoSel(null); setContTemp({ texto: '', url: '', archivo: null }); setPreguntas([]) }} className="ml-auto text-gray-400 hover:text-gray-600 text-sm">✕ Cancelar</button>
                    </div>
                    {['archivo', 'video_propio', 'imagen'].includes(tipoSel.id) && (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400" onClick={() => document.getElementById('fileInput').click()}>
                        <input id="fileInput" type="file" className="hidden" accept={tipoSel.accept} onChange={e => setContTemp(p => ({ ...p, archivo: e.target.files[0] }))} />
                        {contTemp.archivo ? <p className="text-purple-600 font-semibold text-sm">{'✅ ' + contTemp.archivo.name}</p> : <p className="text-gray-500 text-sm">Haz clic para seleccionar</p>}
                      </div>
                    )}
                    {['video_link', 'link'].includes(tipoSel.id) && (
                      <input type="url" value={contTemp.url} onChange={e => setContTemp(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className={inp + ' bg-white'} />
                    )}
                    {tipoSel.id === 'explicacion' && (
                      <textarea value={contTemp.texto} onChange={e => setContTemp(p => ({ ...p, texto: e.target.value }))} rows={4} placeholder="Escribe las instrucciones..." className={inp + ' resize-none bg-white'} />
                    )}
                    <button onClick={addContenido} disabled={subiendoCont} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">{subiendoCont ? '⏳ Subiendo...' : '✅ Agregar'}</button>
                  </div>
                )}
              </div>
            </div>
            <div className="px-7 py-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => { setShowModalAct(false); setNuevaAct({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' }); setTipoSel(null) }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={crearActividad} disabled={!nuevaAct.titulo || !nuevaAct.fechaLimite}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md disabled:opacity-40 text-sm">Crear Actividad</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ACTIVIDAD */}
      {editandoAct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-7 py-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-black text-gray-900 text-lg">Editar Actividad</h3>
              <p className="text-gray-400 text-sm">{materiaSel?.nombre}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-7 space-y-4">
              <div><label className={lbl}>Titulo *</label><input value={formEditAct.titulo} onChange={e => setFormEditAct(p => ({ ...p, titulo: e.target.value }))} placeholder="Titulo de la actividad" className={inp} autoFocus /></div>
              <div><label className={lbl}>Descripcion</label><textarea value={formEditAct.descripcion} onChange={e => setFormEditAct(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Instrucciones..." className={inp + ' resize-none'} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Fecha inicio</label><input type="datetime-local" value={formEditAct.fechaInicio} onChange={e => setFormEditAct(p => ({ ...p, fechaInicio: e.target.value }))} className={inp} /></div>
                <div><label className={lbl}>Fecha limite *</label><input type="datetime-local" value={formEditAct.fechaLimite} onChange={e => setFormEditAct(p => ({ ...p, fechaLimite: e.target.value }))} className={inp} /></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Contenidos</p>
                {(formEditAct.contenidos || []).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {formEditAct.contenidos.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                        <span>{c.icon || c.icono || '📄'}</span>
                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{c.label}{c.nombre ? ' — ' + c.nombre : ''}</span>
                        <button onClick={() => setFormEditAct(p => ({ ...p, contenidos: p.contenidos.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {!tipoSelEdit ? (
                  <div className="grid grid-cols-4 gap-2">
                    {TIPOS_CONTENIDO.map(t => (
                      <button key={t.id} onClick={() => setTipoSelEdit(t)} className="bg-slate-50 hover:bg-purple-50 rounded-xl p-3 text-center transition-all border-2 border-transparent hover:border-purple-200">
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <p className="text-xs font-semibold text-gray-700">{t.label}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tipoSelEdit.icon}</span>
                      <span className="font-semibold text-gray-800 text-sm">{tipoSelEdit.label}</span>
                      <button onClick={() => { setTipoSelEdit(null); setContTempEdit({ texto: '', url: '', archivo: null }) }} className="ml-auto text-gray-400 hover:text-gray-600 text-sm">✕ Cancelar</button>
                    </div>
                    {['archivo', 'video_propio', 'imagen'].includes(tipoSelEdit.id) && (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400" onClick={() => document.getElementById('fileInputEdit').click()}>
                        <input id="fileInputEdit" type="file" className="hidden" accept={tipoSelEdit.accept} onChange={e => setContTempEdit(p => ({ ...p, archivo: e.target.files[0] }))} />
                        {contTempEdit.archivo ? <p className="text-purple-600 font-semibold text-sm">{'✅ ' + contTempEdit.archivo.name}</p> : <p className="text-gray-500 text-sm">Haz clic para seleccionar</p>}
                      </div>
                    )}
                    {['video_link', 'link'].includes(tipoSelEdit.id) && (
                      <input type="url" value={contTempEdit.url} onChange={e => setContTempEdit(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className={inp + ' bg-white'} />
                    )}
                    {tipoSelEdit.id === 'explicacion' && (
                      <textarea value={contTempEdit.texto} onChange={e => setContTempEdit(p => ({ ...p, texto: e.target.value }))} rows={4} placeholder="Escribe las instrucciones..." className={inp + ' resize-none bg-white'} />
                    )}
                    <button onClick={addContenidoEdit} disabled={subiendoContEdit} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">{subiendoContEdit ? '⏳ Subiendo...' : '✅ Agregar'}</button>
                  </div>
                )}
              </div>
            </div>
            <div className="px-7 py-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setEditandoAct(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={guardarEditAct} disabled={!formEditAct.titulo || !formEditAct.fechaLimite} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR/EDITAR FORO */}
      {showModalForo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="px-7 py-5 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-lg">{editandoForo ? 'Editar foro' : 'Publicar foro'}</h3>
              <p className="text-gray-400 text-sm">{materiaSel?.nombre}</p>
            </div>
            <div className="p-7 space-y-4">
              <div><label className={lbl}>Tema del foro *</label><input value={formForo.titulo} onChange={e => setFormForo(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej: Debate sobre el cambio climatico" className={inp} autoFocus /></div>
              <div><label className={lbl}>Descripcion / consigna</label><textarea value={formForo.descripcion} onChange={e => setFormForo(p => ({ ...p, descripcion: e.target.value }))} rows={3} placeholder="Explica de que trata el foro y que deben responder..." className={inp + ' resize-none'} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Fecha de inicio (opcional)</label><input type="datetime-local" value={formForo.fechaInicio} onChange={e => setFormForo(p => ({ ...p, fechaInicio: e.target.value }))} className={inp} /></div>
                <div><label className={lbl}>Fecha limite (opcional)</label><input type="datetime-local" value={formForo.fechaLimite} onChange={e => setFormForo(p => ({ ...p, fechaLimite: e.target.value }))} className={inp} /></div>
              </div>
            </div>
            <div className="px-7 py-5 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModalForo(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={guardarForo} disabled={!formForo.titulo.trim()} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">{editandoForo ? 'Guardar cambios' : 'Publicar foro'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR QUIZ */}
      {showModalQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-7 py-5 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-black text-gray-900 text-lg">Crear quiz</h3>
              <p className="text-gray-400 text-sm">{materiaSel?.nombre}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-7 space-y-4">
              <div><label className={lbl}>Titulo del quiz *</label><input value={formQuiz.titulo} onChange={e => setFormQuiz(p => ({ ...p, titulo: e.target.value }))} placeholder="Ej: Quiz de fracciones" className={inp} autoFocus /></div>
              <div><label className={lbl}>Descripcion</label><textarea value={formQuiz.descripcion} onChange={e => setFormQuiz(p => ({ ...p, descripcion: e.target.value }))} rows={2} placeholder="Instrucciones del quiz..." className={inp + ' resize-none'} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Fecha de inicio (opcional)</label><input type="datetime-local" value={formQuiz.fechaInicio} onChange={e => setFormQuiz(p => ({ ...p, fechaInicio: e.target.value }))} className={inp} /></div>
                <div><label className={lbl}>Fecha limite (opcional)</label><input type="datetime-local" value={formQuiz.fechaLimite} onChange={e => setFormQuiz(p => ({ ...p, fechaLimite: e.target.value }))} className={inp} /></div>
              </div>

              {preguntasQuiz.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Preguntas agregadas ({preguntasQuiz.length})</p>
                  {preguntasQuiz.map((p, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-800 text-sm">{(i + 1) + '. ' + p.texto}</p>
                        <button onClick={() => setPreguntasQuiz(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                      </div>
                      <div className="mt-2 space-y-1">
                        {p.opciones.map((o, j) => (
                          <p key={j} className={'text-xs ' + (j === p.correcta ? 'text-green-600 font-semibold' : 'text-gray-500')}>
                            {(j === p.correcta ? '✓ ' : '• ') + o}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-purple-50 rounded-xl p-5 space-y-3 border border-purple-100">
                <p className="text-sm font-semibold text-purple-800">Nueva pregunta</p>
                <input value={pregTemp.texto} onChange={e => setPregTemp(p => ({ ...p, texto: e.target.value }))} placeholder="Escribe la pregunta..." className={inp + ' bg-white'} />
                <p className="text-xs text-gray-500 font-semibold">Opciones (marca la correcta)</p>
                {pregTemp.opciones.map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correcta" checked={pregTemp.correcta === i} onChange={() => setPregTemp(p => ({ ...p, correcta: i }))} className="w-4 h-4 accent-purple-600 flex-shrink-0" />
                    <input value={o} onChange={e => setPregTemp(p => { const ops = [...p.opciones]; ops[i] = e.target.value; return { ...p, opciones: ops } })} placeholder={'Opcion ' + (i + 1)} className={inp + ' bg-white'} />
                  </div>
                ))}
                <button onClick={agregarPregunta} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700">+ Agregar pregunta</button>
              </div>
            </div>
            <div className="px-7 py-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setShowModalQuiz(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={guardarQuiz} disabled={!formQuiz.titulo.trim() || preguntasQuiz.length === 0} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">Crear quiz</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR FORO */}
      {confirmDelForo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="font-black text-gray-900 text-xl mt-3 mb-2">Eliminar foro</h3>
            <p className="text-gray-500 text-sm mb-6">Vas a eliminar <span className="font-bold text-gray-800">{confirmDelForo.titulo}</span>. Se borrarán todas las participaciones y comentarios. Esta accion no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelForo(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={confirmarEliminarForo} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-md text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR PUBLICACION */}
      {confirmDelPub && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <span className="text-5xl">⚠️</span>
              <h3 className="font-black text-gray-900 text-xl mt-3 mb-2">Eliminar participación</h3>
              <p className="text-gray-500 text-sm mb-4">Vas a eliminar la participación de <span className="font-bold text-gray-800">{confirmDelPub.estudiante?.nombre || 'el estudiante'}</span>. Se le notificará para que pueda volver a participar.</p>
            </div>
            <div className="mb-4">
              <label className={lbl}>Motivo (opcional)</label>
              <input value={motivoDel} onChange={e => setMotivoDel(e.target.value)} placeholder="Ej: lenguaje inapropiado" className={inp} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmDelPub(null); setMotivoDel('') }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={confirmarEliminarPub} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-md text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR QUIZ */}
      {confirmDelQuiz && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="font-black text-gray-900 text-xl mt-3 mb-2">Eliminar quiz</h3>
            <p className="text-gray-500 text-sm mb-6">Vas a eliminar <span className="font-bold text-gray-800">{confirmDelQuiz.titulo}</span>. Se borrarán sus preguntas y los resultados de los estudiantes. Esta accion no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelQuiz(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={confirmarEliminarQuiz} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-md text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR ACTIVIDAD */}
      {confirmDelAct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="font-black text-gray-900 text-xl mt-3 mb-2">Eliminar actividad</h3>
            <p className="text-gray-500 text-sm mb-6">Vas a eliminar <span className="font-bold text-gray-800">{confirmDelAct.titulo}</span>. Se borraran tambien sus entregas, calificaciones y foro. Esta accion no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelAct(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={confirmarEliminarAct} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-md text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {(confirmDelPeriodo || confirmDelGrado || confirmDelMateria) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <span className="text-5xl">⚠️</span>
            <h3 className="font-black text-gray-900 text-xl mt-3 mb-2">Eliminar</h3>
            <p className="text-gray-500 text-sm mb-6">Vas a eliminar <span className="font-bold text-gray-800">{confirmDelPeriodo?.nombre || confirmDelGrado?.nombre || confirmDelMateria?.nombre}</span>. Esta accion no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => { setConfirmDelPeriodo(null); setConfirmDelGrado(null); setConfirmDelMateria(null) }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
              <button onClick={async () => {
                if (confirmDelPeriodo) { await eliminarPeriodo(confirmDelPeriodo.id); setConfirmDelPeriodo(null) }
                if (confirmDelGrado) { await eliminarGrado(confirmDelGrado.id); setConfirmDelGrado(null) }
                if (confirmDelMateria) { await eliminarMateria(confirmDelMateria.id); setConfirmDelMateria(null) }
              }} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-md text-sm">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
