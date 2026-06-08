import { useAuth } from '../../context/AuthContext'
import { useProfesor } from '../../context/ProfesorContext'
import Layout from '../../components/Layout'
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
]

export default function Progreso() {
  const { usuario } = useAuth()
  const { inscripciones } = useProfesor()

  const miId = usuario?.id

  // Calcular datos reales desde inscripciones
  const todasActividades = inscripciones.flatMap(i => i.materia?.actividades || [])
  const todasEntregas = todasActividades.map(act => ({
    act,
    entrega: (act.entregas || []).find(e => e.estudianteId === miId)
  }))

  const total = todasActividades.length
  const entregadas = todasEntregas.filter(e => e.entrega?.entregado).length
  const califs = todasEntregas.filter(e => e.entrega?.calificacion != null).map(e => e.entrega.calificacion)
  const promedio = califs.length > 0 ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1) : null
  const porcentaje = total > 0 ? Math.round((entregadas / total) * 100) : 0

  // Distribucion de notas real
  const excelente = califs.filter(c => c >= 9).length
  const bueno = califs.filter(c => c >= 7 && c < 9).length
  const regular = califs.filter(c => c >= 5 && c < 7).length
  const bajo = califs.filter(c => c < 5).length
  const totalCalifs = califs.length || 1

  const rendimientoData = [
    { name: 'Excelente (9-10)', value: Math.round((excelente / totalCalifs) * 100), color: '#7C3AED' },
    { name: 'Bueno (7-8)', value: Math.round((bueno / totalCalifs) * 100), color: '#A78BFA' },
    { name: 'Regular (5-6)', value: Math.round((regular / totalCalifs) * 100), color: '#DDD6FE' },
    { name: 'Bajo (<5)', value: Math.round((bajo / totalCalifs) * 100), color: '#F87171' },
  ].filter(d => d.value > 0)

  const progresoData = [{ name: 'Progreso', value: porcentaje, fill: '#7C3AED' }]

  const logros = [
    { icon: '🌟', label: 'Primera entrega', ok: entregadas >= 1 },
    { icon: '🔥', label: '5 entregas', ok: entregadas >= 5 },
    { icon: '💯', label: 'Nota perfecta', ok: califs.some(c => c === 10) },
    { icon: '🚀', label: '3 tareas', ok: entregadas >= 3 },
    { icon: '🧠', label: '10 actividades', ok: entregadas >= 10 },
    { icon: '⭐', label: 'Promedio 8+', ok: promedio >= 8 },
    { icon: '🎯', label: 'Sin pendientes', ok: total > 0 && entregadas === total },
    { icon: '📚', label: '2 materias', ok: inscripciones.length >= 2 },
    { icon: '🌈', label: '3 materias', ok: inscripciones.length >= 3 },
    { icon: '👑', label: 'Promedio 9+', ok: promedio >= 9 },
    { icon: '🎓', label: '20 entregas', ok: entregadas >= 20 },
    { icon: '💎', label: 'Promedio 10', ok: promedio == 10 },
  ]

  // Progreso por materia
  const progresoPorMateria = inscripciones.map((insc, i) => {
    const acts = insc.materia?.actividades || []
    const entregadasM = acts.filter(act => (act.entregas || []).some(e => e.estudianteId === miId && e.entregado)).length
    const califsM = acts.flatMap(act => (act.entregas || []).filter(e => e.estudianteId === miId && e.calificacion != null).map(e => e.calificacion))
    const promM = califsM.length > 0 ? (califsM.reduce((a, b) => a + b, 0) / califsM.length).toFixed(1) : null
    const progM = acts.length > 0 ? Math.round((entregadasM / acts.length) * 100) : 0
    const COLS = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500']
    const TXTS = ['text-purple-700', 'text-blue-700', 'text-green-700', 'text-yellow-700']
    return { insc, progM, promM, entregadasM, total: acts.length, col: COLS[i % 4], txt: TXTS[i % 4] }
  })

  const stats = [
    { label: 'Promedio General', value: promedio ? (promedio + '/10') : 'S/N', icon: '⭐', from: 'from-purple-500', to: 'to-purple-700', sub: 'Sobre 10' },
    { label: 'Tareas Entregadas', value: entregadas, icon: '📝', from: 'from-violet-500', to: 'to-violet-700', sub: 'De ' + total + ' totales' },
    { label: 'Completado', value: porcentaje + '%', icon: '📊', from: 'from-indigo-500', to: 'to-indigo-700', sub: 'Progreso general' },
    { label: 'Logros', value: logros.filter(l => l.ok).length, icon: '🏆', from: 'from-fuchsia-500', to: 'to-fuchsia-700', sub: 'De ' + logros.length + ' posibles' },
  ]

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Mi Progreso 📈</h2>
          <p className="text-gray-400 text-sm mt-0.5">Analiza tu rendimiento academico</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className={'bg-gradient-to-br ' + s.from + ' ' + s.to + ' rounded-2xl p-5 text-white shadow-md'}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black mb-1">{s.value}</div>
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-xs opacity-80 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-4 self-start">Progreso General</h3>
            <div className="relative">
              <div style={{ width: '100%', height: 180 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={rendimientoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" isAnimationActive={false}>
                        {rendimientoData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-purple-600">{porcentaje}%</span>
                <span className="text-xs text-gray-400">Completado</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                <p className="text-purple-700 font-bold">{entregadas}</p>
                <p className="text-xs text-gray-500">Entregadas</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-blue-700 font-bold">{total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Distribucion de Notas</h3>
            {rendimientoData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Sin calificaciones aún</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={rendimientoData} innerRadius={50} outerRadius={80} dataKey="value">
                      {rendimientoData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {rendimientoData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {progresoPorMateria.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Progreso por Materia</h3>
            <div className="space-y-4">
              {progresoPorMateria.map(({ insc, progM, promM, entregadasM, total, col, txt }) => (
                <div key={insc.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-purple-50 border border-purple-200">
                    {insc.materia?.icono || '📖'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{insc.materiaName}</span>
                      <div className="flex items-center gap-3">
                        {promM && <span className={'text-xs font-bold ' + txt}>Prom: {promM}/10</span>}
                        <span className={'text-sm font-bold ' + txt}>{progM}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={col + ' h-2 rounded-full transition-all'} style={{ width: progM + '%' }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{entregadasM}/{total} actividades entregadas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Logros Obtenidos 🏆</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
            {logros.map(logro => (
              <div key={logro.label}
                className={'flex flex-col items-center gap-2 p-3 rounded-xl text-center border ' + (logro.ok ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-100 opacity-40')}>
                <span className="text-2xl">{logro.icon}</span>
                <span className="text-xs text-gray-600 font-medium leading-tight">{logro.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}