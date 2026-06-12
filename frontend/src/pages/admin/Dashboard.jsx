import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAdmin } from '../../context/AdminContext'

const fmt = (n) => '$' + (n || 0).toLocaleString('es-CO')
const fmtFecha = (iso) => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
const diasVence = (iso) => {
  if (!iso) return null
  return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24))
}

// ── Tokens de diseño oscuro ───────────────────────────────────────────────────
const BG       = '#0F0A1E'        // fondo general
const CARD     = '#1C1535'        // fondo de cards
const BORDER   = 'rgba(124,58,237,0.2)'
const BORDER_S = 'rgba(124,58,237,0.12)'
const TH_COL   = 'rgba(167,139,250,0.7)'
const TEXT     = '#E5E7EB'
const TEXT_SUB = 'rgba(156,163,175,0.7)'

const card  = { background: CARD,  borderRadius: 16, border: `1px solid ${BORDER}` }
const thead = { background: 'rgba(124,58,237,0.1)', borderBottom: `1px solid ${BORDER_S}` }
const thL   = { textAlign: 'left',   padding: '12px 20px', fontSize: 11, fontWeight: 700, color: TH_COL, textTransform: 'uppercase', letterSpacing: 1 }
const thC   = { textAlign: 'center', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: TH_COL, textTransform: 'uppercase', letterSpacing: 1 }
const trS   = { borderBottom: `1px solid ${BORDER_S}` }

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const {
    pagos, profesores, estudiantesLista,
    ingresoTotal, profesoresActivos, loading,
    toggleUsuario, eliminarUsuario, renovarMembresia,
  } = useAdmin()

  const [tab, setTab] = useState('resumen')
  const [busqueda, setBusqueda] = useState('')
  const [confirmarDel, setConfDel] = useState(null)
  const [confirmarRenovar, setConfRenovar] = useState(null)
  const [msg, setMsg] = useState(null)

  const showMsg = (texto, ok = true) => {
    setMsg({ texto, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  const pagosMes = pagos.filter(p => {
    const d = new Date(p.createdAt), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((a, p) => a + (p.monto || 0), 0)

  const porVencer = profesores.filter(p => {
    if (!p.membresiaVence) return false
    const dv = diasVence(p.membresiaVence)
    return dv !== null && dv >= 0 && dv <= 7
  })

  const profFiltrados = profesores.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email?.toLowerCase().includes(busqueda.toLowerCase())
  )
  const estFiltrados = estudiantesLista.filter(e =>
    e.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const handleToggle   = async (id) => { await toggleUsuario(id); showMsg('Estado actualizado') }
  const handleEliminar = async (u)  => { await eliminarUsuario(u.id); setConfDel(null); showMsg('Usuario eliminado') }
  const handleRenovar  = async (u, tipo) => { await renovarMembresia(u.id, tipo); setConfRenovar(null); showMsg('Membresía renovada') }

  const TABS = [
    { id: 'resumen',     icon: '📊', label: 'Resumen'     },
    { id: 'profesores',  icon: '👨‍🏫', label: 'Profesores'  },
    { id: 'estudiantes', icon: '👨‍🎓', label: 'Estudiantes' },
    { id: 'pagos',       icon: '💳', label: 'Pagos'       },
  ]

  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: 'Poppins,sans-serif' }}>

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 h-16"
        style={{ background: CARD, borderBottom: `1px solid ${BORDER}`, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-lg"
            style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>⚙️</div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-white text-xl leading-none">EduSmart</span>
              <span className="font-black text-yellow-400 text-xl leading-none">AI+</span>
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: TH_COL }}>Panel Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <div className={'px-4 py-2 rounded-xl text-sm font-semibold ' + (msg.ok ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400')}>
              {msg.texto}
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all text-red-400 hover:bg-red-900/30">
            🚪 Cerrar sesión
          </button>
        </div>
      </header>

      <div className="pt-16 flex">

        {/* ── SIDEBAR ── */}
        <aside className="fixed left-0 top-16 bottom-0 w-56 p-4 space-y-1 z-30"
          style={{ background: CARD, borderRight: `1px solid ${BORDER}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setBusqueda('') }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.id
                ? { background: 'rgba(124,58,237,0.25)', color: '#C4B5FD', border: '1.5px solid rgba(124,58,237,0.4)' }
                : { color: TEXT_SUB, border: '1.5px solid transparent' }}>
              <span className="text-base">{t.icon}</span>{t.label}
            </button>
          ))}
          {porVencer.length > 0 && (
            <div className="mt-4 rounded-xl p-3" style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.3)' }}>
              <p className="text-xs font-bold text-orange-400">
                {'⚠️ ' + porVencer.length + ' membresía' + (porVencer.length > 1 ? 's' : '') + ' por vencer'}
              </p>
            </div>
          )}
        </aside>

        <main className="ml-56 flex-1 p-6 space-y-6">

          {/* ── RESUMEN ── */}
          {tab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black" style={{ color: TEXT }}>Panel de Administración</h2>
                <p className="text-sm mt-0.5" style={{ color: TEXT_SUB }}>Resumen general de la plataforma</p>
              </div>

              {/* KPIs */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[1,2,3,4].map(i => (
                    <div key={i} style={card} className="p-5 animate-pulse">
                      <div className="w-11 h-11 rounded-xl mb-3" style={{ background: 'rgba(124,58,237,0.2)' }} />
                      <div className="h-7 rounded mb-2 w-20" style={{ background: 'rgba(124,58,237,0.15)' }} />
                      <div className="h-4 rounded w-28"        style={{ background: 'rgba(124,58,237,0.1)' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Profesores activos', value: profesoresActivos + '/' + profesores.length, icon: '👨‍🏫', bg: 'rgba(124,58,237,0.2)',  txt: '#C4B5FD' },
                    { label: 'Estudiantes',         value: estudiantesLista.length,                    icon: '👨‍🎓', bg: 'rgba(59,130,246,0.2)',  txt: '#93C5FD' },
                    { label: 'Ingresos totales',    value: fmt(ingresoTotal),                          icon: '💰', bg: 'rgba(16,185,129,0.2)',  txt: '#6EE7B7' },
                    { label: 'Ingresos este mes',   value: fmt(pagosMes),                              icon: '📅', bg: 'rgba(245,158,11,0.2)',  txt: '#FCD34D' },
                  ].map(s => (
                    <div key={s.label} style={card} className="p-5 hover:scale-[1.02] transition-transform cursor-default">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
                      <div className="text-2xl font-black mb-0.5" style={{ color: s.txt }}>{s.value}</div>
                      <div className="text-sm font-medium" style={{ color: TEXT_SUB }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Membresías por vencer */}
              {porVencer.length > 0 && (
                <div style={card}>
                  <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${BORDER_S}` }}>
                    <span className="text-orange-400 text-lg">⚠️</span>
                    <h3 className="font-bold" style={{ color: TEXT }}>Membresías próximas a vencer</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {porVencer.map(p => {
                      const dv = diasVence(p.membresiaVence)
                      return (
                        <div key={p.id} className="flex items-center justify-between p-4 rounded-xl"
                          style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.25)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                              style={{ background: 'rgba(234,88,12,0.2)', color: '#FB923C' }}>
                              {p.nombre?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: TEXT }}>{p.nombre}</p>
                              <p className="text-xs" style={{ color: TEXT_SUB }}>{p.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-bold text-orange-400">{'Vence en ' + dv + ' días'}</p>
                              <p className="text-xs" style={{ color: TEXT_SUB }}>{fmtFecha(p.membresiaVence)}</p>
                            </div>
                            <button onClick={() => setConfRenovar(p)}
                              className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-700 transition-all">
                              Renovar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Últimos pagos */}
              <div style={card}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER_S}` }}>
                  <h3 className="font-bold" style={{ color: TEXT }}>Últimos pagos</h3>
                  <button onClick={() => setTab('pagos')} className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-all">Ver todos</button>
                </div>
                {pagos.length === 0 ? (
                  <div className="p-10 text-center">
                    <span className="text-4xl">💳</span>
                    <p className="mt-3 font-semibold" style={{ color: TEXT_SUB }}>Sin pagos aún</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead><tr style={thead}>
                      <th style={thL}>Profesor</th>
                      <th style={thC}>Plan</th>
                      <th style={thC}>Monto</th>
                      <th style={thC}>Fecha</th>
                    </tr></thead>
                    <tbody>
                      {[...pagos].slice(0, 5).map(p => (
                        <tr key={p.id} style={trS} className="hover:bg-purple-900/10 transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-sm" style={{ color: TEXT }}>{p.user?.nombre || 'N/A'}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                              style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD' }}>{p.tipo}</span>
                          </td>
                          <td className="py-3.5 px-5 text-center font-bold text-green-400 text-sm">{fmt(p.monto)}</td>
                          <td className="py-3.5 px-5 text-center text-xs" style={{ color: TEXT_SUB }}>{fmtFecha(p.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Accesos rápidos */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { tab: 'profesores', icon: '👨‍🏫', title: 'Gestionar Profesores', desc: 'Ver, activar o desactivar cuentas', color: '#C4B5FD' },
                  { tab: 'estudiantes', icon: '👨‍🎓', title: 'Gestionar Estudiantes', desc: 'Ver todos los estudiantes registrados', color: '#93C5FD' },
                ].map(b => (
                  <button key={b.tab} onClick={() => setTab(b.tab)}
                    className="text-left p-6 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{ ...card, border: `1px solid ${BORDER}` }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                      style={{ background: 'rgba(124,58,237,0.2)' }}>{b.icon}</div>
                    <h3 className="font-bold" style={{ color: b.color }}>{b.title}</h3>
                    <p className="text-sm mt-0.5" style={{ color: TEXT_SUB }}>{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── PROFESORES ── */}
          {tab === 'profesores' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black" style={{ color: TEXT }}>Profesores</h2>
                  <p className="text-sm" style={{ color: TEXT_SUB }}>{profesores.length + ' registrados · ' + profesoresActivos + ' activos'}</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_SUB }}>🔍</span>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar profesor..."
                    className="pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    style={{ background: 'rgba(124,58,237,0.1)', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
              </div>

              {profFiltrados.length === 0 ? (
                <div style={card} className="p-14 text-center">
                  <span className="text-5xl">👨‍🏫</span>
                  <p className="mt-3 font-semibold" style={{ color: TEXT_SUB }}>{busqueda ? 'Sin resultados' : 'Sin profesores registrados'}</p>
                </div>
              ) : (
                <div style={{ ...card, overflow: 'hidden' }}>
                  <table className="w-full">
                    <thead><tr style={thead}>
                      {['Profesor','Registro','Plan','Vence','Estado','Acciones'].map(h => (
                        <th key={h} style={h === 'Profesor' ? thL : thC}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {profFiltrados.map(p => {
                        const dv = diasVence(p.membresiaVence)
                        return (
                          <tr key={p.id} style={trS} className="hover:bg-purple-900/10 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                  style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD' }}>
                                  {p.nombre?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: TEXT }}>{p.nombre}</p>
                                  <p className="text-xs" style={{ color: TEXT_SUB }}>{p.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-center text-xs" style={{ color: TEXT_SUB }}>{fmtFecha(p.createdAt)}</td>
                            <td className="py-3.5 px-5 text-center">
                              <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                style={p.membresiaActiva
                                  ? { background: 'rgba(124,58,237,0.2)', color: '#C4B5FD' }
                                  : { background: 'rgba(156,163,175,0.15)', color: TEXT_SUB }}>
                                {p.membresiaTipo ? p.membresiaTipo.charAt(0).toUpperCase() + p.membresiaTipo.slice(1) : 'Sin plan'}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              {dv !== null ? (
                                <span className={'text-xs font-semibold ' + (dv < 0 ? 'text-red-400' : dv <= 7 ? 'text-orange-400' : 'text-gray-400')}>
                                  {dv < 0 ? 'Vencida' : dv === 0 ? 'Hoy' : 'En ' + dv + ' días'}
                                </span>
                              ) : <span className="text-xs" style={{ color: TEXT_SUB }}>—</span>}
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              <button onClick={() => handleToggle(p.id)}
                                className="text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-all"
                                style={p.activo
                                  ? { background: 'rgba(16,185,129,0.2)', color: '#6EE7B7' }
                                  : { background: 'rgba(239,68,68,0.2)',  color: '#FCA5A5' }}>
                                {p.activo ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setConfRenovar(p)}
                                  className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all text-purple-400 hover:bg-purple-900/30">
                                  Renovar
                                </button>
                                <button onClick={() => setConfDel(p)}
                                  className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all text-red-400 hover:bg-red-900/30">
                                  Eliminar
                                </button>
                              </div>
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

          {/* ── ESTUDIANTES ── */}
          {tab === 'estudiantes' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black" style={{ color: TEXT }}>Estudiantes</h2>
                  <p className="text-sm" style={{ color: TEXT_SUB }}>{estudiantesLista.length + ' registrados'}</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_SUB }}>🔍</span>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar estudiante..."
                    className="pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    style={{ background: 'rgba(124,58,237,0.1)', border: `1px solid ${BORDER}`, color: TEXT }} />
                </div>
              </div>

              {estFiltrados.length === 0 ? (
                <div style={card} className="p-14 text-center">
                  <span className="text-5xl">👨‍🎓</span>
                  <p className="mt-3 font-semibold" style={{ color: TEXT_SUB }}>{busqueda ? 'Sin resultados' : 'Sin estudiantes registrados'}</p>
                </div>
              ) : (
                <div style={{ ...card, overflow: 'hidden' }}>
                  <table className="w-full">
                    <thead><tr style={thead}>
                      {['Estudiante','Registro','Materias','Estado','Acciones'].map(h => (
                        <th key={h} style={h === 'Estudiante' ? thL : thC}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {estFiltrados.map(e => (
                        <tr key={e.id} style={trS} className="hover:bg-purple-900/10 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                                style={{ background: 'rgba(59,130,246,0.2)', color: '#93C5FD' }}>
                                {e.nombre?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: TEXT }}>{e.nombre}</p>
                                <p className="text-xs" style={{ color: TEXT_SUB }}>{e.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center text-xs" style={{ color: TEXT_SUB }}>{fmtFecha(e.createdAt)}</td>
                          <td className="py-3.5 px-5 text-center font-bold text-purple-400 text-sm">{e._count?.inscripciones || 0}</td>
                          <td className="py-3.5 px-5 text-center">
                            <button onClick={() => handleToggle(e.id)}
                              className="text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-all"
                              style={e.activo
                                ? { background: 'rgba(16,185,129,0.2)', color: '#6EE7B7' }
                                : { background: 'rgba(239,68,68,0.2)',  color: '#FCA5A5' }}>
                              {e.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button onClick={() => setConfDel(e)}
                              className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all text-red-400 hover:bg-red-900/30">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PAGOS ── */}
          {tab === 'pagos' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black" style={{ color: TEXT }}>Historial de pagos</h2>
                <p className="text-sm" style={{ color: TEXT_SUB }}>{pagos.length + ' transacciones'}</p>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {[
                  { label: 'Total acumulado', value: fmt(ingresoTotal), icon: '💰', bg: 'rgba(16,185,129,0.2)',  txt: '#6EE7B7' },
                  { label: 'Este mes',         value: fmt(pagosMes),    icon: '📅', bg: 'rgba(59,130,246,0.2)',  txt: '#93C5FD' },
                  { label: 'Transacciones',    value: pagos.length,     icon: '📋', bg: 'rgba(124,58,237,0.2)', txt: '#C4B5FD' },
                ].map(s => (
                  <div key={s.label} style={card} className="p-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
                    <div className="text-2xl font-black mb-0.5" style={{ color: s.txt }}>{s.value}</div>
                    <div className="text-sm font-medium" style={{ color: TEXT_SUB }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {pagos.length === 0 ? (
                <div style={card} className="p-14 text-center">
                  <span className="text-5xl">💳</span>
                  <p className="mt-3 font-semibold" style={{ color: TEXT_SUB }}>Sin pagos registrados</p>
                </div>
              ) : (
                <div style={{ ...card, overflow: 'hidden' }}>
                  <table className="w-full">
                    <thead><tr style={thead}>
                      {['Profesor','Plan','Monto','Fecha','Estado'].map(h => (
                        <th key={h} style={h === 'Profesor' ? thL : thC}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {pagos.map(p => (
                        <tr key={p.id} style={trS} className="hover:bg-purple-900/10 transition-colors">
                          <td className="py-3.5 px-5">
                            <p className="font-semibold text-sm" style={{ color: TEXT }}>{p.user?.nombre || 'N/A'}</p>
                            <p className="text-xs" style={{ color: TEXT_SUB }}>{p.user?.email || ''}</p>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                              style={{ background: 'rgba(124,58,237,0.2)', color: '#C4B5FD' }}>{p.tipo}</span>
                          </td>
                          <td className="py-3.5 px-5 text-center font-bold text-green-400 text-sm">{fmt(p.monto)}</td>
                          <td className="py-3.5 px-5 text-center text-xs" style={{ color: TEXT_SUB }}>{fmtFecha(p.createdAt)}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                              style={{ background: 'rgba(16,185,129,0.2)', color: '#6EE7B7' }}>
                              {p.estado || 'aprobado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── MODAL RENOVAR ── */}
      {confirmarRenovar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="p-8 max-w-sm w-full" style={{ ...card, borderRadius: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <div className="text-center mb-5">
              <span className="text-5xl">🔑</span>
              <h3 className="font-black text-lg mt-3" style={{ color: TEXT }}>Renovar membresía</h3>
              <p className="text-sm mt-1" style={{ color: TEXT_SUB }}>{confirmarRenovar.nombre}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { tipo: 'mensual', precio: '$70.000', label: 'Mensual', extra: null },
                { tipo: 'anual',   precio: '$700.000', label: 'Anual',   extra: 'Ahorra $140.000' },
              ].map(m => (
                <button key={m.tipo} onClick={() => handleRenovar(confirmarRenovar, m.tipo)}
                  className="p-4 rounded-2xl text-center transition-all hover:scale-105"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.3)' }}>
                  <p className="font-black text-lg text-purple-400">{m.precio}</p>
                  <p className="text-xs" style={{ color: TEXT_SUB }}>{m.label}</p>
                  {m.extra && <p className="text-xs text-green-400 font-semibold">{m.extra}</p>}
                </button>
              ))}
            </div>
            <button onClick={() => setConfRenovar(null)}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ border: `1px solid ${BORDER}`, color: TEXT_SUB }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {confirmarDel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="p-8 max-w-sm w-full" style={{ ...card, borderRadius: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
            <div className="text-center mb-5">
              <span className="text-5xl">⚠️</span>
              <h3 className="font-black text-lg mt-3" style={{ color: TEXT }}>Eliminar usuario</h3>
              <p className="text-sm mt-2" style={{ color: TEXT_SUB }}>
                Vas a eliminar a <span className="font-bold" style={{ color: TEXT }}>{confirmarDel.nombre}</span>. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfDel(null)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_SUB }}>
                Cancelar
              </button>
              <button onClick={() => handleEliminar(confirmarDel)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 shadow-lg text-sm transition-all">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
