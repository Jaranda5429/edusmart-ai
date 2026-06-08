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

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const {
    pagos, profesores, estudiantesLista,
    ingresoTotal, profesoresActivos, stats, loading,
    toggleUsuario, eliminarUsuario, renovarMembresia
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
    const d = new Date(p.createdAt)
    const now = new Date()
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

  const handleToggle = async (id) => {
    await toggleUsuario(id)
    showMsg('Estado actualizado')
  }

  const handleEliminar = async (u) => {
    await eliminarUsuario(u.id)
    setConfDel(null)
    showMsg('Usuario eliminado')
  }

  const handleRenovar = async (u, tipo) => {
    await renovarMembresia(u.id, tipo)
    setConfRenovar(null)
    showMsg('Membresia renovada')
  }

  const TABS = [
    { id: 'resumen',     icon: '📊', label: 'Resumen'     },
    { id: 'profesores',  icon: '👨‍🏫', label: 'Profesores'  },
    { id: 'estudiantes', icon: '👨‍🎓', label: 'Estudiantes' },
    { id: 'pagos',       icon: '💳', label: 'Pagos'       },
  ]

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Poppins,sans-serif' }}>

      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between"
        style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md"
            style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
            ⚙️
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-gray-900 text-xl leading-none">EduSmart</span>
              <span className="font-black text-yellow-500 text-xl leading-none">AI+</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Panel Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {msg && (
            <div className={'px-4 py-2 rounded-xl text-sm font-semibold ' + (msg.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
              {msg.texto}
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-semibold transition-all">
            🚪 Cerrar sesion
          </button>
        </div>
      </header>

      <div className="pt-16 flex">
        <aside className="fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-gray-100 p-4 space-y-1 z-30"
          style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.03)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setBusqueda('') }}
              className={'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ' +
                (tab === t.id ? 'bg-purple-50 text-purple-700 border-2 border-purple-200' : 'text-gray-600 hover:bg-gray-50')}>
              <span className="text-base">{t.icon}</span>{t.label}
            </button>
          ))}
          {porVencer.length > 0 && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
              <p className="text-xs font-bold text-orange-700">
                {'⚠️ ' + porVencer.length + ' membresia' + (porVencer.length > 1 ? 's' : '') + ' por vencer'}
              </p>
            </div>
          )}
        </aside>

        <main className="ml-56 flex-1 p-6 space-y-6">

          {/* RESUMEN */}
          {tab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Panel de Administracion</h2>
                <p className="text-gray-400 text-sm mt-0.5">Resumen general de la plataforma</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
                      <div className="w-11 h-11 bg-gray-100 rounded-xl mb-3" />
                      <div className="h-7 bg-gray-100 rounded mb-2 w-20" />
                      <div className="h-4 bg-gray-100 rounded w-28" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { label: 'Profesores activos', value: profesoresActivos + '/' + profesores.length, icon: '👨‍🏫', bg: 'bg-purple-50', txt: 'text-purple-700' },
                    { label: 'Estudiantes', value: estudiantesLista.length, icon: '👨‍🎓', bg: 'bg-blue-50', txt: 'text-blue-700' },
                    { label: 'Ingresos totales', value: fmt(ingresoTotal), icon: '💰', bg: 'bg-green-50', txt: 'text-green-700' },
                    { label: 'Ingresos este mes', value: fmt(pagosMes), icon: '📅', bg: 'bg-yellow-50', txt: 'text-yellow-700' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                      <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{s.icon}</div>
                      <div className={'text-2xl font-black ' + s.txt}>{s.value}</div>
                      <div className="text-gray-600 text-sm font-semibold mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {porVencer.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <span className="text-orange-500 text-lg">⚠️</span>
                    <h3 className="font-bold text-gray-800">Membrerias proximas a vencer</h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {porVencer.map(p => {
                      const dv = diasVence(p.membresiaVence)
                      return (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">{p.nombre?.charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">{p.nombre}</p>
                              <p className="text-xs text-gray-400">{p.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs font-bold text-orange-600">{'Vence en ' + dv + ' dias'}</p>
                              <p className="text-xs text-gray-400">{fmtFecha(p.membresiaVence)}</p>
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

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Ultimos pagos</h3>
                  <button onClick={() => setTab('pagos')} className="text-purple-600 text-sm font-semibold hover:underline">Ver todos</button>
                </div>
                {pagos.length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <span className="text-4xl">💳</span>
                    <p className="mt-3 font-semibold">Sin pagos aun</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead><tr className="bg-slate-50 border-b border-gray-100">
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Profesor</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Monto</th>
                      <th className="text-center py-3 px-5 text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                    </tr></thead>
                    <tbody>
                      {[...pagos].slice(0, 5).map(p => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50">
                          <td className="py-3.5 px-5 font-semibold text-sm text-gray-800">{p.user?.nombre || 'N/A'}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold capitalize">{p.tipo}</span>
                          </td>
                          <td className="py-3.5 px-5 text-center font-bold text-green-600 text-sm">{fmt(p.monto)}</td>
                          <td className="py-3.5 px-5 text-center text-xs text-gray-500">{fmtFecha(p.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => setTab('profesores')}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left border-2 border-transparent hover:border-purple-100">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-3">👨‍🏫</div>
                  <h3 className="font-bold text-purple-700">Gestionar Profesores</h3>
                  <p className="text-gray-400 text-sm mt-0.5">Ver, activar o desactivar cuentas</p>
                </button>
                <button onClick={() => setTab('estudiantes')}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left border-2 border-transparent hover:border-blue-100">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-3">👨‍🎓</div>
                  <h3 className="font-bold text-blue-700">Gestionar Estudiantes</h3>
                  <p className="text-gray-400 text-sm mt-0.5">Ver todos los estudiantes registrados</p>
                </button>
              </div>
            </div>
          )}

          {/* PROFESORES */}
          {tab === 'profesores' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Profesores</h2>
                  <p className="text-gray-400 text-sm">{profesores.length + ' registrados · ' + profesoresActivos + ' activos'}</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar profesor..."
                    className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                </div>
              </div>

              {profFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <span className="text-5xl">👨‍🏫</span>
                  <p className="text-gray-500 mt-3 font-semibold">{busqueda ? 'Sin resultados' : 'Sin profesores registrados'}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-slate-50 border-b border-gray-100">
                      {['Profesor', 'Registro', 'Plan', 'Vence', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className={'py-3 px-5 text-xs font-semibold text-gray-500 uppercase ' + (h === 'Profesor' ? 'text-left' : 'text-center')}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {profFiltrados.map(p => {
                        const dv = diasVence(p.membresiaVence)
                        return (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
                                  {p.nombre?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-800">{p.nombre}</p>
                                  <p className="text-xs text-gray-400">{p.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-center text-xs text-gray-500">{fmtFecha(p.createdAt)}</td>
                            <td className="py-3.5 px-5 text-center">
                              <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (p.membresiaActiva ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500')}>
                                {p.membresiaTipo ? p.membresiaTipo.charAt(0).toUpperCase() + p.membresiaTipo.slice(1) : 'Sin plan'}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              {dv !== null ? (
                                <span className={'text-xs font-semibold ' + (dv < 0 ? 'text-red-600' : dv <= 7 ? 'text-orange-600' : 'text-gray-500')}>
                                  {dv < 0 ? 'Vencida' : dv === 0 ? 'Hoy' : 'En ' + dv + ' dias'}
                                </span>
                              ) : <span className="text-gray-400 text-xs">—</span>}
                            </td>
                            <td className="py-3.5 px-5 text-center">
                              <button onClick={() => handleToggle(p.id)}
                                className={'text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-all ' + (p.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200')}>
                                {p.activo ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setConfRenovar(p)}
                                  className="text-purple-600 text-xs px-2.5 py-1 rounded-lg hover:bg-purple-50 font-semibold transition-all">
                                  Renovar
                                </button>
                                <button onClick={() => setConfDel(p)}
                                  className="text-red-400 hover:text-red-600 text-xs px-2.5 py-1 rounded-lg hover:bg-red-50 font-semibold transition-all">
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

          {/* ESTUDIANTES */}
          {tab === 'estudiantes' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Estudiantes</h2>
                  <p className="text-gray-400 text-sm">{estudiantesLista.length + ' registrados'}</p>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar estudiante..."
                    className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white" />
                </div>
              </div>

              {estFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <span className="text-5xl">👨‍🎓</span>
                  <p className="text-gray-500 mt-3 font-semibold">{busqueda ? 'Sin resultados' : 'Sin estudiantes registrados'}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-slate-50 border-b border-gray-100">
                      {['Estudiante', 'Registro', 'Materias', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className={'py-3 px-5 text-xs font-semibold text-gray-500 uppercase ' + (h === 'Estudiante' ? 'text-left' : 'text-center')}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {estFiltrados.map(e => (
                        <tr key={e.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                {e.nombre?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800">{e.nombre}</p>
                                <p className="text-xs text-gray-400">{e.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-center text-xs text-gray-500">{fmtFecha(e.createdAt)}</td>
                          <td className="py-3.5 px-5 text-center text-sm font-semibold text-purple-600">{e._count?.inscripciones || 0}</td>
                          <td className="py-3.5 px-5 text-center">
                            <button onClick={() => handleToggle(e.id)}
                              className={'text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer transition-all ' + (e.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200')}>
                              {e.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button onClick={() => setConfDel(e)} className="text-red-400 hover:text-red-600 text-xs px-2.5 py-1 rounded-lg hover:bg-red-50 font-semibold transition-all">
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

          {/* PAGOS */}
          {tab === 'pagos' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Historial de pagos</h2>
                <p className="text-gray-400 text-sm">{pagos.length + ' transacciones'}</p>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {[
                  { label: 'Total acumulado', value: fmt(ingresoTotal), icon: '💰', bg: 'bg-green-50', txt: 'text-green-700' },
                  { label: 'Este mes', value: fmt(pagosMes), icon: '📅', bg: 'bg-blue-50', txt: 'text-blue-700' },
                  { label: 'Transacciones', value: pagos.length, icon: '📋', bg: 'bg-purple-50', txt: 'text-purple-700' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{s.icon}</div>
                    <div className={'text-2xl font-black ' + s.txt}>{s.value}</div>
                    <div className="text-gray-600 text-sm font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {pagos.length === 0 ? (
                <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
                  <span className="text-5xl">💳</span>
                  <p className="text-gray-500 mt-3 font-semibold">Sin pagos registrados</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="bg-slate-50 border-b border-gray-100">
                      {['Profesor', 'Plan', 'Monto', 'Fecha', 'Estado'].map(h => (
                        <th key={h} className={'py-3 px-5 text-xs font-semibold text-gray-500 uppercase ' + (h === 'Profesor' ? 'text-left' : 'text-center')}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {pagos.map(p => (
                        <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50">
                          <td className="py-3.5 px-5">
                            <p className="font-semibold text-sm text-gray-800">{p.user?.nombre || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{p.user?.email || ''}</p>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold capitalize">{p.tipo}</span>
                          </td>
                          <td className="py-3.5 px-5 text-center font-bold text-green-600 text-sm">{fmt(p.monto)}</td>
                          <td className="py-3.5 px-5 text-center text-xs text-gray-500">{fmtFecha(p.createdAt)}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">{p.estado || 'aprobado'}</span>
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

      {/* Modal renovar */}
      {confirmarRenovar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <span className="text-5xl">🔑</span>
              <h3 className="font-black text-gray-900 text-lg mt-3">Renovar membresia</h3>
              <p className="text-gray-500 text-sm mt-1">{confirmarRenovar.nombre}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => handleRenovar(confirmarRenovar, 'mensual')}
                className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50 text-center hover:border-purple-400 transition-all">
                <p className="font-black text-purple-700 text-lg">$70.000</p>
                <p className="text-xs text-gray-500">Mensual</p>
              </button>
              <button onClick={() => handleRenovar(confirmarRenovar, 'anual')}
                className="p-4 rounded-2xl border-2 border-purple-200 bg-purple-50 text-center hover:border-purple-400 transition-all">
                <p className="font-black text-purple-700 text-lg">$700.000</p>
                <p className="text-xs text-gray-500">Anual</p>
                <p className="text-xs text-green-600 font-semibold">Ahorra $140.000</p>
              </button>
            </div>
            <button onClick={() => setConfRenovar(null)} className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {confirmarDel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <span className="text-5xl">⚠️</span>
              <h3 className="font-black text-gray-900 text-lg mt-3">Eliminar usuario</h3>
              <p className="text-gray-500 text-sm mt-2">
                Vas a eliminar a <span className="font-bold text-gray-800">{confirmarDel.nombre}</span>. Esta accion no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfDel(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 text-sm">
                Cancelar
              </button>
              <button onClick={() => handleEliminar(confirmarDel)} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 shadow-md text-sm">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}