import { useState } from 'react'
import { useProfesor } from '../../context/ProfesorContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import { useSearchParams } from 'react-router-dom'

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
  { id: 'quiz',         icon: '❓', label: 'Quiz' },
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
  const [tipoSel, setTipoSel] = useState(null)
  const [contTemp, setContTemp] = useState({ texto: '', url: '', archivo: null })
  const [preguntas, setPreguntas] = useState([])

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
    setLoadingActs(false); setVista('actividades')
  }

  const addContenido = () => {
    if (!tipoSel) return
    let c = { tipo: tipoSel.id, label: tipoSel.label, icon: tipoSel.icon }
    if (tipoSel.id === 'quiz') { if (!preguntas.length) return; c = { ...c, preguntas } }
    else if (tipoSel.id === 'explicacion') { if (!contTemp.texto) return; c = { ...c, texto: contTemp.texto } }
    else if (['video_link', 'link'].includes(tipoSel.id)) { if (!contTemp.url) return; c = { ...c, url: contTemp.url } }
    else if (['archivo', 'video_propio', 'imagen'].includes(tipoSel.id)) {
      if (!contTemp.archivo) return
      c = { ...c, nombre: contTemp.archivo.name, url: URL.createObjectURL(contTemp.archivo) }
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

  const guardarNota = async () => {
    const n = parseFloat(notaTemp)
    if (isNaN(n) || n < 0 || n > 10) return
    try {
      await calificarEntrega(periodoSel.id, gradoSel.id, materiaSel.id, actividadSel.id, estudianteSel.id, n)
      setVista('actividad_detalle'); setEntregaSel(null); setEstudianteSel(null); setNotaTemp('')
    } catch { alert('Error guardando nota') }
  }

  const volver = () => {
    const mapa = { calificar: 'actividad_detalle', actividad_detalle: 'actividades', actividades: 'materias', materias: 'grados', grados: 'periodos' }
    if (vista === 'actividad_detalle') setTabActiva('contenido')
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
                    const c = COLS[i % COLS.length]
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
                <button onClick={() => { setClaveMateria(materiaSel); setClaveInput(claveActual || ''); setShowModalClave(true) }}
                  className="bg-white border-2 border-purple-200 text-purple-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-50 text-sm">
                  🔑 {claveActual ? 'Clave: ' + claveActual : 'Crear clave de matricula'}
                </button>
              </div>
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
                      <button key={act.id} onClick={() => { setActividadSel(act); setTabActiva('contenido'); setVista('actividad_detalle') }}
                        className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-purple-200 transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📝</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 mb-1">{act.titulo}</h4>
                            <p className="text-xs text-gray-400">{'⏰ ' + fmt(act.fechaLimite) + ' · ' + ent + '/' + tot + ' entregas'}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                              <div className={'h-1.5 rounded-full ' + (pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: pct + '%' }} />
                            </div>
                          </div>
                          <span className={'text-sm font-bold ' + (pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-yellow-600')}>{pct}%</span>
                        </div>
                      </button>
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
                            <span className={'text-xs px-3 py-1 rounded-full font-semibold ' + (ent.entregado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                              {ent.entregado ? 'Entregado' : 'Pendiente'}
                            </span>
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
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={nuevaAct.foroActivo} onChange={e => setNuevaAct(p => ({ ...p, foroActivo: e.target.checked, soloForo: e.target.checked ? p.soloForo : false }))} className="w-4 h-4 accent-purple-600" />
                  <span className="font-semibold text-gray-700 text-sm">💬 Activar foro de discusion</span>
                </label>
                {nuevaAct.foroActivo && (
                  <div className="mt-3 space-y-2">
                    <input value={nuevaAct.foroTema} onChange={e => setNuevaAct(p => ({ ...p, foroTema: e.target.value }))} placeholder="Tema del foro" className={inp + ' bg-white'} />
                    <input type="date" value={nuevaAct.foroFechaLimite} onChange={e => setNuevaAct(p => ({ ...p, foroFechaLimite: e.target.value }))} className={inp + ' bg-white'} />
                    <label className="flex items-center gap-3 cursor-pointer bg-white rounded-xl p-3 border border-purple-100">
                      <input type="checkbox" checked={nuevaAct.soloForo} onChange={e => setNuevaAct(p => ({ ...p, soloForo: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                      <span className="text-gray-700 text-sm">📌 Esta actividad es <span className="font-semibold">solo participar en el foro</span> (sin entrega de archivo)</span>
                    </label>
                  </div>
                )}
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
                    <button onClick={addContenido} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700">✅ Agregar</button>
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