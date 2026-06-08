import { useState, useEffect } from 'react'
import { academicService } from '../../services/api'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
]

export default function Estudiantes() {
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState('periodos')
  const [periodoSel, setPeriodoSel] = useState(null)
  const [gradoSel, setGradoSel] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await academicService.getEstadisticas()
        setPeriodos(res.data || [])
      } catch (err) {
        console.error('Error cargando estudiantes:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const gradosDelPeriodo = periodoSel
    ? (periodos.find(p => p.id === periodoSel.id)?.grados || [])
    : []
  const gradoActual = gradoSel
    ? (gradosDelPeriodo.find(g => g.id === gradoSel.id) || gradoSel)
    : null

  // Estudiantes únicos del grado (de todas sus materias)
  const estudiantesGrado = []
  if (gradoActual) {
    const mapa = {}
    ;(gradoActual.materias || []).forEach(m => {
      ;(m.inscripciones || []).forEach(insc => {
        const est = insc.estudiante
        if (!est) return
        if (!mapa[est.id]) {
          mapa[est.id] = { ...est, materias: [], entregas: [], califs: [] }
        }
        mapa[est.id].materias.push(m.nombre)
        ;(m.actividades || []).forEach(act => {
          const ent = (act.entregas || []).find(e => e.estudianteId === est.id)
          if (ent) {
            mapa[est.id].entregas.push(ent)
            if (ent.calificacion != null) mapa[est.id].califs.push(ent.calificacion)
          }
        })
      })
    })
    estudiantesGrado.push(...Object.values(mapa))
  }

  // Todas las actividades del grado para la planilla
  const todasActividades = gradoActual
    ? (gradoActual.materias || []).flatMap(m =>
        (m.actividades || []).map(a => ({ ...a, materiaNombre: m.nombre }))
      )
    : []

  const estudiantesFiltrados = estudiantesGrado.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleVolver = () => {
    if (vista === 'lista') { setGradoSel(null); setBusqueda(''); setVista('grados') }
    else if (vista === 'grados') { setPeriodoSel(null); setVista('periodos') }
  }

  const COLS = [
    { bg: 'bg-[#EDE7FF]', border: 'border-purple-200', text: 'text-purple-700' },
    { bg: 'bg-[#D6E8FF]', border: 'border-blue-200',   text: 'text-blue-700'   },
    { bg: 'bg-[#DDF7E9]', border: 'border-green-200',  text: 'text-green-700'  },
    { bg: 'bg-[#FFF4CC]', border: 'border-yellow-200', text: 'text-yellow-700' },
  ]

  if (loading) return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {vista !== 'periodos' && (
              <button onClick={handleVolver} className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm">←</button>
            )}
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                {vista === 'periodos' && 'Estudiantes 👨‍🎓'}
                {vista === 'grados' && ((periodoSel?.nombre || '') + ' — Grados')}
                {vista === 'lista' && ((gradoSel?.nombre || '') + ' — Estudiantes')}
              </h2>
              <p className="text-gray-400 text-sm">
                {vista === 'periodos' && 'Selecciona un periodo'}
                {vista === 'grados' && 'Selecciona un grado'}
                {vista === 'lista' && (estudiantesGrado.length + ' estudiantes inscritos')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {periodoSel && <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-semibold">{periodoSel.nombre}</span>}
            {gradoSel && <><span className="text-gray-300">›</span><span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg font-semibold">{gradoSel.nombre}</span></>}
          </div>
        </div>

        {/* PERIODOS */}
        {vista === 'periodos' && (
          periodos.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
              <span className="text-6xl">👨‍🎓</span>
              <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Sin periodos aun</h3>
              <p className="text-gray-400 text-sm">Crea periodos y materias para que los estudiantes se inscriban</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {periodos.map((p, i) => {
                const c = COLS[i % COLS.length]
                const numEst = new Set((p.grados || []).flatMap(g => (g.materias || []).flatMap(m => (m.inscripciones || []).map(ins => ins.estudianteId)))).size
                return (
                  <button key={p.id} onClick={() => { setPeriodoSel(p); setVista('grados') }}
                    className={c.bg + ' border-2 ' + c.border + ' rounded-2xl p-8 text-left hover:scale-[1.02] hover:shadow-lg transition-all shadow-sm group'}>
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className={'text-2xl font-bold ' + c.text + ' mb-1'}>{p.nombre}</h3>
                    <p className="text-gray-500 text-sm">{numEst + ' estudiante' + (numEst !== 1 ? 's' : '')}</p>
                    <div className={'mt-4 flex items-center gap-2 ' + c.text + ' text-sm font-semibold'}>
                      <span>Ver grados</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {/* GRADOS */}
        {vista === 'grados' && (
          gradosDelPeriodo.length === 0 ? (
            <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
              <span className="text-5xl">🎒</span>
              <p className="text-gray-500 mt-3 font-semibold">Sin grados en este periodo</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {gradosDelPeriodo.map(g => {
                const numEst = new Set((g.materias || []).flatMap(m => (m.inscripciones || []).map(i => i.estudianteId))).size
                return (
                  <button key={g.id} onClick={() => { setGradoSel(g); setVista('lista') }}
                    className="bg-white rounded-2xl p-7 text-left hover:scale-[1.02] hover:shadow-lg transition-all shadow-sm border-2 border-gray-100 hover:border-purple-200 group">
                    <div className="text-5xl mb-3">🎒</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{g.nombre}</h3>
                    <p className="text-gray-400 text-sm">{numEst + ' estudiantes'}</p>
                    <div className="mt-3 flex items-center gap-2 text-purple-600 text-sm font-semibold">
                      <span>Ver lista</span><span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )
        )}

        {/* LISTA */}
        {vista === 'lista' && (
          <div className="space-y-5">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="Buscar por nombre o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm transition-all" />
            </div>

            {estudiantesFiltrados.length === 0 ? (
              <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                <span className="text-5xl">{busqueda ? '🔍' : '👨‍🎓'}</span>
                <p className="text-gray-500 mt-3 font-semibold">{busqueda ? 'Sin resultados' : 'Sin estudiantes inscritos'}</p>
                <p className="text-gray-400 text-sm mt-1">{busqueda ? 'Intenta con otro nombre' : 'Los estudiantes apareceran cuando se inscriban con la clave de matricula'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {estudiantesFiltrados.map(est => {
                  const entregadas = est.entregas.filter(e => e.entregado).length
                  const prom = est.califs.length > 0 ? (est.califs.reduce((a, b) => a + b, 0) / est.califs.length).toFixed(1) : null
                  return (
                    <div key={est.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                      <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
                        {est.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800">{est.nombre}</p>
                        <p className="text-gray-400 text-xs truncate">{est.email}</p>
                        <p className="text-gray-400 text-xs">{est.materias.join(', ')}</p>
                      </div>
                      <div className="flex gap-6 text-center flex-shrink-0">
                        <div>
                          <p className="font-bold text-purple-600">{entregadas + '/' + todasActividades.length}</p>
                          <p className="text-xs text-gray-400">Entregas</p>
                        </div>
                        <div>
                          <p className={'font-bold ' + (prom >= 7 ? 'text-green-600' : prom ? 'text-yellow-600' : 'text-gray-400')}>
                            {prom ? (prom + '/10') : 'S/N'}
                          </p>
                          <p className="text-xs text-gray-400">Promedio</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {todasActividades.length > 0 && estudiantesGrado.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-4">Planilla de notas — {periodoSel?.nombre}</h3>
                <div className="bg-white rounded-2xl shadow-sm overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-100">
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 sticky left-0 bg-slate-50 min-w-40">Estudiante</th>
                        {todasActividades.map(act => (
                          <th key={act.id} className="text-center py-3 px-3 font-semibold text-gray-500 text-xs min-w-28">
                            <div className="text-gray-600 truncate max-w-24">{act.titulo}</div>
                            <div className="text-gray-400 font-normal">{act.materiaNombre}</div>
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 font-semibold text-gray-600 min-w-24">Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantesFiltrados.map(est => {
                        const notas = todasActividades.map(act => {
                          const ent = act.entregas?.find(e => e.estudianteId === est.id)
                          return ent?.calificacion ?? null
                        })
                        const califs = notas.filter(n => n != null)
                        const prom = califs.length > 0 ? (califs.reduce((a, n) => a + n, 0) / califs.length).toFixed(1) : null
                        return (
                          <tr key={est.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-800 sticky left-0 bg-white">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">{est.nombre.charAt(0)}</div>
                                <span className="truncate max-w-32">{est.nombre}</span>
                              </div>
                            </td>
                            {notas.map((nota, i) => (
                              <td key={i} className="py-3 px-3 text-center">
                                {nota != null
                                  ? <span className={'font-bold ' + (nota >= 7 ? 'text-green-600' : nota >= 5 ? 'text-yellow-600' : 'text-red-500')}>{nota}</span>
                                  : <span className="text-gray-300 text-xs">—</span>
                                }
                              </td>
                            ))}
                            <td className="py-3 px-4 text-center">
                              {prom
                                ? <span className={'font-bold ' + (prom >= 7 ? 'text-green-600' : prom >= 5 ? 'text-yellow-600' : 'text-red-500')}>{prom}</span>
                                : <span className="text-gray-300 text-xs">—</span>
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
} 