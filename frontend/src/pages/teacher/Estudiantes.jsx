import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { academicService } from '../../services/api'
import Layout from '../../components/Layout'

export default function Estudiantes() {
  const navigate = useNavigate()
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [vista, setVista] = useState('periodos')
  const [periodoSel, setPeriodoSel] = useState(null)
  const [gradoSel, setGradoSel] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [tab, setTab] = useState('lista') // 'lista' | 'notas'
  const [estSel, setEstSel] = useState(null) // estudiante seleccionado para ver perfil

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await academicService.getEstadisticas()
        setPeriodos(res.data || [])
      } catch (err) { console.error('Error cargando estudiantes:', err) }
      finally { setLoading(false) }
    }
    cargar()
  }, [])

  const gradosDelPeriodo = periodoSel ? (periodos.find(p => p.id === periodoSel.id)?.grados || []) : []
  const gradoActual = gradoSel ? (gradosDelPeriodo.find(g => g.id === gradoSel.id) || gradoSel) : null

  const estudiantesGrado = []
  if (gradoActual) {
    const mapa = {}
    ;(gradoActual.materias || []).forEach(m => {
      ;(m.inscripciones || []).forEach(insc => {
        const est = insc.estudiante
        if (!est) return
        if (!mapa[est.id]) mapa[est.id] = { ...est, materias: [], entregas: [], califs: [] }
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

  const todasActividades = gradoActual
    ? (gradoActual.materias || []).flatMap(m =>
        (m.actividades || []).map(a => ({
          ...a, materiaNombre: m.nombre,
          tipo: a.soloForo ? 'foro' : (a.quiz ? 'quiz' : 'actividad')
        }))
      )
    : []

  const estudiantesFiltrados = estudiantesGrado.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleVolver = () => {
    if (estSel) { setEstSel(null); return }
    if (vista === 'lista') { setGradoSel(null); setBusqueda(''); setVista('grados'); setTab('lista') }
    else if (vista === 'grados') { setPeriodoSel(null); setVista('periodos') }
  }

  const AVATARES = ['#7C3AED','#059669','#DC2626','#2563EB','#D97706','#DB2777']

  const Card = ({ children, style = {} }) => (
    <div style={{ background: '#1C1535', borderRadius: 16, border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', ...style }}>
      {children}
    </div>
  )

  if (loading) return (
    <Layout rol="PROFESOR">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
        <div style={{ width: 40, height: 40, border: '4px solid rgba(124,58,237,0.2)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    </Layout>
  )

  return (
    <Layout rol="PROFESOR">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 4px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {vista !== 'periodos' && !estSel && (
              <button onClick={handleVolver} style={{ width: 38, height: 38, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: 18, cursor: 'pointer' }}>←</button>
            )}
            {estSel && (
              <button onClick={() => setEstSel(null)} style={{ width: 38, height: 38, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A78BFA', fontSize: 18, cursor: 'pointer' }}>←</button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}>
                {estSel ? '👤' : vista === 'periodos' ? '📅' : vista === 'grados' ? '🎒' : '🎓'}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#E5E7EB', margin: 0 }}>
                  {estSel ? estSel.nombre
                    : vista === 'periodos' ? 'Estudiantes'
                    : vista === 'grados' ? (periodoSel?.nombre + ' — Grados')
                    : (gradoSel?.nombre + ' — Estudiantes')}
                </h2>
                <p style={{ fontSize: 12, color: 'rgba(167,139,250,0.7)', margin: 0 }}>
                  {estSel ? 'Perfil del estudiante'
                    : vista === 'periodos' ? 'Selecciona un periodo'
                    : vista === 'grados' ? 'Selecciona un grado'
                    : estudiantesGrado.length + ' estudiantes inscritos'}
                </p>
              </div>
            </div>
          </div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {periodoSel && <span style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: '1px solid rgba(124,58,237,0.3)' }}>{periodoSel.nombre}</span>}
            {gradoSel && <><span style={{ color: 'rgba(167,139,250,0.4)' }}>›</span><span style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: '1px solid rgba(59,130,246,0.3)' }}>{gradoSel.nombre}</span></>}
          </div>
        </div>

        {/* PERIODOS */}
        {vista === 'periodos' && (
          periodos.length === 0 ? (
            <Card style={{ padding: '56px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: 48 }}>📭</span>
              <p style={{ color: 'rgba(156,163,175,0.7)', marginTop: 12, fontWeight: 600 }}>Sin periodos aun</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {periodos.map((p, i) => {
                const numEst = new Set((p.grados || []).flatMap(g => (g.materias || []).flatMap(m => (m.inscripciones || []).map(ins => ins.estudianteId)))).size
                const IMGS = [
                  { bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', emoji: '🗓️' },
                  { bg: 'linear-gradient(135deg,#1E40AF,#3B82F6)', emoji: '📆' },
                  { bg: 'linear-gradient(135deg,#065F46,#059669)', emoji: '📅' },
                  { bg: 'linear-gradient(135deg,#92400E,#F59E0B)', emoji: '🗒️' },
                ]
                const col = IMGS[i % IMGS.length]
                return (
                  <div key={p.id} style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(124,58,237,0.25)', cursor: 'pointer' }}>
                    <button onClick={() => { setPeriodoSel(p); setVista('grados') }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}>
                      <div style={{ background: col.bg, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: -20, bottom: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: 46, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', position: 'relative', zIndex: 1 }}>{col.emoji}</span>
                      </div>
                      <div style={{ background: '#1C1535', padding: '14px 18px 16px' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</h3>
                        <p style={{ fontSize: 12, color: 'rgba(156,163,175,0.65)', margin: '0 0 10px', fontWeight: 500 }}>{numEst} estudiante{numEst !== 1 ? 's' : ''}</p>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>Ver grados →</span>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* GRADOS */}
        {vista === 'grados' && (
          gradosDelPeriodo.length === 0 ? (
            <Card style={{ padding: '56px 24px', textAlign: 'center' }}>
              <span style={{ fontSize: 48 }}>🎒</span>
              <p style={{ color: 'rgba(156,163,175,0.7)', marginTop: 12, fontWeight: 600 }}>Sin grados en este periodo</p>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {gradosDelPeriodo.map((g, i) => {
                const numEst = new Set((g.materias || []).flatMap(m => (m.inscripciones || []).map(ins => ins.estudianteId))).size
                const IMGS = [
                  { bg: 'linear-gradient(135deg,#7C3AED,#A855F7)', emoji: '🎒' },
                  { bg: 'linear-gradient(135deg,#0369A1,#38BDF8)', emoji: '🏫' },
                  { bg: 'linear-gradient(135deg,#B45309,#F59E0B)', emoji: '🎓' },
                  { bg: 'linear-gradient(135deg,#065F46,#34D399)', emoji: '📚' },
                ]
                const col = IMGS[i % IMGS.length]
                return (
                  <div key={g.id} style={{ borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: '1px solid rgba(124,58,237,0.25)', cursor: 'pointer' }}>
                    <button onClick={() => { setGradoSel(g); setVista('lista') }} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}>
                      <div style={{ background: col.bg, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: -15, bottom: -15, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: 46, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))', position: 'relative', zIndex: 1 }}>{col.emoji}</span>
                      </div>
                      <div style={{ background: '#1C1535', padding: '14px 18px 16px' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#E5E7EB', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.nombre}</h3>
                        <p style={{ fontSize: 12, color: 'rgba(156,163,175,0.65)', margin: '0 0 10px', fontWeight: 500 }}>{numEst} estudiantes</p>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#A78BFA' }}>Ver lista →</span>
                      </div>
                    </button>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* LISTA con dos pestañas */}
        {vista === 'lista' && !estSel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'lista', label: 'Lista de estudiantes', icon: '🎓' },
                { id: 'notas', label: 'Planilla de notas',    icon: '📋' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 700, transition: 'all .15s',
                    background: tab === t.id ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : 'rgba(124,58,237,0.08)',
                    color: tab === t.id ? '#fff' : 'rgba(167,139,250,0.7)',
                    boxShadow: tab === t.id ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                    border: tab === t.id ? 'none' : '1px solid rgba(124,58,237,0.2)'
                  }}>
                  <span>{t.icon}</span><span>{t.label}</span>
                  {t.id === 'lista' && <span style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 8px', borderRadius: 999, fontSize: 11 }}>{estudiantesGrado.length}</span>}
                </button>
              ))}
            </div>

            {/* TAB: Lista */}
            {tab === 'lista' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Buscador */}
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#A78BFA', fontSize: 14 }}>🔍</span>
                  <input type="text" placeholder="Buscar por nombre o email..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    style={{ width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: 12, fontFamily: 'Poppins,sans-serif', fontSize: 13.5, color: '#E5E7EB', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.25)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>

                {estudiantesFiltrados.length === 0 ? (
                  <Card style={{ padding: '56px 24px', textAlign: 'center' }}>
                    <span style={{ fontSize: 48 }}>{busqueda ? '🔍' : '🎓'}</span>
                    <p style={{ color: 'rgba(156,163,175,0.7)', marginTop: 12, fontWeight: 600 }}>{busqueda ? 'Sin resultados' : 'Sin estudiantes inscritos'}</p>
                    <p style={{ color: 'rgba(156,163,175,0.5)', fontSize: 13, marginTop: 4 }}>{busqueda ? 'Intenta con otro nombre' : 'Los estudiantes se inscriben con la clave de matricula'}</p>
                  </Card>
                ) : (
                  estudiantesFiltrados.map((est, idx) => {
                    const color = AVATARES[idx % AVATARES.length]
                    const prom = est.califs.length > 0 ? (est.califs.reduce((a, b) => a + b, 0) / est.califs.length).toFixed(1) : null
                    const entregadas = est.entregas.filter(e => e.entregado).length
                    return (
                      <button key={est.id} onClick={() => setEstSel(est)}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#1C1535', borderRadius: 16, border: '1px solid rgba(124,58,237,0.18)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', width: '100%' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.45)'; e.currentTarget.style.background = 'rgba(124,58,237,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)'; e.currentTarget.style.background = '#1C1535' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px ' + color + '55' }}>
                          {est.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: 15, color: '#E5E7EB', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{est.nombre}</p>
                          <p style={{ fontSize: 12, color: 'rgba(156,163,175,0.6)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{est.email}</p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {est.materias.map((m, i) => (
                              <span key={i} style={{ fontSize: 11, background: 'rgba(124,58,237,0.15)', color: '#A78BFA', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>{m}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 20, flexShrink: 0, textAlign: 'center' }}>
                          <div>
                            <p style={{ fontSize: 18, fontWeight: 900, color: '#A78BFA', margin: 0 }}>{entregadas}<span style={{ fontSize: 11, color: 'rgba(156,163,175,0.5)', fontWeight: 400 }}>/{todasActividades.length}</span></p>
                            <p style={{ fontSize: 10, color: 'rgba(156,163,175,0.5)', margin: '2px 0 0', fontWeight: 600 }}>ENTREGAS</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 18, fontWeight: 900, margin: 0, color: prom >= 7 ? '#34D399' : prom >= 5 ? '#FBBF24' : prom ? '#F87171' : 'rgba(156,163,175,0.4)' }}>{prom || '—'}</p>
                            <p style={{ fontSize: 10, color: 'rgba(156,163,175,0.5)', margin: '2px 0 0', fontWeight: 600 }}>PROMEDIO</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(167,139,250,0.4)', fontSize: 20 }}>›</div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            )}

            {/* TAB: Planilla de notas */}
            {tab === 'notas' && (
              <div>
                {todasActividades.length === 0 || estudiantesGrado.length === 0 ? (
                  <Card style={{ padding: '56px 24px', textAlign: 'center' }}>
                    <span style={{ fontSize: 48 }}>📋</span>
                    <p style={{ color: 'rgba(156,163,175,0.7)', marginTop: 12, fontWeight: 600 }}>Sin datos para mostrar</p>
                  </Card>
                ) : (
                  <div style={{ background: '#1C1535', borderRadius: 16, border: '1px solid rgba(124,58,237,0.2)', overflow: 'auto', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', minWidth: 700 }}>
                      <thead>
                        <tr style={{ background: 'rgba(124,58,237,0.18)', borderBottom: '2px solid rgba(124,58,237,0.3)' }}>
                          <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: '#A78BFA', position: 'sticky', left: 0, background: 'rgba(28,14,60,0.98)', minWidth: 36, borderRight: '1px solid rgba(124,58,237,0.15)' }}>Id</th>
                          <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#A78BFA', minWidth: 160, borderRight: '1px solid rgba(124,58,237,0.15)' }}>Apellidos</th>
                          <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 700, color: '#A78BFA', minWidth: 130, borderRight: '1px solid rgba(124,58,237,0.15)' }}>Nombres</th>
                          {todasActividades.slice(0, 10).map((act, i) => (
                            <th key={act.id || i} style={{ textAlign: 'center', padding: '8px 6px', fontWeight: 700, color: act.tipo === 'quiz' ? '#FBBF24' : act.tipo === 'foro' ? '#60A5FA' : '#A78BFA', minWidth: 56, borderRight: '1px solid rgba(124,58,237,0.1)' }}>
                              <div style={{ fontSize: 11, fontWeight: 800 }}>{act.tipo === 'quiz' ? '❓' : act.tipo === 'foro' ? '💬' : '📝'} A{i+1}</div>
                              <div style={{ fontSize: 9, color: 'rgba(167,139,250,0.5)', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 52 }}>{act.titulo}</div>
                            </th>
                          ))}
                          <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: '#FBBF24', minWidth: 50, borderLeft: '2px solid rgba(124,58,237,0.3)', borderRight: '1px solid rgba(124,58,237,0.1)' }}>20%</th>
                          <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: '#60A5FA', minWidth: 50, borderRight: '1px solid rgba(124,58,237,0.1)' }}>Cons</th>
                          <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 700, color: '#34D399', minWidth: 50, borderRight: '1px solid rgba(124,58,237,0.1)' }}>Full</th>
                          <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: 800, color: '#fff', minWidth: 54, background: 'rgba(124,58,237,0.25)' }}>DEF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantesGrado.map((est, idx) => {
                          const color = AVATARES[idx % AVATARES.length]
                          const notasData = todasActividades.slice(0, 10).map(act => {
                            const ent = act.entregas?.find(e => e.estudianteId === est.id)
                            return { nota: ent?.calificacion ?? null, actId: act.id }
                          })
                          const notasReales = notasData.filter(n => n.nota != null).map(n => n.nota)
                          const prom = notasReales.length > 0 ? notasReales.reduce((a, b) => a + b, 0) / notasReales.length : null
                          const pct20 = prom ? (prom * 0.2).toFixed(1) : null
                          const def_ = prom ? prom.toFixed(1) : null
                          const defColor = !def_ ? 'rgba(156,163,175,0.4)' : def_ >= 7 ? '#34D399' : def_ >= 5 ? '#FBBF24' : '#F87171'
                          const partes = est.nombre.trim().split(' ')
                          const apellidos = partes.slice(0,2).join(' ').toUpperCase()
                          const nombres = partes.slice(2).join(' ') || partes[0]
                          return (
                            <tr key={est.id}
                              style={{ borderBottom: '1px solid rgba(124,58,237,0.08)', transition: 'background .1s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.07)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ textAlign: 'center', padding: '10px 8px', color: 'rgba(156,163,175,0.5)', fontSize: 11, position: 'sticky', left: 0, background: '#1C1535', borderRight: '1px solid rgba(124,58,237,0.12)' }}>{idx+1}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 700, color: '#E5E7EB', borderRight: '1px solid rgba(124,58,237,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 10, flexShrink: 0 }}>{est.nombre.charAt(0)}</div>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{apellidos}</span>
                                </div>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#D1D5DB', borderRight: '1px solid rgba(124,58,237,0.1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{nombres}</td>
                              {notasData.map((nd, i) => {
                                const { nota, actId } = nd
                                const nc = nota == null ? 'rgba(156,163,175,0.25)' : nota >= 7 ? '#34D399' : nota >= 5 ? '#FBBF24' : '#F87171'
                                const nb = nota == null ? 'transparent' : nota >= 7 ? 'rgba(52,211,153,0.12)' : nota >= 5 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)'
                                return (
                                  <td key={i} style={{ textAlign: 'center', padding: '10px 4px', borderRight: '1px solid rgba(124,58,237,0.08)' }}>
                                    <button onClick={() => navigate('/profesor/cursos')} title={nota != null ? 'Nota: ' + nota : 'Sin entregar'}
                                      style={{ background: nb, border: nota != null ? '1px solid ' + nc + '40' : '1px dashed rgba(124,58,237,0.2)', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', minWidth: 38, display: 'inline-block', transition: 'transform .1s' }}
                                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                      <span style={{ fontWeight: 800, fontSize: 12, color: nc }}>{nota != null ? nota : '—'}</span>
                                    </button>
                                  </td>
                                )
                              })}
                              <td style={{ textAlign: 'center', padding: '10px 6px', borderLeft: '2px solid rgba(124,58,237,0.2)', borderRight: '1px solid rgba(124,58,237,0.08)' }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: pct20 ? '#FBBF24' : 'rgba(156,163,175,0.3)' }}>{pct20 || '—'}</span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 6px', borderRight: '1px solid rgba(124,58,237,0.08)' }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: def_ ? '#60A5FA' : 'rgba(156,163,175,0.3)' }}>{def_ || '—'}</span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 6px', borderRight: '1px solid rgba(124,58,237,0.08)' }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: def_ ? '#34D399' : 'rgba(156,163,175,0.3)' }}>{def_ || '—'}</span>
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 6px', background: def_ ? 'rgba(124,58,237,0.08)' : 'transparent' }}>
                                <span style={{ fontWeight: 900, fontSize: 14, color: defColor }}>{def_ || '—'}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PERFIL ESTUDIANTE */}
        {estSel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
            {/* Card principal */}
            <Card style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: AVATARES[estudiantesGrado.findIndex(e => e.id === estSel.id) % AVATARES.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 28, color: '#fff', flexShrink: 0, boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
                  {estSel.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#E5E7EB', margin: '0 0 4px' }}>{estSel.nombre}</h2>
                  <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.65)', margin: '0 0 8px' }}>{estSel.email}</p>
                  <span style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, border: '1px solid rgba(124,58,237,0.3)' }}>
                    🎓 Estudiante — {gradoSel?.nombre}
                  </span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {[
                  { icon: '📚', label: 'Materias',  val: estSel.materias.length,                                                   color: '#A78BFA', bg: 'rgba(124,58,237,0.12)' },
                  { icon: '📝', label: 'Entregas',  val: estSel.entregas.filter(e => e.entregado).length + '/' + todasActividades.length, color: '#60A5FA', bg: 'rgba(59,130,246,0.12)' },
                  { icon: '⭐', label: 'Promedio',  val: estSel.califs.length > 0 ? (estSel.califs.reduce((a,b)=>a+b,0)/estSel.califs.length).toFixed(1) : '—', color: '#34D399', bg: 'rgba(16,185,129,0.12)' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, borderRadius: 14, padding: '16px 18px', border: '1px solid ' + s.color + '30' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                    <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.val}</p>
                    <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.6)', margin: '4px 0 0', fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Materias inscritas */}
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E5E7EB', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>📚 Materias inscritas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {estSel.materias.map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📖</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB' }}>{m}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notas por actividad */}
            <Card style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E5E7EB', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>📋 Notas por actividad</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todasActividades.map((act, i) => {
                  const ent = act.entregas?.find(e => e.estudianteId === estSel.id)
                  const nota = ent?.calificacion ?? null
                  const entregado = ent?.entregado ?? false
                  const color = nota == null ? 'rgba(156,163,175,0.4)' : nota >= 7 ? '#34D399' : nota >= 5 ? '#FBBF24' : '#F87171'
                  const bg = nota == null ? 'rgba(255,255,255,0.03)' : nota >= 7 ? 'rgba(52,211,153,0.08)' : nota >= 5 ? 'rgba(251,191,36,0.08)' : 'rgba(248,113,113,0.08)'
                  return (
                    <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: bg, borderRadius: 12, border: '1px solid rgba(124,58,237,0.1)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                        {act.tipo === 'quiz' ? '❓' : act.tipo === 'foro' ? '💬' : '📝'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#E5E7EB', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>A{i+1} — {act.titulo}</p>
                        <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.5)', margin: 0 }}>{act.materiaNombre}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{nota != null ? nota : '—'}</p>
                        <p style={{ fontSize: 10, color: entregado ? '#34D399' : 'rgba(156,163,175,0.4)', margin: '2px 0 0', fontWeight: 600 }}>
                          {entregado ? 'Entregado' : 'Pendiente'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

      </div>
    </Layout>
  )
}
