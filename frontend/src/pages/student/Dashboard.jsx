import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfesor } from '../../context/ProfesorContext'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio',         path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos',     path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas',         path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso',       path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos',         path: '/estudiante/juegos' },
]

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

export default function StudentDashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { matricularConClave, inscripciones, cargarInscripciones } = useProfesor()

  const [clave, setClave] = useState('')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  const totalActs = inscripciones.reduce((a, i) => a + (i.materia?.actividades?.length || 0), 0)
  const entregadas = inscripciones.reduce((a, i) =>
    a + (i.materia?.actividades?.filter(act => act.entregas?.some(e => e.entregado)).length || 0), 0)
  const pendientes = inscripciones.reduce((a, i) =>
    a + (i.materia?.actividades?.filter(act =>
      !act.entregas?.some(e => e.entregado) && new Date(act.fechaLimite) >= new Date()
    ).length || 0), 0)
  const califs = inscripciones.flatMap(i =>
    i.materia?.actividades?.flatMap(act =>
      act.entregas?.filter(e => e.calificacion != null).map(e => e.calificacion)
    ) || []
  ).filter(Boolean)
  const promedio = califs.length > 0
    ? (califs.reduce((a, b) => a + b, 0) / califs.length).toFixed(1)
    : null

  const proximas = inscripciones
    .flatMap(i => (i.materia?.actividades || [])
      .filter(act => !act.entregas?.some(e => e.entregado) && new Date(act.fechaLimite) >= new Date())
      .map(act => ({ ...act, materiaNombre: i.materia?.nombre, periodoNombre: i.materia?.grado?.periodo?.nombre }))
    )
    .sort((a, b) => new Date(a.fechaLimite) - new Date(b.fechaLimite))
    .slice(0, 4)

  const handleMatricular = async () => {
    if (!clave.trim()) return
    setLoading(true)
    setResultado(null)
    const res = await matricularConClave(clave.trim(), { nombre: usuario?.nombre || '', email: usuario?.email || '' })
    setResultado(res)
    setLoading(false)
    if (res.ok) { setClave(''); await cargarInscripciones() }
  }

  const nombre = usuario?.nombre?.split(' ')[0] || ''

  const stats = [
    { label: 'Actividades', value: totalActs,                         icon: '📝', color: '#A78BFA', bg: 'rgba(124,58,237,0.2)' },
    { label: 'Entregadas',  value: entregadas,                        icon: '✅', color: '#34D399', bg: 'rgba(16,185,129,0.2)' },
    { label: 'Pendientes',  value: pendientes,                        icon: '⏳', color: '#FBBF24', bg: 'rgba(245,158,11,0.2)' },
    { label: 'Promedio',    value: promedio ? (promedio + '/10') : 'S/N', icon: '⭐', color: '#60A5FA', bg: 'rgba(59,130,246,0.2)' },
  ]

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero */}
        <Card style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #2d1065 40%, #3b0f8c 70%, #1e0a4a 100%)',
          border: '1px solid rgba(124,58,237,0.3)', overflow: 'hidden', position: 'relative', minHeight: 150
        }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)' }} />
          {['8%','22%','48%','70%','88%'].map((l, i) => (
            <div key={i} style={{ position: 'absolute', left: l, top: i % 2 === 0 ? '15%' : '70%', color: 'rgba(167,139,250,0.45)', fontSize: 12 }}>✦</div>
          ))}
          <div style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                {'Hola, ' + nombre + '!'}
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(196,181,253,0.8)', margin: '0 0 16px' }}>
                {inscripciones.length > 0
                  ? inscripciones.length + ' materia' + (inscripciones.length !== 1 ? 's' : '') + ' inscrita' + (inscripciones.length !== 1 ? 's' : '')
                  : 'Ingresa tu codigo de matricula para empezar'}
              </p>
              {/* XP bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Nivel {inscripciones.length + 1}</span>
                    <span style={{ fontSize: 12, color: 'rgba(196,181,253,0.7)' }}>{entregadas * 50} / 600 XP</span>
                  </div>
                  <div style={{ width: 160, height: 7, background: 'rgba(255,255,255,0.15)', borderRadius: 999 }}>
                    <div style={{ width: Math.min((entregadas * 50 / 600) * 100, 100) + '%', height: '100%', background: '#FBBF24', borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 64, filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.6))', flexShrink: 0 }}>🌟</div>
          </div>
        </Card>

        {/* Matricula */}
        <Card style={{ padding: 20, borderLeft: '3px solid #7C3AED' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔑</div>
            <div>
              <p style={{ fontWeight: 700, color: '#E5E7EB', margin: 0, fontSize: 14 }}>Matricula con codigo</p>
              <p style={{ fontSize: 12, color: 'rgba(156,163,175,0.7)', margin: 0 }}>Ingresa el codigo que te dio tu profesor</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, maxWidth: 420 }}>
            <input
              value={clave}
              onChange={e => { setClave(e.target.value.toUpperCase()); setResultado(null) }}
              onKeyDown={e => { if (e.key === 'Enter') handleMatricular() }}
              placeholder="Ej: MAT6A" maxLength={12}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '10px 14px', fontFamily: 'Poppins,sans-serif', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center', color: '#E5E7EB', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.3)'; e.target.style.boxShadow = 'none' }}
            />
            <button onClick={handleMatricular} disabled={loading || !clave.trim()}
              style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (!clave.trim() || loading) ? 0.5 : 1, boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}>
              {loading ? '...' : 'Matricularme'}
            </button>
          </div>
          {resultado && (
            <p style={{ fontSize: 12, marginTop: 8, fontWeight: 600, color: resultado.ok ? '#34D399' : '#F87171' }}>
              {resultado.ok ? '✅ ' : '❌ '}{resultado.msg}
            </p>
          )}
        </Card>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {stats.map((s, i) => (
            <Card key={i} style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 11.5, color: 'rgba(156,163,175,0.7)', margin: '4px 0 0' }}>{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Accesos rapidos */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', margin: '0 0 12px' }}>Accesos rapidos</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {[
              { icon: '📚', label: 'Mis Cursos',  sub: 'Ver materias',      ruta: '/estudiante/cursos',   color: '#A78BFA', bg: 'rgba(124,58,237,0.2)' },
              { icon: '📝', label: 'Tareas',       sub: 'Pendientes',         ruta: '/estudiante/tareas',   color: '#60A5FA', bg: 'rgba(59,130,246,0.2)'  },
              { icon: '📈', label: 'Progreso',     sub: 'Calificaciones',     ruta: '/estudiante/progreso', color: '#34D399', bg: 'rgba(16,185,129,0.2)'  },
              { icon: '🎮', label: 'Juegos',       sub: 'Aprende jugando',    ruta: '/estudiante/juegos',   color: '#FBBF24', bg: 'rgba(245,158,11,0.2)'  },
            ].map((item, i) => (
              <Card key={i} onClick={() => navigate(item.ruta)}
                style={{ padding: '18px', textAlign: 'center', transition: 'transform .15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 10px' }}>{item.icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color: item.color, margin: '0 0 3px' }}>{item.label}</p>
                <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.6)', margin: 0 }}>{item.sub}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Proximas actividades */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', margin: 0 }}>Proximas actividades</p>
            <button onClick={() => navigate('/estudiante/tareas')}
              style={{ fontSize: 12, color: '#7C3AED', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
              Ver todas
            </button>
          </div>
          {proximas.length === 0 ? (
            <Card style={{ padding: '40px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: 40 }}>{inscripciones.length > 0 ? '🎉' : '📭'}</span>
              <p style={{ color: 'rgba(209,213,219,0.6)', fontSize: 14, marginTop: 10, fontWeight: 600 }}>
                {inscripciones.length > 0 ? 'Todo al dia!' : 'Sin actividades aun'}
              </p>
              <p style={{ color: 'rgba(156,163,175,0.5)', fontSize: 12, marginTop: 4 }}>
                {inscripciones.length > 0 ? 'No tienes pendientes' : 'Ingresa tu codigo arriba para matricularte'}
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {proximas.map(act => {
                const dias = Math.ceil((new Date(act.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
                const urgente = dias <= 2
                const diasTxt = dias <= 0 ? 'Hoy!' : dias === 1 ? 'Manana' : (dias + ' dias')
                return (
                  <button key={act.id} onClick={() => navigate('/estudiante/cursos')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 18px', borderRadius: 14, border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: urgente ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
                      borderLeft: urgente ? '3px solid #FBBF24' : '3px solid rgba(124,58,237,0.3)',
                      transition: 'all .15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = urgente ? 'rgba(245,158,11,0.14)' : 'rgba(124,58,237,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = urgente ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)'}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: urgente ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {urgente ? '⚠️' : '📝'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13.5, color: '#F3F4F6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.titulo}</p>
                      <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.6)', margin: '3px 0 0' }}>{(act.materiaNombre || '') + ' · ' + (act.periodoNombre || '')}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: urgente ? '#FBBF24' : 'rgba(156,163,175,0.7)', margin: 0 }}>{diasTxt}</p>
                      <p style={{ fontSize: 10, color: 'rgba(156,163,175,0.4)', margin: '2px 0 0' }}>{act.fechaLimite}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}
