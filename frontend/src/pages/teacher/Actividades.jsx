// frontend/src/pages/teacher/Actividades.jsx
import { useState } from 'react'
import TeacherSidebar from '../../components/TeacherSidebar'
import { useProfesor } from '../../context/ProfesorContext'

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

const Actividades = () => {
  const { periodos, grados, estudiantes, getActividades, agregarActividad, calificarEntrega } = useProfesor()

  const [vista, setVista] = useState('periodos')
  const [periodoSel, setPeriodoSel] = useState(null)
  const [gradoSel, setGradoSel] = useState(null)
  const [materiaSel, setMateriaSel] = useState(null)
  const [actividadSel, setActividadSel] = useState(null)
  const [estudianteSel, setEstudianteSel] = useState(null)
  const [entregaSel, setEntregaSel] = useState(null)
  const [tabActiva, setTabActiva] = useState('contenido')
  const [notaTemp, setNotaTemp] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevaAct, setNuevaAct] = useState({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' })
  const [tipoSel, setTipoSel] = useState(null)
  const [contenidoTemp, setContenidoTemp] = useState({ texto: '', url: '', archivo: null })
  const [preguntas, setPreguntas] = useState([])
  const [nuevaPregunta, setNuevaPregunta] = useState({ texto: '', opciones: ['', '', '', ''], correcta: 0 })

  const actividadesActuales = periodoSel && gradoSel && materiaSel ? getActividades(periodoSel.id, gradoSel.id, materiaSel.id) : []
  const estudiantesGrado = gradoSel ? (estudiantes[gradoSel.id] || []) : []
  const actividadActual = actividadSel ? actividadesActuales.find(a => a.id === actividadSel.id) || actividadSel : null

  const handleVolver = () => {
    const mapa = { calificar: 'actividad_detalle', actividad_detalle: 'actividades', actividades: 'materias', materias: 'grados', grados: 'periodos' }
    if (vista === 'calificar') { setEntregaSel(null); setEstudianteSel(null); setNotaTemp('') }
    if (vista === 'actividad_detalle') { setActividadSel(null); setTabActiva('contenido') }
    if (vista === 'actividades') setMateriaSel(null)
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

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <TeacherSidebar />
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {vista !== 'periodos' && (
              <button onClick={handleVolver} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-all border border-gray-200">←</button>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {vista === 'periodos' && 'Actividades 📝'}
                {vista === 'grados' && `${periodoSel?.nombre} — Grados`}
                {vista === 'materias' && `${gradoSel?.nombre} — Materias`}
                {vista === 'actividades' && `${materiaSel?.nombre}`}
                {vista === 'actividad_detalle' && actividadActual?.titulo}
                {vista === 'calificar' && `Calificar — ${estudianteSel?.nombre}`}
              </h2>
              <p className="text-gray-400 text-sm">
                {vista === 'periodos' && 'Selecciona un periodo'}
                {vista === 'grados' && 'Selecciona un grado'}
                {vista === 'materias' && 'Selecciona una materia'}
                {vista === 'actividades' && `${actividadesActuales.length} actividades · ${estudiantesGrado.length} estudiantes`}
                {vista === 'actividad_detalle' && `${actividadActual?.contenidos?.length || 0} contenidos`}
                {vista === 'calificar' && actividadSel?.titulo}
              </p>
            </div>
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs flex-wrap">
            {periodoSel && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium border border-purple-200">{periodoSel.nombre}</span>}
            {gradoSel && <><span className="text-gray-300">›</span><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium border border-blue-200">{gradoSel.nombre}</span></>}
            {materiaSel && <><span className="text-gray-300">›</span><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">{materiaSel.nombre}</span></>}
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
                  <p className="text-gray-500 text-sm">{p.fechas}</p>
                  <div className={`mt-4 flex items-center gap-2 ${p.text} text-sm font-medium`}>
                    <span>Ver grados</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* GRADOS */}
          {vista === 'grados' && (
            <div className="grid grid-cols-3 gap-6">
              {grados.map(g => (
                <button key={g.id} onClick={() => { setGradoSel(g); setVista('materias') }}
                  className="bg-white rounded-2xl p-8 text-left hover:scale-105 transition-all shadow-sm border-2 border-gray-100 hover:border-purple-300 group">
                  <div className="text-5xl mb-4">{g.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{g.nombre}</h3>
                  <p className="text-gray-400 text-sm">{g.materias.length} materia{g.materias.length > 1 ? 's' : ''}</p>
                  <div className="mt-4 flex items-center gap-2 text-purple-600 text-sm font-medium">
                    <span>Ver materias</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* MATERIAS */}
          {vista === 'materias' && (
            <div className="grid grid-cols-2 gap-6">
              {gradoSel?.materias.map((m, i) => {
                const colors = [{ bg: 'bg-[#EDE7FF]', text: 'text-purple-700', border: 'border-purple-200' }, { bg: 'bg-[#D6E8FF]', text: 'text-blue-700', border: 'border-blue-200' }]
                const c = colors[i % 2]
                const count = getActividades(periodoSel?.id, gradoSel?.id, m.id).length
                return (
                  <button key={m.id} onClick={() => { setMateriaSel(m); setVista('actividades') }}
                    className={`${c.bg} border-2 ${c.border} rounded-2xl p-8 text-left hover:scale-105 transition-all shadow-sm group`}>
                    <div className="text-5xl mb-4">{m.icon}</div>
                    <h3 className={`text-2xl font-bold ${c.text} mb-1`}>{m.nombre}</h3>
                    <p className="text-gray-500 text-sm">{count} actividades</p>
                    <div className={`mt-4 flex items-center gap-2 ${c.text} text-sm font-medium`}>
                      <span>Ver actividades</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ACTIVIDADES */}
          {vista === 'actividades' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setMostrarModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md">
                  <span>+</span><span>Nueva Actividad</span>
                </button>
              </div>

              {actividadesActuales.length === 0 ? (
                <Card className="p-12 text-center">
                  <span className="text-5xl">📭</span>
                  <p className="text-gray-500 mt-3 font-medium">Sin actividades aún</p>
                  <p className="text-gray-400 text-sm mt-1">Crea la primera con el botón de arriba</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {actividadesActuales.map(act => {
                    const ent = act.entregas.filter(e => e.entregado).length
                    const tot = act.entregas.length
                    const pct = tot > 0 ? Math.round((ent / tot) * 100) : 0
                    return (
                      <button key={act.id} onClick={() => { setActividadSel(act); setTabActiva('contenido'); setVista('actividad_detalle') }}
                        className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 hover:border-purple-300 transition-all text-left group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-purple-200">📝</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-bold text-gray-800">{act.titulo}</h4>
                              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200">{act.contenidos?.length || 0} contenidos</span>
                              {act.foro && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full border border-green-200">💬 Foro</span>}
                            </div>
                            <div className="flex gap-4 text-xs text-gray-400">
                              {act.fechaInicio && <span>📅 {act.fechaInicio}</span>}
                              <span>⏰ {act.fechaLimite}</span>
                              <span>📬 {ent}/{tot} entregas</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 border border-gray-200">
                              <div className={`h-1.5 rounded-full ${pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-gray-300 group-hover:text-purple-500 text-xl">→</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Estudiantes */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-4">Estudiantes matriculados</h3>
                {estudiantesGrado.length === 0 ? (
                  <Card className="p-10 text-center">
                    <span className="text-4xl">👨‍🎓</span>
                    <p className="text-gray-400 mt-2 text-sm">Sin estudiantes en este grado</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {estudiantesGrado.map(est => {
                      const entregas = actividadesActuales.map(act => act.entregas.find(e => e.estudianteId === est.id))
                      const entregadas = entregas.filter(e => e?.entregado).length
                      const califs = entregas.filter(e => e?.calificacion != null)
                      const prom = califs.length > 0 ? (califs.reduce((a, e) => a + e.calificacion, 0) / califs.length).toFixed(1) : null
                      return (
                        <div key={est.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold border border-purple-200 flex-shrink-0">{est.nombre.charAt(0)}</div>
                          <div className="flex-1"><p className="font-bold text-gray-800 text-sm">{est.nombre}</p><p className="text-gray-400 text-xs">{est.email}</p></div>
                          <div className="flex gap-6 text-center">
                            <div><p className="font-bold text-purple-600">{entregadas}/{actividadesActuales.length}</p><p className="text-xs text-gray-400">Entregas</p></div>
                            <div><p className={`font-bold ${prom >= 7 ? 'text-green-600' : prom ? 'text-yellow-600' : 'text-gray-400'}`}>{prom ? `${prom}/10` : 'S/N'}</p><p className="text-xs text-gray-400">Promedio</p></div>
                          </div>
                        </div>
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
              <Card className="p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{actividadActual.titulo}</h3>
                {actividadActual.descripcion && <p className="text-gray-500 text-sm mb-3">{actividadActual.descripcion}</p>}
                <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                  {actividadActual.fechaInicio && <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100">📅 Inicio: {actividadActual.fechaInicio}</span>}
                  <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg border border-orange-100">⏰ Límite: {actividadActual.fechaLimite}</span>
                  {actividadActual.foro && <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg border border-green-100">💬 Foro: {actividadActual.foro.tema}</span>}
                </div>
              </Card>

              {/* Tabs */}
              <div className="flex gap-2 flex-wrap">
                {['contenido', 'entregas', ...(actividadActual.foro ? ['foro'] : [])].map(tab => (
                  <button key={tab} onClick={() => setTabActiva(tab)}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all border ${tabActiva === tab ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'}`}>
                    {tab === 'contenido' && '📋 Contenido'}
                    {tab === 'entregas' && `📬 Entregas (${actividadActual.entregas.filter(e => e.entregado).length}/${actividadActual.entregas.length})`}
                    {tab === 'foro' && `💬 Foro (${actividadActual.foro?.respuestas.filter(r => r.respuesta).length || 0})`}
                  </button>
                ))}
              </div>

              {tabActiva === 'contenido' && (
                <Card>
                  <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Contenido subido</h3></div>
                  {(!actividadActual.contenidos || actividadActual.contenidos.length === 0) ? (
                    <div className="p-8 text-center text-gray-400">Sin contenidos</div>
                  ) : (
                    <div className="p-4 space-y-3">
                      {actividadActual.contenidos.map((c, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <span className="text-2xl">{c.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{c.label}</p>
                            {c.texto && <p className="text-gray-600 text-sm mt-1">{c.texto}</p>}
                            {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-purple-600 text-sm hover:underline mt-1 block">{c.nombre || c.url}</a>}
                            {c.preguntas && (
                              <div className="mt-2 space-y-2">
                                {c.preguntas.map((p, j) => (
                                  <div key={j} className="bg-white rounded-lg p-3 border border-gray-100">
                                    <p className="text-sm font-medium text-gray-800">{j + 1}. {p.texto}</p>
                                    {p.opciones.map((op, k) => (
                                      <p key={k} className={`text-xs mt-1 px-2 py-0.5 rounded ${k === p.correcta ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-500'}`}>
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
                </Card>
              )}

              {tabActiva === 'entregas' && (
                <Card className="overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Entregas de estudiantes</h3></div>
                  {actividadActual.entregas.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Sin estudiantes asignados</div>
                  ) : (
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Estudiante</th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Calificación</th>
                        <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Acción</th>
                      </tr></thead>
                      <tbody>
                        {actividadActual.entregas.map((ent, i) => {
                          const est = estudiantesGrado.find(e => e.id === ent.estudianteId)
                          if (!est) return null
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-200">{est.nombre.charAt(0)}</div>
                                  <span className="text-sm font-medium text-gray-800">{est.nombre}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${ent.entregado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                  {ent.entregado ? '✅ Entregado' : '❌ Pendiente'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {ent.calificacion != null ? (
                                  <span className={`font-bold text-sm ${ent.calificacion >= 7 ? 'text-green-600' : 'text-red-500'}`}>{ent.calificacion}/10</span>
                                ) : <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">Pendiente por calificar</span>}
                              </td>
                              <td className="py-4 px-6 text-center">
                                {ent.entregado && (
                                  <button onClick={() => { setEstudianteSel(est); setEntregaSel(ent); setVista('calificar') }}
                                    className="bg-purple-100 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-purple-200 transition-colors border border-purple-200">
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
                </Card>
              )}

              {tabActiva === 'foro' && actividadActual.foro && (
                <Card className="p-6">
                  <h3 className="font-bold text-gray-800 mb-1">💬 {actividadActual.foro.tema}</h3>
                  {actividadActual.foro.fechaLimite && <p className="text-gray-400 text-xs mb-4">⏰ Fecha límite: {actividadActual.foro.fechaLimite}</p>}
                  <div className="space-y-3">
                    {actividadActual.foro.respuestas.map((resp, i) => {
                      const est = estudiantesGrado.find(e => e.id === resp.estudianteId)
                      if (!est) return null
                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm border border-purple-200">{est.nombre.charAt(0)}</div>
                            <span className="font-bold text-gray-800 text-sm">{est.nombre}</span>
                            {resp.fechaHora && <span className="text-xs text-gray-400 ml-auto">{fmt(resp.fechaHora)}</span>}
                          </div>
                          {resp.respuesta ? <p className="text-gray-600 text-sm">{resp.respuesta}</p> : <p className="text-gray-400 text-xs italic">Sin respuesta aún</p>}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* CALIFICAR */}
          {vista === 'calificar' && entregaSel && (
            <div className="max-w-2xl space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-gray-800 mb-1">Entrega de {estudianteSel?.nombre}</h3>
                <p className="text-gray-400 text-sm mb-4">{actividadSel?.titulo}</p>
                {entregaSel.texto && <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-3 border border-gray-100">{entregaSel.texto}</div>}
                {!entregaSel.texto && <p className="text-gray-400 text-sm italic">Sin archivos adjuntos</p>}
              </Card>
              <Card className="p-6">
                <h3 className="font-bold text-gray-800 mb-4">Asignar calificación</h3>
                {entregaSel.calificacion != null && <div className="bg-green-50 rounded-xl p-3 mb-4 text-center border border-green-100"><p className="text-green-700 font-semibold">Nota actual: {entregaSel.calificacion}/10</p></div>}
                <div className="flex items-center gap-4">
                  <input type="number" min="0" max="10" step="0.5" value={notaTemp} onChange={e => setNotaTemp(e.target.value)}
                    placeholder="0.0" className="w-32 border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-purple-400" />
                  <span className="text-gray-400 font-medium">/ 10</span>
                  <button onClick={guardarNota} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-md">Guardar Calificación</button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVA ACTIVIDAD */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Nueva Actividad</h3>
              <p className="text-gray-400 text-sm">{gradoSel?.nombre} · {materiaSel?.nombre} · {periodoSel?.nombre}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
                <input type="text" value={nuevaAct.titulo} onChange={e => setNuevaAct(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ej: Tarea 1 - Análisis de texto"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción / Instrucciones</label>
                <textarea value={nuevaAct.descripcion} onChange={e => setNuevaAct(p => ({ ...p, descripcion: e.target.value }))}
                  placeholder="Instrucciones para los estudiantes..." rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha inicio</label>
                  <input type="date" value={nuevaAct.fechaInicio} onChange={e => setNuevaAct(p => ({ ...p, fechaInicio: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha límite *</label>
                  <input type="date" value={nuevaAct.fechaLimite} onChange={e => setNuevaAct(p => ({ ...p, fechaLimite: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                </div>
              </div>

              {/* Foro */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={nuevaAct.foroActivo} onChange={e => setNuevaAct(p => ({ ...p, foroActivo: e.target.checked }))} className="w-4 h-4 accent-purple-600" />
                  <span className="font-medium text-gray-700 text-sm">💬 Activar foro de discusión</span>
                </label>
                {nuevaAct.foroActivo && (
                  <div className="mt-3 space-y-3">
                    <input type="text" value={nuevaAct.foroTema} onChange={e => setNuevaAct(p => ({ ...p, foroTema: e.target.value }))}
                      placeholder="Tema del foro..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                    <input type="date" value={nuevaAct.foroFechaLimite} onChange={e => setNuevaAct(p => ({ ...p, foroFechaLimite: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                  </div>
                )}
              </div>

              {/* Contenidos */}
              {nuevaAct.contenidos.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Contenidos ({nuevaAct.contenidos.length})</label>
                  <div className="space-y-2">
                    {nuevaAct.contenidos.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <span>{c.icon}</span>
                        <span className="text-sm text-gray-700 flex-1">{c.label}{c.nombre ? ` — ${c.nombre}` : ''}</span>
                        <button onClick={() => setNuevaAct(p => ({ ...p, contenidos: p.contenidos.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Agregar contenido</label>
                {!tipoSel ? (
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS_CONTENIDO.map(t => (
                      <button key={t.id} onClick={() => setTipoSel(t)}
                        className="bg-gray-50 hover:bg-purple-50 rounded-xl p-3 text-center transition-colors border border-gray-200 hover:border-purple-300">
                        <div className="text-2xl mb-1">{t.icon}</div>
                        <p className="text-xs font-medium text-gray-700">{t.label}</p>
                        <p className="text-xs text-gray-400">{t.sub}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tipoSel.icon}</span>
                      <span className="font-medium text-gray-800 text-sm">{tipoSel.label}</span>
                      <button onClick={() => { setTipoSel(null); setContenidoTemp({ texto: '', url: '', archivo: null }); setPreguntas([]) }}
                        className="ml-auto text-gray-400 hover:text-gray-600 text-sm">✕</button>
                    </div>
                    {['archivo', 'video_propio', 'imagen'].includes(tipoSel.id) && (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
                        onClick={() => document.getElementById('fileInput').click()}>
                        <input id="fileInput" type="file" className="hidden" accept={tipoSel.accept}
                          onChange={e => setContenidoTemp(p => ({ ...p, archivo: e.target.files[0] }))} />
                        {contenidoTemp.archivo ? <p className="text-purple-600 font-medium text-sm">✅ {contenidoTemp.archivo.name}</p> : (
                          <><p className="text-gray-500 text-sm">Haz clic para seleccionar</p><p className="text-gray-400 text-xs mt-1">{tipoSel.sub}</p></>
                        )}
                      </div>
                    )}
                    {['video_link', 'link'].includes(tipoSel.id) && (
                      <input type="url" value={contenidoTemp.url} onChange={e => setContenidoTemp(p => ({ ...p, url: e.target.value }))}
                        placeholder={tipoSel.id === 'video_link' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                    )}
                    {tipoSel.id === 'explicacion' && (
                      <textarea value={contenidoTemp.texto} onChange={e => setContenidoTemp(p => ({ ...p, texto: e.target.value }))}
                        placeholder="Escribe las instrucciones..." rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none bg-white" />
                    )}
                    {tipoSel.id === 'quiz' && (
                      <div className="space-y-3">
                        {preguntas.length > 0 && (
                          <div className="space-y-2">
                            {preguntas.map((p, i) => (
                              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                                <p className="font-medium text-gray-800">{i + 1}. {p.texto}</p>
                                {p.opciones.map((op, j) => (
                                  <p key={j} className={`text-xs mt-1 ${j === p.correcta ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                                    {String.fromCharCode(65 + j)}. {op} {j === p.correcta ? '✓' : ''}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="bg-white rounded-xl p-4 space-y-2 border border-gray-100">
                          <input type="text" value={nuevaPregunta.texto} onChange={e => setNuevaPregunta(p => ({ ...p, texto: e.target.value }))}
                            placeholder="Escribe la pregunta..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                          {nuevaPregunta.opciones.map((op, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input type="radio" checked={nuevaPregunta.correcta === i} onChange={() => setNuevaPregunta(p => ({ ...p, correcta: i }))} />
                              <input type="text" value={op} onChange={e => setNuevaPregunta(p => ({ ...p, opciones: p.opciones.map((o, j) => j === i ? e.target.value : o) }))}
                                placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                            </div>
                          ))}
                          <button onClick={agregarPregunta} className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200">+ Agregar pregunta</button>
                        </div>
                      </div>
                    )}
                    <button onClick={agregarContenido} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors shadow-md">✅ Agregar este contenido</button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
              <button onClick={() => { setMostrarModal(false); setNuevaAct({ titulo: '', descripcion: '', fechaInicio: '', fechaLimite: '', contenidos: [], foroActivo: false, foroTema: '', foroFechaLimite: '' }); setTipoSel(null) }}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={crearActividad} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-md">Crear Actividad</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Actividades
