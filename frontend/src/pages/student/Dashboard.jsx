import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProfesor } from '../../context/ProfesorContext'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
]

export default function StudentDashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const { matricularConClave, inscripciones, cargarInscripciones } = useProfesor()

  const [clave, setClave] = useState('')
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  const totalActs = inscripciones.reduce((a, i) =>
    a + (i.materia?.actividades?.length || 0), 0)
  const entregadas = inscripciones.reduce((a, i) =>
    a + (i.materia?.actividades?.filter(act =>
      act.entregas?.some(e => e.entregado)
    ).length || 0), 0)
  const pendientes = inscripciones.reduce((a, i) =>
    a + (i.materia?.actividades?.filter(act =>
      !act.entregas?.some(e => e.entregado) &&
      new Date(act.fechaLimite) >= new Date()
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
    const res = await matricularConClave(clave.trim(), {
      nombre: usuario?.nombre || '',
      email: usuario?.email || ''
    })
    setResultado(res)
    setLoading(false)
    if (res.ok) {
      setClave('')
      await cargarInscripciones()
    }
  }

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">

        <div className="rounded-2xl p-7 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED,#A78BFA)' }}>
          <div>
            <h2 className="text-2xl font-bold text-white">
              <span>{'Hola, ' + (usuario?.nombre?.split(' ')[0] || '') + '!'}</span>
            </h2>
            <p className="text-purple-200 text-sm mt-1">
              <span>{inscripciones.length > 0 ? (inscripciones.length + ' materia' + (inscripciones.length !== 1 ? 's' : '') + ' inscrita' + (inscripciones.length !== 1 ? 's' : '')) : 'Ingresa tu codigo de matricula para empezar'}</span>
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-2xl hidden md:flex">
            {usuario?.nombre?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🔑</div>
            <div>
              <h3 className="font-bold text-gray-800">Matricula con codigo</h3>
              <p className="text-gray-400 text-sm">Ingresa el codigo que te dio tu profesor</p>
            </div>
          </div>
          <div className="flex gap-3 max-w-lg">
            <input
              value={clave}
              onChange={e => { setClave(e.target.value.toUpperCase()); setResultado(null) }}
              onKeyDown={e => { if (e.key === 'Enter') handleMatricular() }}
              placeholder="Ej: MAT6A"
              maxLength={12}
              className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl px-4 py-3 text-center text-xl font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            />
            <button onClick={handleMatricular} disabled={loading || !clave.trim()}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-md disabled:opacity-40 text-sm">
              {loading ? '...' : 'Matricularme'}
            </button>
          </div>
          {resultado && (
            <div className={'mt-3 rounded-xl p-3 text-sm font-semibold border ' + (resultado.ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200')}>
              <span>{resultado.ok ? '✅ ' : '❌ '}{resultado.msg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Actividades', value: totalActs, icon: '📝', bg: 'bg-purple-50', txt: 'text-purple-700' },
            { label: 'Entregadas', value: entregadas, icon: '✅', bg: 'bg-green-50', txt: 'text-green-700' },
            { label: 'Pendientes', value: pendientes, icon: '⏳', bg: 'bg-yellow-50', txt: 'text-yellow-700' },
            { label: 'Promedio', value: promedio ? (promedio + '/10') : 'S/N', icon: '⭐', bg: 'bg-blue-50', txt: 'text-blue-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className={'w-11 h-11 ' + s.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{s.icon}</div>
              <div className={'text-3xl font-black ' + s.txt + ' mb-1'}>{s.value}</div>
              <div className="text-gray-600 text-sm font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-gray-800 text-lg mb-4">Accesos rapidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '📚', label: 'Mis Cursos', sub: 'Ver materias', ruta: '/estudiante/cursos', bg: 'bg-purple-50', txt: 'text-purple-700' },
              { icon: '📝', label: 'Tareas', sub: 'Pendientes', ruta: '/estudiante/tareas', bg: 'bg-blue-50', txt: 'text-blue-700' },
              { icon: '📈', label: 'Progreso', sub: 'Calificaciones', ruta: '/estudiante/progreso', bg: 'bg-green-50', txt: 'text-green-700' },
              { icon: '🎮', label: 'Juegos', sub: 'Aprende jugando', ruta: '/estudiante/juegos', bg: 'bg-yellow-50', txt: 'text-yellow-700' },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.ruta)}
                className="bg-white rounded-2xl p-5 text-left hover:-translate-y-1 hover:shadow-md transition-all shadow-sm border-2 border-transparent hover:border-purple-100">
                <div className={'w-11 h-11 ' + item.bg + ' rounded-xl flex items-center justify-center text-2xl mb-3'}>{item.icon}</div>
                <h4 className={'font-bold ' + item.txt + ' text-sm'}>{item.label}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Proximas actividades</h3>
            <button onClick={() => navigate('/estudiante/tareas')} className="text-purple-600 text-sm font-semibold hover:underline">Ver todas</button>
          </div>
          {proximas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <span className="text-5xl">{inscripciones.length > 0 ? '🎉' : '📭'}</span>
              <p className="text-gray-500 mt-3 font-semibold"><span>{inscripciones.length > 0 ? 'Todo al dia!' : 'Sin actividades aun'}</span></p>
              <p className="text-gray-400 text-sm mt-1"><span>{inscripciones.length > 0 ? 'No tienes pendientes' : 'Ingresa tu codigo arriba para matricularte'}</span></p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximas.map(act => {
                const dias = Math.ceil((new Date(act.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
                const urgente = dias <= 2
                const diasTxt = dias <= 0 ? 'Hoy!' : dias === 1 ? 'Manana' : (dias + ' dias')
                return (
                  <button key={act.id} onClick={() => navigate('/estudiante/cursos')}
                    className={'w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4' + (urgente ? ' border-l-4 border-orange-400' : '')}>
                    <div className={'w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ' + (urgente ? 'bg-orange-100' : 'bg-purple-50')}>
                      {urgente ? '⚠️' : '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{act.titulo}</p>
                      <p className="text-xs text-gray-400 mt-0.5"><span>{(act.materiaNombre || '') + ' · ' + (act.periodoNombre || '')}</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={'text-xs font-bold ' + (urgente ? 'text-orange-600' : 'text-gray-500')}>{diasTxt}</p>
                      <p className="text-xs text-gray-400">{act.fechaLimite}</p>
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