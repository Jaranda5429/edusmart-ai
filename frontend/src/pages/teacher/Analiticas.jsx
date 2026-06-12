import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { academicService } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORES = ['#7C3AED', '#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA']

const NAV = [
  { icon: '🏠', label: 'Inicio',      path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos',  path: '/profesor/cursos' },
  { icon: '🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analíticas',  path: '/profesor/analiticas' },
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

  const todosGrados       = periodos.flatMap(p => (p.grados || []).map(g => ({ ...g, periodoNombre: p.nombre })))
  const todasMaterias     = todosGrados.flatMap(g => g.materias || [])
  const todasActividades  = todasMaterias.flatMap(m => m.actividades || [])
  const todasEntregas     = todasActividades.flatMap(a => a.entregas || [])

  const estudiantesUnicos = new Set()
  todasMaterias.forEach(m => (m.inscripciones || []).forEach(i => estudiantesUnicos.add(i.estudianteId)))
  const totalEstudiantes      = estudiantesUnicos.size
  const totalActividades      = todasActividades.length
  const totalEntregas         = todasEntregas.filter(e => e.entregado).length
  const totalEntregasPosibles = todasEntregas.length
  const porcentajeEntregas    = totalEntregasPosibles > 0 ? Math.round((totalEntregas / totalEntregasPosibles) * 100) : 0
  const todasCalifs           = todasEntregas.filter(e => e.calificacion != null).map(e => e.calificacion)
  const promedioGeneral       = todasCalifs.length > 0
    ? (todasCalifs.reduce((a, b) => a + b, 0) / todasCalifs.length).toFixed(1)
    : 0

  const dataPorGrado = todosGrados.map((g, i) => {
    const actsGrado     = (g.materias || []).flatMap(m => m.actividades || [])
    const entregasGrado = actsGrado.flatMap(a => a.entregas || [])
    const califs        = entregasGrado.filter(e => e.calificacion != null).map(e => e.calificacion)
    const prom          = califs.length > 0 ? parseFloat((califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)) : 0
    const entregadas    = entregasGrado.filter(e => e.entregado).length
    const posibles      = entregasGrado.length
    const estudiantesGrado = new Set()
    ;(g.materias || []).forEach(m => (m.inscripciones || []).forEach(i => estudiantesGrado.add(i.estudianteId)))
    return {
      name: g.nombre + (g.periodoNombre ? ' (' + g.periodoNombre + ')' : ''),
      promedio: prom,
      estudiantes: estudiantesGrado.size,
      entregas: entregadas,
      entregasPosibles: posibles,
      porcentaje: posibles > 0 ? Math.round((entregadas / posibles) * 100) : 0,
      fill: COLORES[i % COLORES.length],
    }
  })

  const dataPorPeriodo = periodos.map((p, i) => {
    const actsP  = (p.grados || []).flatMap(g => (g.materias || []).flatMap(m => m.actividades || []))
    const califs = actsP.flatMap(a => (a.entregas || []).filter(e => e.calificacion != null).map(e => e.calificacion))
    const prom   = califs.length > 0 ? parseFloat((califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)) : 0
    return { name: p.nombre, actividades: actsP.length, promedio: prom, fill: COLORES[i % COLORES.length] }
  })

  const dataPie = [
    { name: 'Entregadas', value: totalEntregas,                          fill: '#34D399' },
    { name: 'Pendientes', value: totalEntregasPosibles - totalEntregas,  fill: '#F87171' },
  ].filter(d => d.value > 0)

  const mapaEstudiantes = {}
  todasMaterias.forEach(m => {
    ;(m.inscripciones || []).forEach(insc => {
      const id = insc.estudianteId
      if (!mapaEstudiantes[id]) {
        mapaEstudiantes[id] = {
          id,
          nombre: insc.estudiante?.nombre || 'Estudiante',
          califs: [],
          materia: m.nombre,
        }
      }
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

  // ── Estilos reutilizables ─────────────────────────────────────────────────
  const cardStyle  = { background: '#1C1535', borderRadius: 16, border: '1px solid rgba(124,58,237,0.2)' }
  const headStyle  = { padding: '16px 24px', borderBottom: '1px solid rgba(124,58,237,0.15)' }
  const thStyle    = { textAlign: 'left',   padding: '12px 24px', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', letterSpacing: 1 }
  const thCStyle   = { textAlign: 'center', padding: '12px 24px', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', letterSpacing: 1 }

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

        {/* Título */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#D97706,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 14px rgba(217,119,6,0.4)', flexShrink: 0 }}>📊</div>
          <div>
            <h2 className="text-2xl font-black text-gray-100">Analíticas</h2>
            <p style={{ fontSize: 13, color: 'rgba(167,139,250,0.7)', margin: 0 }}>Estadísticas en tiempo real de tu actividad académica</p>
          </div>
        </div>

        {totalActividades === 0 ? (
          <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
            <span className="text-6xl">📊</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#E5E7EB', margin: '16px 0 8px' }}>Sin datos aún</h3>
            <p style={{ color: 'rgba(156,163,175,0.6)', fontSize: 13, marginBottom: 24 }}>Crea actividades y agrega estudiantes para ver las analíticas</p>
            <button onClick={() => navigate('/profesor/cursos')} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md">
              Ir a Mis Cursos
            </button>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: 'Estudiantes',      value: totalEstudiantes,                                  icon: '🎓', bg: 'bg-purple-900/30', txt: 'text-purple-400' },
                { label: 'Actividades',      value: totalActividades,                                  icon: '📝', bg: 'bg-blue-900/30',   txt: 'text-blue-400'   },
                { label: 'Promedio general', value: promedioGeneral > 0 ? promedioGeneral + '/10' : 'S/N', icon: '⭐', bg: 'bg-yellow-900/30', txt: 'text-yellow-400' },
                { label: '% Entregas',       value: porcentajeEntregas + '%',                          icon: '📬', bg: 'bg-green-900/30',  txt: 'text-green-400'  },
              ].map(s => (
                <div key={s.label} style={cardStyle} className="p-5">
                  <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{s.icon}</div>
                  <div className={'text-3xl font-black ' + s.txt + ' mb-1'}>{s.value}</div>
                  <div style={{ color: 'rgba(156,163,175,0.65)', fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Gráficas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ fontWeight: 700, color: '#E5E7EB', marginBottom: 16 }}>Promedio por grado</h3>
                {dataPorGrado.every(d => d.promedio === 0) ? (
                  <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Sin calificaciones aún</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dataPorGrado}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <Tooltip formatter={v => [v + '/10', 'Promedio']} contentStyle={{ background: '#0F0A24', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, color: '#E5E7EB' }} />
                      <Bar dataKey="promedio" radius={[8, 8, 0, 0]}>
                        {dataPorGrado.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ ...cardStyle, padding: 24 }}>
                <h3 style={{ fontWeight: 700, color: '#E5E7EB', marginBottom: 16 }}>Estado de entregas</h3>
                {dataPie.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-gray-500 text-sm">Sin entregas aún</div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={200}>
                      <PieChart>
                        <Pie data={dataPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                          {dataPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0F0A24', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, color: '#E5E7EB' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {dataPie.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                          <span style={{ fontSize: 13, color: 'rgba(156,163,175,0.7)' }}>{d.name}</span>
                          <span style={{ fontWeight: 700, color: '#E5E7EB', marginLeft: 8 }}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actividades por periodo */}
            <div style={{ ...cardStyle, padding: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#E5E7EB', marginBottom: 16 }}>Actividades por periodo</h3>
              {dataPorPeriodo.every(d => d.actividades === 0) ? (
                <div className="flex items-center justify-center h-32 text-gray-500 text-sm">Sin actividades aún</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={dataPorPeriodo}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ background: '#0F0A24', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, color: '#E5E7EB' }} />
                    <Bar dataKey="actividades" name="Actividades" radius={[8, 8, 0, 0]}>
                      {dataPorPeriodo.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Tabla detalle por grado */}
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <div style={headStyle}><h3 style={{ fontWeight: 700, color: '#E5E7EB' }}>Detalle por grado</h3></div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(124,58,237,0.1)', borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
                    <th style={thStyle}>Grado</th>
                    <th style={thCStyle}>Estudiantes</th>
                    <th style={thCStyle}>Promedio</th>
                    <th style={thCStyle}>Entregas</th>
                    <th style={thCStyle}>% Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPorGrado.map((g, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: g.fill }}>🎒</div>
                          <span style={{ fontWeight: 600, color: '#E5E7EB' }}>{g.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-purple-400">{g.estudiantes}</td>
                      <td className="py-4 px-6 text-center">
                        {g.promedio > 0
                          ? <span className={'font-bold ' + (g.promedio >= 7 ? 'text-green-400' : g.promedio >= 5 ? 'text-yellow-400' : 'text-red-400')}>{g.promedio}/10</span>
                          : <span style={{ color: 'rgba(156,163,175,0.5)', fontSize: 13 }}>Sin notas</span>}
                      </td>
                      <td className="py-4 px-6 text-center" style={{ color: '#9CA3AF' }}>{g.entregas}/{g.entregasPosibles}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={'font-bold text-sm ' + (g.porcentaje >= 70 ? 'text-green-400' : g.porcentaje >= 40 ? 'text-yellow-400' : 'text-red-400')}>{g.porcentaje}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top estudiantes */}
            {topEstudiantes.length > 0 && (
              <div style={{ ...cardStyle, overflow: 'hidden' }}>
                <div style={headStyle}>
                  <h3 style={{ fontWeight: 700, color: '#E5E7EB' }}>🏆 Top estudiantes por promedio</h3>
                </div>
                <div className="p-5 space-y-3">
                  {topEstudiantes.map((est, i) => (
                    <div
                      key={est.id}
                      className="flex items-center gap-4 p-3 rounded-xl"
                      style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
                    >
                      <span className="text-xl w-8 flex-shrink-0">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.'}
                      </span>
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: COLORES[i % COLORES.length], color: '#FFFFFF' }}
                      >
                        {est.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontWeight: 700, color: '#E5E7EB', fontSize: 14 }}>{est.nombre}</p>
                        <p style={{ color: 'rgba(167,139,250,0.6)', fontSize: 12 }}>{est.materia}</p>
                      </div>
                      <span
                        className="font-bold text-sm px-3 py-1 rounded-lg"
                        style={{
                          background: est.promedio >= 7 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                          color:      est.promedio >= 7 ? '#34D399'               : '#FBBF24',
                        }}
                      >
                        {est.promedio}/10
                      </span>
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
