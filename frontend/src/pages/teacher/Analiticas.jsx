import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { academicService } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORES = ['#7C3AED', '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA']

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
]

export default function Analiticas() {
  const navigate = useNavigate()
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await academicService.getEstadisticas()
        setPeriodos(res.data || [])
      } catch (err) {
        console.error('Error cargando estadisticas:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  // Calcular datos
  const todosGrados = periodos.flatMap(p => (p.grados || []).map(g => ({ ...g, periodoNombre: p.nombre })))
  const todasMaterias = todosGrados.flatMap(g => g.materias || [])
  const todasActividades = todasMaterias.flatMap(m => m.actividades || [])
  const todasEntregas = todasActividades.flatMap(a => a.entregas || [])

  // Estudiantes únicos
  const estudiantesUnicos = new Set()
  todasMaterias.forEach(m => (m.inscripciones || []).forEach(i => estudiantesUnicos.add(i.estudianteId)))
  const totalEstudiantes = estudiantesUnicos.size

  const totalActividades = todasActividades.length
  const totalEntregas = todasEntregas.filter(e => e.entregado).length
  const totalEntregasPosibles = todasEntregas.length
  const porcentajeEntregas = totalEntregasPosibles > 0 ? Math.round((totalEntregas / totalEntregasPosibles) * 100) : 0
  const todasCalifs = todasEntregas.filter(e => e.calificacion != null).map(e => e.calificacion)
  const promedioGeneral = todasCalifs.length > 0
    ? (todasCalifs.reduce((a, b) => a + b, 0) / todasCalifs.length).toFixed(1)
    : 0

  // Data por grado
  const dataPorGrado = todosGrados.map((g, i) => {
    const actsGrado = (g.materias || []).flatMap(m => m.actividades || [])
    const entregasGrado = actsGrado.flatMap(a => a.entregas || [])
    const califs = entregasGrado.filter(e => e.calificacion != null).map(e => e.calificacion)
    const prom = califs.length > 0 ? parseFloat((califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)) : 0
    const entregadas = entregasGrado.filter(e => e.entregado).length
    const posibles = entregasGrado.length
    const estudiantesGrado = new Set()
    ;(g.materias || []).forEach(m => (m.inscripciones || []).forEach(i => estudiantesGrado.add(i.estudianteId)))
    return {
      name: g.nombre + (g.periodoNombre ? ' (' + g.periodoNombre + ')' : ''),
      promedio: prom,
      estudiantes: estudiantesGrado.size,
      entregas: entregadas,
      entregasPosibles: posibles,
      porcentaje: posibles > 0 ? Math.round((entregadas / posibles) * 100) : 0,
      fill: COLORES[i % COLORES.length]
    }
  })

  // Data por periodo
  const dataPorPeriodo = periodos.map((p, i) => {
    const actsP = (p.grados || []).flatMap(g => (g.materias || []).flatMap(m => m.actividades || []))
    const califs = actsP.flatMap(a => (a.entregas || []).filter(e => e.calificacion != null).map(e => e.calificacion))
    const prom = califs.length > 0 ? parseFloat((califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)) : 0
    return { name: p.nombre, actividades: actsP.length, promedio: prom, fill: COLORES[i % COLORES.length] }
  })

  // Pie entregas
  const dataPie = [
    { name: 'Entregadas', value: totalEntregas, fill: '#34D399' },
    { name: 'Pendientes', value: totalEntregasPosibles - totalEntregas, fill: '#F87171' },
  ].filter(d => d.value > 0)

  // Top estudiantes
  const mapaEstudiantes = {}
  todasMaterias.forEach(m => {
    ;(m.inscripciones || []).forEach(insc => {
      const id = insc.estudianteId
      if (!mapaEstudiantes[id]) mapaEstudiantes[id] = { id, nombre: insc.estudiante?.nombre || 'Estudiante', califs: [], grado: todosGrados.find(g => g.materias?.some(mat => mat.id === m.id))?.nombre }
      ;(m.actividades || []).forEach(act => {
        const ent = (act.entregas || []).find(e => e.estudianteId === id)
        if (ent?.calificacion != null) mapaEstudiantes[id].califs.push(ent.calificacion)
      })
    })
  })
  const topEstudiantes = Object.values(mapaEstudiantes)
    .filter(e => e.califs.length > 0)
    .map(e => ({ ...e, promedio: parseFloat((e.califs.reduce((a, b) => a + b, 0) / e.califs.length).toFixed(1)) }))
    .sort((a, b) => b.promedio - a.promedio)
    .slice(0, 5)

  if (loading) return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  )

  return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Analíticas 📊</h2>
          <p className="text-gray-400 text-sm mt-0.5">Estadísticas en tiempo real de tu actividad académica</p>
        </div>

        {totalActividades === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <span className="text-6xl">📊</span>
            <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">Sin datos aún</h3>
            <p className="text-gray-500 text-sm mb-6">Crea actividades y agrega estudiantes para ver las analíticas</p>
            <button onClick={() => navigate('/profesor/cursos')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md">
              Ir a Mis Cursos
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: 'Estudiantes', value: totalEstudiantes, icon: '👨‍🎓', bg: 'bg-purple-50', txt: 'text-purple-700' },
                { label: 'Actividades', value: totalActividades, icon: '📝', bg: 'bg-blue-50', txt: 'text-blue-700' },
                { label: 'Promedio general', value: promedioGeneral > 0 ? promedioGeneral + '/10' : 'S/N', icon: '⭐', bg: 'bg-yellow-50', txt: 'text-yellow-700' },
                { label: '% Entregas', value: porcentajeEntregas + '%', icon: '📬', bg: 'bg-green-50', txt: 'text-green-700' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{s.icon}</div>
                  <div className={'text-3xl font-black ' + s.txt + ' mb-1'}>{s.value}</div>
                  <div className="text-gray-500 text-sm font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Promedio por grado</h3>
                {dataPorGrado.every(d => d.promedio === 0) ? (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sin calificaciones aún</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dataPorGrado}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => [v + '/10', 'Promedio']} />
                      <Bar dataKey="promedio" radius={[8, 8, 0, 0]}>
                        {dataPorGrado.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Estado de entregas</h3>
                {dataPie.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sin entregas aún</div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={200}>
                      <PieChart>
                        <Pie data={dataPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                          {dataPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {dataPie.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                          <span className="text-sm text-gray-600">{d.name}</span>
                          <span className="font-bold text-gray-800 ml-2">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Actividades por periodo</h3>
              {dataPorPeriodo.every(d => d.actividades === 0) ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Sin actividades aún</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dataPorPeriodo}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="actividades" name="Actividades" radius={[8, 8, 0, 0]}>
                      {dataPorPeriodo.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Detalle por grado</h3></div>
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Grado</th>
                    <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Estudiantes</th>
                    <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Promedio</th>
                    <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Entregas</th>
                    <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase">% Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPorGrado.map((g, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: g.fill }}>🎒</div>
                          <span className="font-semibold text-gray-800">{g.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-purple-600">{g.estudiantes}</td>
                      <td className="py-4 px-6 text-center">
                        {g.promedio > 0
                          ? <span className={'font-bold ' + (g.promedio >= 7 ? 'text-green-600' : g.promedio >= 5 ? 'text-yellow-600' : 'text-red-500')}>{g.promedio}/10</span>
                          : <span className="text-gray-400 text-sm">Sin notas</span>}
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">{g.entregas}/{g.entregasPosibles}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={'font-bold text-sm ' + (g.porcentaje >= 70 ? 'text-green-600' : g.porcentaje >= 40 ? 'text-yellow-600' : 'text-red-500')}>{g.porcentaje}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {topEstudiantes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">🏆 Top estudiantes por promedio</h3></div>
                <div className="p-5 space-y-3">
                  {topEstudiantes.map((est, i) => (
                    <div key={est.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <span className="text-xl w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.'}</span>
                      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">{est.nombre.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{est.nombre}</p>
                        <p className="text-gray-400 text-xs">{est.grado}</p>
                      </div>
                      <span className={'font-bold text-sm ' + (est.promedio >= 7 ? 'text-green-600' : 'text-yellow-600')}>{est.promedio}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}