// frontend/src/pages/teacher/Periodos.jsx
import { useState } from 'react'
import TeacherSidebar from '../../components/TeacherSidebar'
import { useProfesor } from '../../context/ProfesorContext'
import { useAuth } from '../../context/AuthContext'

const TIPOS_CONTENIDO = [
  { id: 'archivo', icon: '📄', label: 'Documento', sub: 'PDF, Word, Excel', accept: '.pdf,.doc,.docx,.xls,.xlsx' },
  { id: 'imagen', icon: '🖼️', label: 'Imagen', sub: 'JPG, PNG, GIF', accept: 'image/*' },
  { id: 'video_link', icon: '🎥', label: 'Video YouTube', sub: 'Enlace de YouTube' },
  { id: 'video_propio', icon: '📹', label: 'Video propio', sub: 'Sube tu video', accept: 'video/*' },
  { id: 'quiz', icon: '❓', label: 'Quiz', sub: 'Preguntas y respuestas' },
  { id: 'explicacion', icon: '📋', label: 'Instrucciones', sub: 'Texto libre' },
  { id: 'link', icon: '🔗', label: 'Enlace', sub: 'Link externo o juego' },
]

const fmt = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const Periodos = () => {
  const { periodos, grados, estudiantes, getActividades, agregarActividad, calificarEntrega, comentarForo, setClave, getClave, agregarGrado, agregarMateria } = useProfesor()
  const { usuario } = useAuth()

  const [vista, setVista] = useState('periodos')
  const [periodoSel, setPeriodoSel] = useState(null)
  const [gradoSel, setGradoSel] = useState(null)
  const [materiaSel, setMateriaSel] = useState(null)
  const [actividadSel, setActividadSel] = useState(null)
  const [estudianteSel, setEstudianteSel] = useState(null)
  const [entregaSel, setEntregaSel] = useState(null)
  const [tabActiva, setTabActiva] = useState('contenido')
  const [foroEstSel, setForoEstSel] = useState(null)
  const [comentarioTemp, setComentarioTemp] = useState('')

  // Modal actividad
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevaAct, setNuevaAct] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' })
  const [tipoSel, setTipoSel] = useState(null)
  const [contenidoTemp, setContenidoTemp] = useState({ texto: '', url: '', archivo: null })
  const [preguntas, setPreguntas] = useState([])
  const [nuevaPregunta, setNuevaPregunta] = useState({ texto: '', opciones: ['', '', '', ''], correcta: 0 })
  const [notaTemp, setNotaTemp] = useState('')

  // Clave matrícula
  const [mostrarClave, setMostrarClave] = useState(false)
  const [claveInput, setClaveInput] = useState('')
  const [claveGuardada, setClaveGuardada] = useState(false)
  // Clave rápida desde tarjeta de materia
  const [claveRapidaMateria, setClaveRapidaMateria] = useState(null) // { periodoId, gradoId, materiaId, nombre }
  const [claveRapidaInput, setClaveRapidaInput] = useState('')
  // Modal nuevo grado
  const [mostrarModalGrado, setMostrarModalGrado] = useState(false)
  const [nuevoGradoNombre, setNuevoGradoNombre] = useState('')
  // Modal nueva materia
  const [mostrarModalMateria, setMostrarModalMateria] = useState(false)
  const [nuevaMateriaNombre, setNuevaMateriaNombre] = useState('')
  const [nuevaMateriaIcon, setNuevaMateriaIcon] = useState('📖')

  const actividadesActuales = periodoSel && gradoSel && materiaSel
    ? getActividades(periodoSel.id, gradoSel.id, materiaSel.id) : []
  const estudiantesGrado = gradoSel ? (estudiantes[gradoSel.id] || []) : []
  const actividadActual = actividadSel ? actividadesActuales.find(a => a.id === actividadSel.id) || actividadSel : null
  const claveActual = periodoSel && gradoSel && materiaSel ? getClave(periodoSel.id, gradoSel.id, materiaSel.id) : null

  const handleVolver = () => {
    const mapa = { calificar: 'actividad_detalle', foro_estudiante: 'actividad_detalle', estudiante: 'actividades', actividad_detalle: 'actividades', actividades: 'materias', materias: 'grados', grados: 'periodos' }
    if (vista === 'calificar') { setEntregaSel(null); setNotaTemp('') }
    if (vista === 'foro_estudiante') { setForoEstSel(null); setComentarioTemp('') }
    if (vista === 'estudiante') setEstudianteSel(null)
    if (vista === 'actividad_detalle') setTabActiva('contenido')
    if (vista === 'actividades') { setMateriaSel(null); setClaveGuardada(false) }
    if (vista === 'materias') setGradoSel(null)
    if (vista === 'grados') setPeriodoSel(null)
    setVista(mapa[vista] || 'periodos')
  }

  const agregarContenido = () => {
    if (!tipoSel) return
    let c = { tipo: tipoSel.id, label: tipoSel.label, icon: tipoSel.icon }
    if (tipoSel.id === 'quiz') { if (preguntas.length === 0) return; c = { ...c, preguntas } }
    else if (tipoSel.id === 'explicacion') { if (!contenidoTemp.texto) return; c = { ...c, texto: contenidoTemp.texto } }
    else if (['video_link', 'link'].includes(tipoSel.id)) { if (!contenidoTemp.url) return; c = { ...c, url: contenidoTemp.url } }
    else if (['archivo', 'video_propio', 'imagen'].includes(tipoSel.id)) { if (!contenidoTemp.archivo) return; c = { ...c, nombre: contenidoTemp.archivo.name, url: URL.createObjectURL(contenidoTemp.archivo) } }
    setNuevaAct(p => ({ ...p, contenidos: [...p.contenidos, c] }))
    setTipoSel(null); setContenidoTemp({ texto: '', url: '', archivo: null }); setPreguntas([])
  }

  const agregarPregunta = () => {
    if (!nuevaPregunta.texto || nuevaPregunta.opciones.some(o => !o)) return
    setPreguntas(p => [...p, { ...nuevaPregunta, id: Date.now() }])
    setNuevaPregunta({ texto: '', opciones: ['', '', '', ''], correcta: 0 })
  }

  const crearActividad = () => {
    if (!nuevaAct.titulo || !nuevaAct.fechaLimite) return
    agregarActividad(periodoSel.id, gradoSel.id, materiaSel.id, nuevaAct)
    setNuevaAct({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' })
    setMostrarModal(false); setTipoSel(null)
  }

  const guardarNota = () => {
    const n = parseFloat(notaTemp)
    if (isNaN(n) || n < 0 || n > 10) return
    calificarEntrega(periodoSel.id, gradoSel.id, materiaSel.id, actividadSel.id, estudianteSel.id, n)
    setVista('actividad_detalle'); setEntregaSel(null); setEstudianteSel(null); setNotaTemp('')
  }

  const guardarClave = () => {
    if (!claveInput.trim()) return
    setClave(periodoSel.id, gradoSel.id, materiaSel.id, claveInput.trim())
    setClaveGuardada(true); setMostrarClave(false); setClaveInput('')
  }

  const guardarClaveRapida = () => {
    if (!claveRapidaInput.trim() || !claveRapidaMateria) return
    setClave(claveRapidaMateria.periodoId, claveRapidaMateria.gradoId, claveRapidaMateria.materiaId, claveRapidaInput.trim())
    setClaveRapidaMateria(null); setClaveRapidaInput('')
  }

  const crearGrado = () => {
    if (!nuevoGradoNombre.trim()) return
    agregarGrado(nuevoGradoNombre.trim())
    setNuevoGradoNombre(''); setMostrarModalGrado(false)
  }

  const crearMateria = () => {
    if (!nuevaMateriaNombre.trim() || !gradoSel) return
    agregarMateria(gradoSel.id, nuevaMateriaNombre.trim(), nuevaMateriaIcon)
    setNuevaMateriaNombre(''); setNuevaMateriaIcon('📖'); setMostrarModalMateria(false)
  }

  const enviarComentario = (estudianteId) => {
    if (!comentarioTemp.trim()) return
    comentarForo(periodoSel.id, gradoSel.id, materiaSel.id, actividadSel.id, estudianteId, comentarioTemp, usuario?.id, usuario?.nombre)
    setComentarioTemp('')
  }

  const tituloVista = { periodos: 'Periodos Académicos 📅', grados: `${periodoSel?.nombre} — Grados`, materias: `${gradoSel?.nombre} — Materias`, actividades: materiaSel?.nombre, actividad_detalle: actividadActual?.titulo, estudiante: estudianteSel?.nombre, calificar: `Calificar — ${estudianteSel?.nombre}`, foro_estudiante: `Foro — ${foroEstSel?.nombre}` }
  const subtituloVista = { periodos: 'Selecciona un periodo', grados: 'Selecciona un grado', materias: 'Selecciona una materia', actividades: `${actividadesActuales.length} actividades · ${estudiantesGrado.length} estudiantes`, actividad_detalle: `${actividadActual?.contenidos?.length || 0} contenidos`, estudiante: estudianteSel?.email, calificar: 'Revisa y califica', foro_estudiante: actividadActual?.foro?.tema }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <TeacherSidebar />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div style={{ background: "#1C1535" }} className="shadow-sm px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {vista !== 'periodos' && (
              <button onClick={handleVolver} className="w-8 h-8 bg-[#F5F6FA] rounded-xl flex items-center justify-center text-[rgba(156,163,175,0.7)] hover:bg-[#EDE7FF] hover:text-purple-600 transition-all">←</button>
            )}
            <div>
              <h2 className="text-xl font-bold text-[#E5E7EB]">{tituloVista[vista]}</h2>
              <p className="text-[rgba(156,163,175,0.7)] text-sm">{subtituloVista[vista]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {periodoSel && <span className="bg-[#EDE7FF] text-purple-600 px-2 py-1 rounded-lg font-medium">{periodoSel.nombre}</span>}
            {gradoSel && <><span className="text-gray-300">›</span><span className="bg-[#D6E8FF] text-blue-600 px-2 py-1 rounded-lg font-medium">{gradoSel.nombre}</span></>}
            {materiaSel && <><span className="text-gray-300">›</span><span className="bg-[#DDF7E9] text-green-600 px-2 py-1 rounded-lg font-medium">{materiaSel.nombre}</span></>}
            {actividadActual && <><span className="text-gray-300">›</span><span className="bg-[#FFF4CC] text-yellow-600 px-2 py-1 rounded-lg font-medium truncate max-w-32">{actividadActual.titulo}</span></>}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">

          {/* PERIODOS */}
          {vista === 'periodos' && (
            <div className="grid grid-cols-2 gap-6">
              {periodos.map(p => (
                <button key={p.id} onClick={() => { setPeriodoSel(p); setVista('grados') }}
                  className={`${p.color} border-2 ${p.border} rounded-2xl p-8 text-left hover:scale-105 transition-all shadow-sm group`}>
                  <div className="text-5xl mb-4">{p.icon}</div>
                  <h3 className={`text-2xl font-bold ${p.text} mb-1`}>{p.nombre}</h3>
                  <p className="text-[rgba(156,163,175,0.7)] text-sm">{p.fechas}</p>
                  <div className={`mt-4 flex items-center gap-2 ${p.text} text-sm font-medium`}>
                    <span>Ver grados</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* GRADOS */}
          {vista === 'grados' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setMostrarModalGrado(true)}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm shadow-md">
                  <span>+</span><span>Nuevo Grado</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6">
              {grados.map(g => (
                <button key={g.id} onClick={() => { setGradoSel(g); setVista('materias') }}
                  style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 text-left hover:scale-105 transition-all shadow-sm border-2 border-[rgba(124,58,237,0.15)] hover:border-purple-200 group">
                  <div className="text-5xl mb-4">{g.icon}</div>
                  <h3 className="text-2xl font-bold text-[#E5E7EB] mb-1">{g.nombre}</h3>
                  <p className="text-[rgba(156,163,175,0.5)] text-sm">{g.materias.length} materia{g.materias.length > 1 ? 's' : ''} · {(estudiantes[g.id] || []).length} estudiantes</p>
                  <div className="mt-4 flex items-center gap-2 text-purple-600 text-sm font-medium">
                    <span>Ver materias</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
              </div>
            </div>
          )}

          {/* MATERIAS */}
          {vista === 'materias' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setMostrarModalMateria(true)}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm shadow-md">
                  <span>+</span><span>Nueva Materia</span>
                </button>
              </div>
              {gradoSel?.materias.length === 0 ? (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-12 text-center shadow-sm border border-[rgba(124,58,237,0.15)]">
                  <span className="text-5xl">📚</span>
                  <p className="text-[rgba(156,163,175,0.7)] mt-3 font-medium">Sin materias aún</p>
                  <p className="text-[rgba(156,163,175,0.5)] text-sm mt-1">Crea la primera con el botón de arriba</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                {gradoSel?.materias.map((m, i) => {
                  const colors = [{ bg: 'bg-[#EDE7FF]', text: 'text-purple-700', border: 'border-purple-200', btn: 'bg-purple-600 hover:bg-purple-700' }, { bg: 'bg-[#D6E8FF]', text: 'text-blue-700', border: 'border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700' }]
                  const c = colors[i % 2]
                  const count = getActividades(periodoSel?.id, gradoSel?.id, m.id).length
                  const clave = getClave(periodoSel?.id, gradoSel?.id, m.id)
                  return (
                    <div key={m.id} className={`${c.bg} border-2 ${c.border} rounded-2xl p-6 shadow-sm`}>
                      <button onClick={() => { setMateriaSel(m); setVista('actividades') }} className="w-full text-left group">
                        <div className="text-5xl mb-3">{m.icon}</div>
                        <h3 className={`text-xl font-bold ${c.text} mb-1`}>{m.nombre}</h3>
                        <p className="text-[rgba(156,163,175,0.7)] text-sm">{count} actividades en {periodoSel?.nombre}</p>
                        <div className={`mt-3 flex items-center gap-2 ${c.text} text-sm font-medium`}>
                          <span>Ver actividades</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </button>
                      {/* Clave visible y botón directo */}
                      <div className="mt-4 pt-4 border-t border-white border-opacity-60">
                        {clave ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-[rgba(156,163,175,0.7)] mb-0.5">Clave de matrícula</p>
                              <p className={`font-bold text-lg tracking-widest ${c.text}`}>{clave}</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setClaveRapidaMateria({ periodoId: periodoSel.id, gradoId: gradoSel.id, materiaId: m.id, nombre: m.nombre }); setClaveRapidaInput(clave) }}
                              className="text-xs bg-white bg-opacity-70 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors">
                              ✏️ Cambiar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setClaveRapidaMateria({ periodoId: periodoSel.id, gradoId: gradoSel.id, materiaId: m.id, nombre: m.nombre }); setClaveRapidaInput('') }}
                            className={`w-full text-white text-sm font-medium py-2 rounded-xl transition-colors ${c.btn}`}>
                            🔑 Crear clave de matrícula
                          </button>
                        )}
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
            <div className="space-y-6">
              {/* Barra de acciones */}
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => setMostrarModal(true)} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                  <span>+</span><span>Nueva Actividad</span>
                </button>
                <button onClick={() => setMostrarClave(true)}
                  style={{ background: "#1C1535" }} className="border-2 border-purple-200 text-purple-700 px-6 py-3 rounded-xl font-medium hover:bg-[#EDE7FF] transition-colors flex items-center gap-2">
                  <span>🔑</span>
                  <span>{claveActual ? `Clave: ${claveActual}` : 'Crear clave de matrícula'}</span>
                </button>
              </div>

              {/* Lista actividades */}
              {actividadesActuales.length === 0 ? (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-12 text-center shadow-sm">
                  <span className="text-5xl">📭</span>
                  <p className="text-[rgba(156,163,175,0.7)] mt-3 font-medium">Sin actividades aún</p>
                  <p className="text-[rgba(156,163,175,0.5)] text-sm mt-1">Crea la primera con el botón de arriba</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actividadesActuales.map(act => {
                    const ent = act.entregas.filter(e => e.entregado).length
                    const tot = act.entregas.length
                    const pct = tot > 0 ? Math.round((ent / tot) * 100) : 0
                    const foroResp = act.foro ? act.foro.respuestas.filter(r => r.respuesta).length : 0
                    return (
                      <button key={act.id} onClick={() => { setActividadSel(act); setTabActiva('contenido'); setVista('actividad_detalle') }}
                        className="w-full bg-[#1C1535] rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] hover:border-[rgba(124,58,237,0.4)] transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#EDE7FF] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📝</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-bold text-[#E5E7EB]">{act.titulo}</h4>
                              <span className="text-xs bg-[#EDE7FF] text-purple-600 px-2 py-0.5 rounded-full">{act.contenidos?.length || 0} contenidos</span>
                              {act.foro && <span className="text-xs bg-[#DDF7E9] text-green-600 px-2 py-0.5 rounded-full">💬 Foro · {foroResp}/{tot} resp.</span>}
                            </div>
                            <div className="flex gap-4 text-xs text-[rgba(156,163,175,0.5)]">
                              {act.fechaInicio && <span>📅 {act.fechaInicio}</span>}
                              <span>⏰ {act.fechaLimite}</span>
                              <span>📬 {ent}/{tot} entregas</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                              <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-gray-300 group-hover:text-purple-400">→</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Estudiantes */}
              <div>
                <h3 className="font-bold text-[#E5E7EB] text-lg mb-4">Estudiantes matriculados</h3>
                {estudiantesGrado.length === 0 ? (
                  <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-10 text-center shadow-sm">
                    <span className="text-4xl">👨🎓</span>
                    <p className="text-[rgba(156,163,175,0.5)] mt-2 text-sm">Sin estudiantes. Comparte la clave de matrícula o agrégalos desde Estudiantes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {estudiantesGrado.map(est => {
                      const entregas = actividadesActuales.map(act => act.entregas.find(e => e.estudianteId === est.id))
                      const entregadas = entregas.filter(e => e?.entregado).length
                      const califs = entregas.filter(e => e?.calificacion != null)
                      const prom = califs.length > 0 ? (califs.reduce((a, e) => a + e.calificacion, 0) / califs.length).toFixed(1) : null
                      return (
                        <button key={est.id} onClick={() => { setEstudianteSel(est); setVista('estudiante') }}
                          className="w-full bg-[#1C1535] rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] hover:border-[rgba(124,58,237,0.4)] transition-all text-left flex items-center gap-4 group">
                          <div className="w-10 h-10 bg-[#EDE7FF] rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">{est.nombre.charAt(0)}</div>
                          <div className="flex-1"><p className="font-bold text-[#E5E7EB] text-sm">{est.nombre}</p><p className="text-[rgba(156,163,175,0.5)] text-xs">{est.email}</p></div>
                          <div className="flex gap-6 text-center">
                            <div><p className="font-bold text-purple-600">{entregadas}/{actividadesActuales.length}</p><p className="text-xs text-[rgba(156,163,175,0.5)]">Entregas</p></div>
                            <div><p className={`font-bold ${prom >= 7 ? 'text-green-600' : prom ? 'text-yellow-600' : 'text-[rgba(156,163,175,0.5)]'}`}>{prom ? `${prom}/10` : 'S/N'}</p><p className="text-xs text-[rgba(156,163,175,0.5)]">Promedio</p></div>
                          </div>
                          <span className="text-gray-300 group-hover:text-purple-400">→</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DETALLE ACTIVIDAD */}
          {vista === 'actividad_detalle' && actividadActual && (
            <div className="space-y-6">
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm">
                <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">{actividadActual.titulo}</h3>
                {actividadActual.descripcion && <p className="text-[rgba(156,163,175,0.7)] text-sm mb-3">{actividadActual.descripcion}</p>}
                <div className="flex gap-4 text-xs text-[rgba(156,163,175,0.5)] flex-wrap">
                  {actividadActual.fechaInicio && <span>📅 Inicio: {actividadActual.fechaInicio}</span>}
                  <span>⏰ Límite: {actividadActual.fechaLimite}</span>
                  {actividadActual.foro && <span className="text-green-600 font-medium">💬 Foro: {actividadActual.foro.tema}</span>}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {['contenido', 'entregas', ...(actividadActual.foro ? ['foro'] : [])].map(tab => (
                  <button key={tab} onClick={() => setTabActiva(tab)}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${tabActiva === tab ? 'bg-purple-600 text-white' : 'bg-[rgba(124,58,237,0.08)] text-[rgba(167,139,250,0.7)] hover:bg-[rgba(124,58,237,0.15)] hover:text-[#A78BFA]'}`}>
                    {tab === 'contenido' && '📋 Contenido'}
                    {tab === 'entregas' && `📬 Entregas (${actividadActual.entregas.filter(e => e.entregado).length}/${actividadActual.entregas.length})`}
                    {tab === 'foro' && `💬 Foro (${actividadActual.foro?.respuestas.filter(r => r.respuesta).length}/${actividadActual.foro?.respuestas.length})`}
                  </button>
                ))}
              </div>

              {tabActiva === 'contenido' && (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" overflow-hidden">
                  <div className="px-6 py-4 border-b border-[rgba(124,58,237,0.15)]"><h3 className="font-bold text-[#E5E7EB]">Contenido subido</h3></div>
                  {(!actividadActual.contenidos || actividadActual.contenidos.length === 0) ? (
                    <div className="p-8 text-center text-[rgba(156,163,175,0.5)]">Sin contenidos</div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {actividadActual.contenidos.map((c, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-[#F5F6FA] rounded-xl">
                          <span className="text-2xl">{c.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-[#E5E7EB] text-sm">{c.label}</p>
                            {c.texto && <p className="text-[#9CA3AF] text-sm mt-1">{c.texto}</p>}
                            {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-purple-600 text-sm hover:underline mt-1 block">{c.nombre || c.url}</a>}
                            {c.preguntas && (
                              <div className="mt-2 space-y-2">
                                {c.preguntas.map((p, j) => (
                                  <div key={j} style={{ background: "#1C1535", borderRadius: 10 }} className=" p-3">
                                    <p className="text-sm font-medium text-[#E5E7EB]">{j + 1}. {p.texto}</p>
                                    {p.opciones.map((op, k) => (
                                      <p key={k} className={`text-xs mt-1 px-2 py-0.5 rounded ${k === p.correcta ? 'bg-green-100 text-green-700 font-semibold' : 'text-[rgba(156,163,175,0.7)]'}`}>
                                        {String.fromCharCode(65 + k)}. {op}
                                      </p>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tabActiva === 'entregas' && (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" overflow-hidden">
                  <div className="px-6 py-4 border-b border-[rgba(124,58,237,0.15)]"><h3 className="font-bold text-[#E5E7EB]">Entregas</h3></div>
                  {actividadActual.entregas.length === 0 ? (
                    <div className="p-8 text-center text-[rgba(156,163,175,0.5)]">Sin estudiantes asignados</div>
                  ) : (
                    <table className="w-full">
                      <thead><tr className="bg-[#F5F6FA] border-b border-[rgba(124,58,237,0.15)]">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Estudiante</th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Estado</th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Calificación</th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Acción</th>
                      </tr></thead>
                      <tbody>
                        {actividadActual.entregas.map((ent, i) => {
                          const est = estudiantesGrado.find(e => e.id === ent.estudianteId)
                          if (!est) return null
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-[#F5F6FA] transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-[#EDE7FF] rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">{est.nombre.charAt(0)}</div>
                                  <span className="text-sm font-medium text-[#E5E7EB]">{est.nombre}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ent.entregado ? 'bg-[#DDF7E9] text-green-700' : 'bg-[#FFE4D6] text-red-700'}`}>
                                  {ent.entregado ? '✅ Entregado' : '❌ Pendiente'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {ent.calificacion != null ? (
                                  <span className={`font-bold text-sm ${ent.calificacion >= 7 ? 'text-green-600' : 'text-red-500'}`}>{ent.calificacion}/10</span>
                                ) : <span className="text-xs text-[rgba(156,163,175,0.5)] bg-[#F5F6FA] px-3 py-1 rounded-full">Pendiente por calificar</span>}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {ent.entregado && (
                                  <button onClick={() => { setEstudianteSel(est); setEntregaSel(ent); setVista('calificar') }}
                                    className="bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                                    {ent.calificacion != null ? 'Ver / Editar' : 'Calificar'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {tabActiva === 'foro' && actividadActual.foro && (
                <div className="space-y-4">
                  <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm">
                    <h3 className="font-bold text-[#E5E7EB] mb-1">💬 {actividadActual.foro.tema}</h3>
                    {actividadActual.foro.fechaLimite && <p className="text-[rgba(156,163,175,0.5)] text-xs">⏰ Fecha límite: {actividadActual.foro.fechaLimite}</p>}
                  </div>
                  <div className="space-y-3">
                    {actividadActual.foro.respuestas.map((resp, i) => {
                      const est = estudiantesGrado.find(e => e.id === resp.estudianteId)
                      if (!est) return null
                      return (
                        <button key={i} onClick={() => { setForoEstSel({ ...est, resp }); setVista('foro_estudiante') }}
                          className="w-full bg-[#1C1535] rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] hover:border-[rgba(124,58,237,0.4)] transition-all text-left group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#EDE7FF] rounded-full flex items-center justify-center text-purple-600 font-bold flex-shrink-0">{est.nombre.charAt(0)}</div>
                            <div className="flex-1">
                              <p className="font-bold text-[#E5E7EB] text-sm">{est.nombre}</p>
                              {resp.respuesta ? <p className="text-[rgba(156,163,175,0.7)] text-xs mt-0.5 truncate">{resp.respuesta}</p> : <p className="text-[rgba(156,163,175,0.5)] text-xs italic">Sin respuesta aún</p>}
                            </div>
                            <div className="text-right">
                              {resp.fechaHora && <p className="text-xs text-[rgba(156,163,175,0.5)] mb-1">{fmt(resp.fechaHora)}</p>}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${resp.respuesta ? 'bg-[#DDF7E9] text-green-700' : 'bg-[#FFE4D6] text-red-600'}`}>
                                {resp.respuesta ? `✅ Respondió · ${resp.comentarios?.length || 0} comentarios` : '⏳ Sin respuesta'}
                              </span>
                            </div>
                            <span className="text-gray-300 group-hover:text-purple-400">→</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DETALLE ESTUDIANTE */}
          {vista === 'estudiante' && estudianteSel && (
            <div className="space-y-6">
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm flex items-center gap-6">
                <div className="w-16 h-16 bg-[#EDE7FF] rounded-full flex items-center justify-center text-purple-600 font-bold text-2xl">{estudianteSel.nombre.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold text-[#E5E7EB]">{estudianteSel.nombre}</h3>
                  <p className="text-[rgba(156,163,175,0.5)]">{estudianteSel.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="bg-[#EDE7FF] text-purple-600 text-xs px-2 py-1 rounded-full font-medium">{gradoSel?.nombre}</span>
                    <span className="bg-[#D6E8FF] text-blue-600 text-xs px-2 py-1 rounded-full font-medium">{materiaSel?.nombre}</span>
                    <span className="bg-[#FFF4CC] text-yellow-600 text-xs px-2 py-1 rounded-full font-medium">{periodoSel?.nombre}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(124,58,237,0.15)]"><h3 className="font-bold text-[#E5E7EB]">Actividades asignadas</h3></div>
                {actividadesActuales.length === 0 ? (
                  <div className="p-8 text-center text-[rgba(156,163,175,0.5)]">Sin actividades</div>
                ) : (
                  <table className="w-full">
                    <thead><tr className="bg-[#F5F6FA] border-b border-[rgba(124,58,237,0.15)]">
                      <th className="text-left py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Actividad</th>
                      <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Fecha límite</th>
                      <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Estado</th>
                      <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Calificación</th>
                      <th className="text-center py-3 px-6 text-xs font-semibold text-[rgba(156,163,175,0.7)] uppercase">Acción</th>
                    </tr></thead>
                    <tbody>
                      {actividadesActuales.map(act => {
                        const ent = act.entregas.find(e => e.estudianteId === estudianteSel.id)
                        return (
                          <tr key={act.id} className="border-b border-gray-50 hover:bg-[#F5F6FA] transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-[#E5E7EB]">{act.titulo}</td>
                            <td className="py-4 px-6 text-center text-sm text-[rgba(156,163,175,0.7)]">{act.fechaLimite}</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${ent?.entregado ? 'bg-[#DDF7E9] text-green-700' : 'bg-[#FFE4D6] text-red-700'}`}>
                                {ent?.entregado ? '✅ Entregado' : '❌ Pendiente'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              {ent?.calificacion != null ? (
                                <span className={`font-bold text-sm ${ent.calificacion >= 7 ? 'text-green-600' : 'text-red-500'}`}>{ent.calificacion}/10</span>
                              ) : <span className="text-xs text-[rgba(156,163,175,0.5)] bg-[#F5F6FA] px-3 py-1 rounded-full">Pendiente por calificar</span>}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {ent?.entregado && (
                                <button onClick={() => { setActividadSel(act); setEntregaSel(ent); setVista('calificar') }}
                                  className="bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-200 transition-colors">
                                  {ent.calificacion != null ? 'Ver / Editar' : 'Calificar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* CALIFICAR */}
          {vista === 'calificar' && entregaSel && (
            <div className="max-w-2xl space-y-6">
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm">
                <h3 className="font-bold text-[#E5E7EB] mb-1">Entrega de {estudianteSel?.nombre}</h3>
                <p className="text-[rgba(156,163,175,0.5)] text-sm mb-4">{actividadSel?.titulo}</p>
                {entregaSel.texto && <div className="bg-[#F5F6FA] rounded-xl p-4 text-sm text-[#D1D5DB] mb-3">{entregaSel.texto}</div>}
                {entregaSel.archivos?.length > 0 ? (
                  <div className="space-y-2">{entregaSel.archivos.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-[#F5F6FA] rounded-xl p-3"><span className="text-xl">📎</span><span className="text-sm text-[#D1D5DB]">{a.nombre}</span></div>
                  ))}</div>
                ) : !entregaSel.texto && <p className="text-[rgba(156,163,175,0.5)] text-sm italic">Sin archivos adjuntos</p>}
              </div>
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm">
                <h3 className="font-bold text-[#E5E7EB] mb-4">Asignar calificación</h3>
                {entregaSel.calificacion != null && <div className="bg-[#DDF7E9] rounded-xl p-3 mb-4 text-center"><p className="text-green-700 font-semibold">Nota actual: {entregaSel.calificacion}/10</p></div>}
                <div className="flex items-center gap-4">
                  <input type="number" min="0" max="10" step="0.5" value={notaTemp} onChange={e => setNotaTemp(e.target.value)}
                    placeholder="0.0" className="w-32 border-2 border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-purple-400" />
                  <span className="text-[rgba(156,163,175,0.5)] font-medium">/ 10</span>
                  <button onClick={guardarNota} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">Guardar Calificación</button>
                </div>
              </div>
            </div>
          )}

          {/* FORO ESTUDIANTE */}
          {vista === 'foro_estudiante' && foroEstSel && (
            <div className="max-w-2xl space-y-6">
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#EDE7FF] rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">{foroEstSel.nombre.charAt(0)}</div>
                <div><h3 className="font-bold text-[#E5E7EB]">{foroEstSel.nombre}</h3><p className="text-[rgba(156,163,175,0.5)] text-sm">{foroEstSel.email}</p></div>
              </div>
              {foroEstSel.resp?.respuesta ? (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#E5E7EB]">Respuesta al foro</h3>
                    <span className="text-xs text-[rgba(156,163,175,0.5)]">{fmt(foroEstSel.resp.fechaHora)}</span>
                  </div>
                  <div className="bg-[#F5F6FA] rounded-xl p-4 text-sm text-[#D1D5DB]">{foroEstSel.resp.respuesta}</div>
                </div>
              ) : (
                <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-6 shadow-sm text-center">
                  <span className="text-4xl">💬</span>
                  <p className="text-[rgba(156,163,175,0.7)] mt-2">Este estudiante aún no ha respondido</p>
                </div>
              )}
              <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className=" overflow-hidden">
                <div className="px-6 py-4 border-b border-[rgba(124,58,237,0.15)]"><h3 className="font-bold text-[#E5E7EB]">Comentarios ({foroEstSel.resp?.comentarios?.length || 0})</h3></div>
                <div className="p-4 space-y-3">
                  {(!foroEstSel.resp?.comentarios || foroEstSel.resp.comentarios.length === 0) ? (
                    <p className="text-[rgba(156,163,175,0.5)] text-sm text-center py-4">Sin comentarios aún</p>
                  ) : foroEstSel.resp.comentarios.map((com, i) => (
                    <div key={i} className="bg-[#F5F6FA] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-[#E5E7EB]">{com.autorNombre}</span>
                        <span className="text-xs text-[rgba(156,163,175,0.5)]">{fmt(com.fechaHora)}</span>
                      </div>
                      <p className="text-[#9CA3AF] text-sm">{com.texto}</p>
                    </div>
                  ))}
                </div>
                {foroEstSel.resp?.respuesta && (
                  <div className="px-4 pb-4 flex gap-3">
                    <input type="text" value={comentarioTemp} onChange={e => setComentarioTemp(e.target.value)}
                      placeholder="Escribe un comentario..." onKeyDown={e => e.key === 'Enter' && enviarComentario(foroEstSel.id)}
                      className="flex-1 border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    <button onClick={() => enviarComentario(foroEstSel.id)} className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">Comentar</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CLAVE RÁPIDA DESDE TARJETA DE MATERIA */}
      {claveRapidaMateria && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">🔑 Clave de matrícula</h3>
            <p className="text-[rgba(156,163,175,0.5)] text-sm mb-5">{gradoSel?.nombre} · {claveRapidaMateria.nombre} · {periodoSel?.nombre}</p>
            <div className="mb-5">
              <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Clave (máx. 8 caracteres)</label>
              <input type="text" value={claveRapidaInput}
                onChange={e => setClaveRapidaInput(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="Ej: LEN6P1" maxLength={8} autoFocus
                onKeyDown={e => e.key === 'Enter' && guardarClaveRapida()}
                className="w-full border-2 border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-purple-400" />
              <p className="text-[rgba(156,163,175,0.5)] text-xs mt-2 text-center">Los estudiantes usarán esta clave para matricularse</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setClaveRapidaMateria(null); setClaveRapidaInput('') }}
                className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-3 rounded-xl font-medium hover:bg-[rgba(124,58,237,0.1)] transition-colors">Cancelar</button>
              <button onClick={guardarClaveRapida} disabled={!claveRapidaInput.trim()}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVO GRADO */}
      {mostrarModalGrado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">🎒 Nuevo Grado</h3>
            <p className="text-[rgba(156,163,175,0.5)] text-sm mb-5">{periodoSel?.nombre}</p>
            <div className="mb-5">
              <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Nombre del grado</label>
              <input type="text" value={nuevoGradoNombre}
                onChange={e => setNuevoGradoNombre(e.target.value)}
                placeholder="Ej: Grado 9°" autoFocus
                onKeyDown={e => e.key === 'Enter' && crearGrado()}
                className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setMostrarModalGrado(false); setNuevoGradoNombre('') }}
                className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-3 rounded-xl font-medium hover:bg-[rgba(124,58,237,0.1)] transition-colors">Cancelar</button>
              <button onClick={crearGrado} disabled={!nuevoGradoNombre.trim()}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">Crear Grado</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA MATERIA */}
      {mostrarModalMateria && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">📚 Nueva Materia</h3>
            <p className="text-[rgba(156,163,175,0.5)] text-sm mb-5">{gradoSel?.nombre}</p>
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Nombre de la materia</label>
                <input type="text" value={nuevaMateriaNombre}
                  onChange={e => setNuevaMateriaNombre(e.target.value)}
                  placeholder="Ej: Matemáticas" autoFocus
                  onKeyDown={e => e.key === 'Enter' && crearMateria()}
                  className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#D1D5DB] mb-2 block">Ícono</label>
                <div className="grid grid-cols-6 gap-2">
                  {['📖', '🔍', '🔢', '🔬', '🌍', '🎨', '💻', '🏃', '🎵', '📐', '🧪', '📝'].map(ic => (
                    <button key={ic} onClick={() => setNuevaMateriaIcon(ic)}
                      className={`text-2xl p-2 rounded-xl transition-all border-2 ${nuevaMateriaIcon === ic ? 'border-purple-400 bg-purple-50' : 'border-transparent hover:border-[rgba(124,58,237,0.2)]'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setMostrarModalMateria(false); setNuevaMateriaNombre(''); setNuevaMateriaIcon('📖') }}
                className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-3 rounded-xl font-medium hover:bg-[rgba(124,58,237,0.1)] transition-colors">Cancelar</button>
              <button onClick={crearMateria} disabled={!nuevaMateriaNombre.trim()}
                className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50">Crear Materia</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLAVE MATRÍCULA (desde actividades) */}
      {mostrarClave && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-8 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-[#E5E7EB] text-lg mb-1">🔑 Clave de matrícula</h3>
            <p className="text-[rgba(156,163,175,0.5)] text-sm mb-2">{gradoSel?.nombre} · {materiaSel?.nombre} · {periodoSel?.nombre}</p>
            {claveActual && <div className="bg-[#EDE7FF] rounded-xl p-3 mb-4 text-center"><p className="text-purple-700 font-bold text-lg">{claveActual}</p><p className="text-purple-500 text-xs">Clave actual</p></div>}
            <div className="mb-4">
              <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Nueva clave (máx. 8 caracteres)</label>
              <input type="text" value={claveInput} onChange={e => setClaveInput(e.target.value.toUpperCase().slice(0, 8))}
                placeholder="Ej: LEN6P1" maxLength={8}
                className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-300" />
              <p className="text-[rgba(156,163,175,0.5)] text-xs mt-1 text-center">Los estudiantes usarán esta clave para matricularse</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setMostrarClave(false); setClaveInput('') }} className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-3 rounded-xl font-medium hover:bg-[rgba(124,58,237,0.1)] transition-colors">Cancelar</button>
              <button onClick={guardarClave} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">Guardar Clave</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA ACTIVIDAD */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div style={{ background: "#1C1535" }} className="rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[rgba(124,58,237,0.15)]">
              <h3 className="font-bold text-[#E5E7EB] text-lg">Nueva Actividad</h3>
              <p className="text-[rgba(156,163,175,0.5)] text-sm">{gradoSel?.nombre} · {materiaSel?.nombre} · {periodoSel?.nombre}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Título *</label>
                <input type="text" value={nuevaAct.titulo} onChange={e => setNuevaAct(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ej: Tarea 1 - Análisis de texto"
                  className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Descripción / Instrucciones</label>
                <textarea value={nuevaAct.descripcion} onChange={e => setNuevaAct(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Instrucciones para los estudiantes..." rows={3}
                  className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Fecha inicio</label>
                  <input type="date" value={nuevaAct.fechaInicio} onChange={e => setNuevaAct(p => ({ ...p, fechaInicio: e.target.value }))}
                    className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Fecha límite *</label>
                  <input type="date" value={nuevaAct.fechaLimite} onChange={e => setNuevaAct(p => ({ ...p, fechaLimite: e.target.value }))}
                    className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              {/* Foro */}
              <div className="bg-[#F5F6FA] rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={nuevaAct.foroActivo} onChange={e => setNuevaAct(p => ({ ...p, foroActivo: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                  <span className="font-medium text-[#D1D5DB] text-sm">💬 Activar foro de discusión</span>
                </label>
                {nuevaAct.foroActivo && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Tema del foro *</label>
                      <input type="text" value={nuevaAct.foroTema} onChange={e => setNuevaAct(p => ({ ...p, foroTema: e.target.value }))}
                        placeholder="Ej: ¿Qué aprendiste sobre la lectura crítica?"
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-[#E5E7EB]" style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(124,58,237,0.3)" }}" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#D1D5DB] mb-1 block">Fecha límite del foro</label>
                      <input type="date" value={nuevaAct.foroFechaLimite} onChange={e => setNuevaAct(p => ({ ...p, foroFechaLimite: e.target.value }))}
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-[#E5E7EB]" style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(124,58,237,0.3)" }}" />
                    </div>
                  </div>
                )}
              </div>

              {/* Contenidos */}
              {nuevaAct.contenidos.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-[#D1D5DB] mb-2 block">Contenidos agregados ({nuevaAct.contenidos.length})</label>
                  <div className="space-y-2">
                    {nuevaAct.contenidos.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#F5F6FA] rounded-xl p-3">
                        <span>{c.icon}</span>
                        <span className="text-sm text-[#D1D5DB] flex-1">{c.label}{c.nombre ? ` — ${c.nombre}` : ''}</span>
                        <button onClick={() => setNuevaAct(p => ({ ...p, contenidos: p.contenidos.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Un solo bloque para agregar contenido */}
              <div>
                <label className="text-sm font-medium text-[#D1D5DB] mb-2 block">Agregar contenido</label>
                {!tipoSel ? (
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS_CONTENIDO.map(t => (
                      <button key={t.id} onClick={() => setTipoSel(t)}
                        className="bg-[#F5F6FA] hover:bg-[#EDE7FF] rounded-xl p-3 text-center transition-colors border-2 border-transparent hover:border-purple-200">
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <p className="text-xs font-medium text-[#D1D5DB]">{t.label}</p>
                        <p className="text-xs text-[rgba(156,163,175,0.5)]">{t.sub}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F5F6FA] rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tipoSel.icon}</span>
                      <span className="font-medium text-[#E5E7EB] text-sm">{tipoSel.label}</span>
                      <button onClick={() => { setTipoSel(null); setContenidoTemp({ texto: '', url: '', archivo: null }); setPreguntas([]) }}
                        className="ml-auto text-[rgba(156,163,175,0.5)] hover:text-[#9CA3AF] text-sm">✕ Cancelar</button>
                    </div>
                    {['archivo', 'video_propio', 'imagen'].includes(tipoSel.id) && (
                      <div className="border-2 border-dashed border-[rgba(124,58,237,0.25)] rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                        onClick={() => document.getElementById('fileInput').click()}>
                        <input id="fileInput" type="file" className="hidden" accept={tipoSel.accept}
                          onChange={e => setContenidoTemp(p => ({ ...p, archivo: e.target.files[0] }))} />
                        {contenidoTemp.archivo ? <p className="text-purple-600 font-medium text-sm">✅ {contenidoTemp.archivo.name}</p> : (
                          <><p className="text-[rgba(156,163,175,0.7)] text-sm">Haz clic para seleccionar</p><p className="text-[rgba(156,163,175,0.5)] text-xs mt-1">{tipoSel.sub}</p></>
                        )}
                      </div>
                    )}
                    {['video_link', 'link'].includes(tipoSel.id) && (
                      <input type="url" value={contenidoTemp.url} onChange={e => setContenidoTemp(p => ({ ...p, url: e.target.value }))}
                        placeholder={tipoSel.id === 'video_link' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none text-[#E5E7EB]" style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(124,58,237,0.3)" }}" />
                    )}
                    {tipoSel.id === 'explicacion' && (
                      <textarea value={contenidoTemp.texto} onChange={e => setContenidoTemp(p => ({ ...p, texto: e.target.value }))}
                        placeholder="Escribe las instrucciones aquí..." rows={4}
                        className="w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none text-white" />
                    )}
                    {tipoSel.id === 'quiz' && (
                      <div className="space-y-3">
                        {preguntas.length > 0 && (
                          <div className="space-y-2">
                            {preguntas.map((p, i) => (
                              <div key={i} style={{ background: "#1C1535", borderRadius: 10 }} className=" p-3 text-sm">
                                <p className="font-medium text-[#E5E7EB]">{i + 1}. {p.texto}</p>
                                {p.opciones.map((op, j) => (
                                  <p key={j} className={`text-xs mt-1 ${j === p.correcta ? 'text-green-600 font-semibold' : 'text-[rgba(156,163,175,0.7)]'}`}>
                                    {String.fromCharCode(65 + j)}. {op} {j === p.correcta ? '✓' : ''}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ background: "#1C1535", borderRadius: 12, border: "1px solid rgba(124,58,237,0.18)" }} className="p-4 space-y-2">
                          <input type="text" value={nuevaPregunta.texto} onChange={e => setNuevaPregunta(p => ({ ...p, texto: e.target.value }))}
                            placeholder="Escribe la pregunta..." className="w-full border border-[rgba(124,58,237,0.2)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                          {nuevaPregunta.opciones.map((op, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="radio" checked={nuevaPregunta.correcta === i} onChange={() => setNuevaPregunta(p => ({ ...p, correcta: i }))} />
                              <input type="text" value={op} onChange={e => setNuevaPregunta(p => ({ ...p, opciones: p.opciones.map((o, j) => j === i ? e.target.value : o) }))}
                                placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                                className="flex-1 border border-[rgba(124,58,237,0.2)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>
                          ))}
                          <button onClick={agregarPregunta} className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">+ Agregar pregunta</button>
                        </div>
                      </div>
                    )}
                    <button onClick={agregarContenido} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                      ✅ Agregar este contenido
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-[rgba(124,58,237,0.15)] flex gap-3 bg-[#1C1535]">
              <button onClick={() => { setMostrarModal(false); setNuevaAct({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' }); setTipoSel(null) }}
                className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-3 rounded-xl font-medium hover:bg-[rgba(124,58,237,0.1)] transition-colors">Cancelar</button>
              <button onClick={crearActividad} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">Crear Actividad</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Periodos
