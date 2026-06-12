import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { academicService } from '../../services/api'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio',      path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos',  path: '/profesor/cursos' },
  { icon: '🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analiticas',  path: '/profesor/analiticas' },
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

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: 'rgba(255,255,255,0.04)', borderRadius: 16,
    border: '1px solid rgba(124,58,237,0.18)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(8px)',
    ...style, cursor: onClick ? 'pointer' : 'default'
  }}>
    {children}
  </div>
)

const COLORES_MATERIA = [
  { bg: 'linear-gradient(135deg,#7C3AED,#4C1D95)', light: 'rgba(124,58,237,0.2)' },
  { bg: 'linear-gradient(135deg,#0369A1,#1E40AF)', light: 'rgba(29,78,216,0.2)'  },
  { bg: 'linear-gradient(135deg,#065F46,#059669)', light: 'rgba(5,150,105,0.2)'  },
  { bg: 'linear-gradient(135deg,#92400E,#D97706)', light: 'rgba(217,119,6,0.2)'  },
]

export default function TeacherDashboard() {
  const { usuario } = useAuth()
  const enGracia = usuario?.estadoMembresia === 'gracia'
  const diasGracia = enGracia ? diasRestantesGracia(usuario?.membresiaVence) : 0
  const navigate = useNavigate()
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

  const todosGrados   = (estadisticas || []).flatMap(p => p.grados || [])
  const todasMaterias = todosGrados.flatMap(g => g.materias || [])
  const todasActs     = todasMaterias.flatMap(m => m.actividades || [])

  const estudiantesUnicos = new Set()
  todasMaterias.forEach(m => (m.inscripciones || []).forEach(i => estudiantesUnicos.add(i.estudianteId)))
  const totalEst      = estudiantesUnicos.size
  const totalActs     = todasActs.length
  const entregas      = todasActs.reduce((a, act) => a + (act.entregas?.filter(e => e.entregado).length || 0), 0)
  const entregasPosibles = todasActs.reduce((a, act) => a + (act.entregas?.length || 0), 0)
  const pctEntregas   = entregasPosibles > 0 ? Math.round((entregas / entregasPosibles) * 100) : 0

  // Pendientes a calificar: entregadas pero sin calificacion
  const pendientesCalificar = todasActs.filter(act =>
    act.entregas?.some(e => e.entregado && e.calificacion == null)
  ).map(act => ({
    ...act,
    sinCalif: act.entregas?.filter(e => e.entregado && e.calificacion == null).length || 0
  })).sort((a, b) => b.sinCalif - a.sinCalif).slice(0, 5)

  const nombre = usuario?.nombre?.split(' ')[0] || ''

  const stats = [
    { label: 'Cursos activos',        val: todasMaterias.length, icon: '📚', color: '#A78BFA', bg: 'rgba(124,58,237,0.2)'  },
    { label: 'Estudiantes',           val: totalEst,             icon: '🎓', color: '#60A5FA', bg: 'rgba(59,130,246,0.2)'  },
    { label: 'Entregas completadas',  val: pctEntregas + '%',    icon: '✅', color: '#34D399', bg: 'rgba(16,185,129,0.2)'  },
    { label: 'Pendientes por revisar',val: pendientesCalificar.length, icon: '⭐', color: '#FBBF24', bg: 'rgba(245,158,11,0.2)' },
  ]

  return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Banner gracia */}
        {enGracia && (
          <Card style={{ background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.3)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>⚠️</span>
              <div>
                <p style={{ fontWeight: 700, color: '#FED7AA', margin: 0, fontSize: 14 }}>Tu membresia vencio</p>
                <p style={{ fontSize: 12, color: '#FB923C', margin: '2px 0 0' }}>
                  Tienes {diasGracia} dia{diasGracia !== 1 ? 's' : ''} de gracia para renovar.
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/profesor/perfil')}
              style={{ background: '#EA580C', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'Poppins,sans-serif', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Renovar ahora
            </button>
          </Card>
        )}

        {/* Hero Banner */}
        <Card style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #2d1065 40%, #3b0f8c 70%, #1e0a4a 100%)',
          border: '1px solid rgba(124,58,237,0.3)', overflow: 'hidden', position: 'relative', minHeight: 160
        }}>
          {/* Decoracion */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', right: 100, bottom: -60, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)' }} />
          {/* Estrellas */}
          {['8%','20%','45%','68%','85%'].map((l, i) => (
            <div key={i} style={{ position: 'absolute', left: l, top: i % 2 === 0 ? '15%' : '70%', color: 'rgba(167,139,250,0.5)', fontSize: 12 }}>✦</div>
          ))}

          <div style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                {'Bienvenida, Profe ' + nombre + '! 👋'}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(196,181,253,0.8)', margin: '0 0 20px' }}>Hoy es un gran dia para inspirar y transformar vidas.</p>

              {/* Mini stats en hero */}
              {!loading && (
                <div style={{ display: 'flex', gap: 24 }}>
                  {stats.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{s.icon}</span>
                      <div>
                        <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                        <p style={{ fontSize: 10, color: 'rgba(196,181,253,0.7)', margin: 0 }}>{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ilustracion IA */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.6))' }}>
                🧠
              </div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 0 12px rgba(124,58,237,0.8)' }}>AI</div>
            </div>
          </div>
        </Card>

        {/* Resumen general */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', margin: '0 0 12px', letterSpacing: 0.3 }}>Resumen general ∿∿</p>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {[1,2,3,4].map(i => (
                <Card key={i} style={{ padding: '18px', height: 100 }}>
                  <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 10, width: '50%' }} />
                  <div style={{ height: 28, background: 'rgba(255,255,255,0.06)', borderRadius: 8, width: '40%' }} />
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              {stats.map((s, i) => (
                <Card key={i} onClick={() => navigate(i === 0 || i === 2 ? '/profesor/cursos' : i === 1 ? '/profesor/estudiantes' : '/profesor/cursos')}
                  style={{ padding: '18px 20px', transition: 'transform .15s, box-shadow .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                      <p style={{ fontSize: 11, color: 'rgba(209,213,219,0.6)', margin: '4px 0 0', lineHeight: 1.3 }}>{s.label}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 10.5, color: 'rgba(167,139,250,0.5)', margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: '#34D399' }}>↑</span> Actualizado ahora
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Mis cursos activos + Actividad reciente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Mis cursos activos */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', margin: 0 }}>Mis cursos activos +</p>
              <button onClick={() => navigate('/profesor/cursos')} style={{ fontSize: 12, color: '#7C3AED', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Ver todos</button>
            </div>
            {todasMaterias.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <span style={{ fontSize: 36 }}>📭</span>
                <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 13, marginTop: 8 }}>Sin cursos aun</p>
                <button onClick={() => navigate('/profesor/cursos')}
                  style={{ marginTop: 10, background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'Poppins,sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  Ir a Mis Cursos
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todasMaterias.slice(0, 4).map((m, i) => {
                  const col = COLORES_MATERIA[i % COLORES_MATERIA.length]
                  const numEst = m.inscripciones?.length || 0
                  const acts = m.actividades?.length || 0
                  const ent = m.actividades?.reduce((a, act) => a + (act.entregas?.filter(e => e.entregado).length || 0), 0) || 0
                  const pct = (acts > 0 && numEst > 0) ? Math.round((ent / (acts * numEst)) * 100) : 0
                  return (
                    <button key={m.id} onClick={() => navigate('/profesor/cursos')}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: col.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                        {m.icono || m.icon || '📖'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#F3F4F6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nombre}</p>
                        <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.7)', margin: '2px 0 6px' }}>{numEst + ' estudiantes'}</p>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
                          <div style={{ width: pct + '%', height: '100%', background: col.bg, borderRadius: 999, transition: 'width .4s' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(167,139,250,0.8)', flexShrink: 0 }}>{pct}%</span>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Pendientes a calificar */}
          <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', margin: 0 }}>Pendientes por calificar</p>
              <button onClick={() => navigate('/profesor/cursos')} style={{ fontSize: 12, color: '#7C3AED', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>Ver todas</button>
            </div>
            {pendientesCalificar.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <span style={{ fontSize: 36 }}>✅</span>
                <p style={{ color: 'rgba(209,213,219,0.5)', fontSize: 13, marginTop: 8 }}>Todo calificado</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pendientesCalificar.map((act, i) => (
                  <button key={act.id} onClick={() => navigate('/profesor/cursos')}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📋</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#F3F4F6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.titulo}</p>
                      <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.7)', margin: '2px 0 0' }}>{'Limite: ' + fmt(act.fechaLimite)}</p>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontSize: 18, fontWeight: 900, color: '#FBBF24', margin: 0 }}>{act.sinCalif}</p>
                      <p style={{ fontSize: 9, color: 'rgba(156,163,175,0.6)', margin: 0, fontWeight: 600 }}>SIN NOTA</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Accesos rapidos */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', margin: '0 0 12px' }}>Atajos rapidos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { icon: '📝', label: 'Crear actividad',  sub: 'Nueva tarea',       ruta: '/profesor/cursos',      color: '#A78BFA', bg: 'rgba(124,58,237,0.2)' },
              { icon: '🎓', label: 'Estudiantes',       sub: 'Ver lista',         ruta: '/profesor/estudiantes', color: '#60A5FA', bg: 'rgba(59,130,246,0.2)'  },
              { icon: '📊', label: 'Analiticas',        sub: 'Ver estadisticas',  ruta: '/profesor/analiticas',  color: '#34D399', bg: 'rgba(16,185,129,0.2)'  },
              { icon: '👤', label: 'Mi Perfil',         sub: 'Configuracion',     ruta: '/profesor/perfil',      color: '#FBBF24', bg: 'rgba(245,158,11,0.2)'  },
            ].map((item, i) => (
              <Card key={i} onClick={() => navigate(item.ruta)}
                style={{ padding: '18px', textAlign: 'center', transition: 'transform .15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 10px' }}>{item.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: item.color, margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.6)', margin: 0 }}>{item.sub}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
