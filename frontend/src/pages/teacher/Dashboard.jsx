import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfesor } from '../../context/ProfesorContext'
import { academicService } from '../../services/api'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
]

const fmt = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const diasRestantesGracia = (vence) => {
  if (!vence) return 0
  const finGracia = new Date(vence)
  finGracia.setDate(finGracia.getDate() + 3)
  const dias = Math.ceil((finGracia - new Date()) / (1000 * 60 * 60 * 24))
  return dias > 0 ? dias : 0
}

export default function TeacherDashboard() {
  const { usuario } = useAuth()
  const enGracia = usuario?.estadoMembresia === 'gracia'
  const diasGracia = enGracia ? diasRestantesGracia(usuario?.membresiaVence) : 0
  const navigate = useNavigate()
  const { periodos } = useProfesor()
  const [estadisticas, setEstadisticas] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await academicService.getEstadisticas()
        setEstadisticas(res.data || [])
      } catch (err) {
        console.error('Error cargando estadisticas:', err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const todosGrados = (estadisticas || []).flatMap(p => p.grados || [])
  const todasMaterias = todosGrados.flatMap(g => g.materias || [])
  const todasActs = todasMaterias.flatMap(m => m.actividades || [])

  const estudiantesUnicos = new Set()
  todasMaterias.forEach(m => (m.inscripciones || []).forEach(i => estudiantesUnicos.add(i.estudianteId)))
  const totalEst = estudiantesUnicos.size

  const totalActs = todasActs.length
  const entregas = todasActs.reduce((a, act) => a + (act.entregas?.filter(e => e.entregado).length || 0), 0)
  const entregasPosibles = todasActs.reduce((a, act) => a + (act.entregas?.length || 0), 0)
  const pctEntregas = entregasPosibles > 0 ? Math.round((entregas / entregasPosibles) * 100) : 0

  const recientes = [...todasActs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  const stats = [
    { label: 'Estudiantes', val: totalEst, icon: '👨‍🎓', bg: 'bg-purple-50', txt: 'text-purple-700', ruta: '/profesor/estudiantes' },
    { label: 'Actividades', val: totalActs, icon: '📝', bg: 'bg-blue-50', txt: 'text-blue-700', ruta: '/profesor/cursos' },
    { label: 'Entregas', val: pctEntregas + '%', icon: '📬', bg: 'bg-green-50', txt: 'text-green-700', ruta: '/profesor/cursos' },
    { label: 'Grados', val: todosGrados.length, icon: '🎒', bg: 'bg-yellow-50', txt: 'text-yellow-700', ruta: '/profesor/cursos' },
  ]

  return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5 py-6 space-y-7">

        {/* Banner de gracia */}
        {enGracia && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap w-full">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <p className="font-bold text-orange-800">Tu membresía venció</p>
                <p className="text-orange-600 text-sm">
                  {'Tienes ' + diasGracia + ' día' + (diasGracia !== 1 ? 's' : '') + ' de gracia para renovar antes de perder el acceso.'}
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/profesor/perfil')}
              className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 shadow-md whitespace-nowrap">
              Renovar ahora
            </button>
          </div>
        )}

        {/* Bienvenida */}
        <div className="rounded-2xl p-7 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED,#A78BFA)' }}>
          <div>
            <h2 className="text-2xl font-bold text-white">
              <span>{'¡Bienvenido, Profe ' + (usuario?.nombre?.split(' ')[0] || '') + '! '}</span>
            </h2>
            <p className="text-purple-200 text-sm mt-1">Resumen de tu actividad académica</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl hidden md:flex">
            {usuario?.nombre?.charAt(0)}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="w-11 h-11 bg-gray-100 rounded-xl mb-3" />
                <div className="h-8 bg-gray-100 rounded mb-2 w-16" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(s => (
              <button key={s.label} onClick={() => navigate(s.ruta)} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left border-2 border-transparent hover:border-purple-100">
                <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{s.icon}</div>
                <div className={'text-3xl font-bold ' + s.txt}>{s.val}</div>
                <div className="text-gray-600 text-sm font-medium mt-0.5">{s.label}</div>
              </button>
            ))}
          </div>
        )}

        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4">Accesos rápidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📚', label: 'Mis Cursos', sub: 'Centro principal', ruta: '/profesor/cursos', bg: 'bg-purple-50', txt: 'text-purple-700', highlight: true },
              { icon: '👨‍🎓', label: 'Estudiantes', sub: 'Lista y progreso', ruta: '/profesor/estudiantes', bg: 'bg-blue-50', txt: 'text-blue-700' },
              { icon: '📊', label: 'Analíticas', sub: 'Estadísticas', ruta: '/profesor/analiticas', bg: 'bg-yellow-50', txt: 'text-yellow-700' },
              { icon: '👤', label: 'Mi Perfil', sub: 'Configuración', ruta: '/profesor/perfil', bg: 'bg-orange-50', txt: 'text-orange-700' },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.ruta)}
                className={'bg-white rounded-2xl p-5 text-left hover:-translate-y-1 hover:shadow-md transition-all shadow-sm border-2 ' + (item.highlight ? 'border-purple-200 bg-purple-50' : 'border-transparent hover:border-purple-100')}>
                <div className={'w-11 h-11 ' + item.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{item.icon}</div>
                <h4 className={'font-bold ' + item.txt + ' text-sm'}>{item.label}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                {item.highlight && <span className="inline-block mt-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Principal</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Actividades recientes</h3>
            <button onClick={() => navigate('/profesor/cursos')} className="text-purple-600 text-sm font-medium hover:underline">Ver todas →</button>
          </div>
          {recientes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <span className="text-5xl">📭</span>
              <p className="text-gray-500 mt-3 font-semibold">Sin actividades aún</p>
              <button onClick={() => navigate('/profesor/cursos')} className="mt-4 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all">
                Ir a Mis Cursos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recientes.map(act => {
                const ent = act.entregas?.filter(e => e.entregado).length || 0
                const tot = act.entregas?.length || 0
                const pct = tot > 0 ? Math.round((ent / tot) * 100) : 0
                return (
                  <div key={act.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📝</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{act.titulo}</p>
                      <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                        <span>{'⏰ ' + fmt(act.fechaLimite)}</span>
                        <span>{'📬 ' + ent + '/' + tot}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                        <div className={'h-1.5 rounded-full ' + (pct === 100 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: pct + '%' }} />
                      </div>
                    </div>
                    <span className={'text-sm font-bold ' + (pct === 100 ? 'text-green-600' : pct >= 70 ? 'text-blue-600' : 'text-yellow-600')}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}