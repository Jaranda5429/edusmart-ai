import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfesor } from '../../context/ProfesorContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
]

const fmt = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function StudentTareas() {
  const { usuario } = useAuth()
  const { inscripciones } = useProfesor()
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todas')

  const miId = usuario?.id

  // Aplanar todas las actividades de todas las materias
  const todas = inscripciones.flatMap(insc =>
    (insc.materia?.actividades || []).map(act => {
      const ent = (act.entregas || []).find(e => e.estudianteId === miId)
      const vencida = new Date(act.fechaLimite) < new Date()
      const noDisp = act.fechaInicio && new Date(act.fechaInicio) > new Date()
      let estado = 'pendiente'
      if (ent?.entregado && ent?.calificacion != null) estado = 'calificada'
      else if (ent?.entregado) estado = 'entregada'
      else if (noDisp) estado = 'no_disponible'
      else if (vencida) estado = 'vencida'
      return {
        ...act,
        materiaName: insc.materiaName,
        gradoName: insc.gradoName,
        entrega: ent,
        estado,
      }
    })
  )

  const filtradas = todas.filter(t => {
    if (filtro === 'todas') return true
    if (filtro === 'pendientes') return t.estado === 'pendiente'
    if (filtro === 'entregadas') return t.estado === 'entregada' || t.estado === 'calificada'
    if (filtro === 'vencidas') return t.estado === 'vencida'
    return true
  }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  const conteos = {
    todas: todas.length,
    pendientes: todas.filter(t => t.estado === 'pendiente').length,
    entregadas: todas.filter(t => t.estado === 'entregada' || t.estado === 'calificada').length,
    vencidas: todas.filter(t => t.estado === 'vencida').length,
  }

  const badge = (t) => {
    if (t.estado === 'no_disponible') return { txt: '🔒 No disponible', cls: 'bg-blue-50 text-blue-600 border-blue-200' }
    if (t.estado === 'vencida') return { txt: 'Vencida', cls: 'bg-red-50 text-red-600 border-red-200' }
    if (t.estado === 'calificada') return { txt: t.entrega.calificacion + '/10', cls: 'bg-green-50 text-green-700 border-green-200' }
    if (t.estado === 'entregada') return { txt: 'Entregada', cls: 'bg-purple-50 text-purple-700 border-purple-200' }
    return { txt: 'Pendiente', cls: 'bg-orange-50 text-orange-600 border-orange-200' }
  }

  const FILTROS = [
    { id: 'todas', label: 'Todas', icon: '📋' },
    { id: 'pendientes', label: 'Pendientes', icon: '⏳' },
    { id: 'entregadas', label: 'Entregadas', icon: '✅' },
    { id: 'vencidas', label: 'Vencidas', icon: '❌' },
  ]

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Mis Tareas 📝</h2>
          <p className="text-gray-400 text-sm mt-0.5">Todas tus actividades en un solo lugar</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border flex items-center gap-2 ' + (filtro === f.id ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300')}>
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (filtro === f.id ? 'bg-white/20' : 'bg-gray-100')}>{conteos[f.id]}</span>
            </button>
          ))}
        </div>

        {filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
            <span className="text-5xl">{filtro === 'todas' ? '📭' : '🎉'}</span>
            <p className="text-gray-500 mt-3 font-semibold">
              {filtro === 'todas' ? 'Sin tareas aun' : 'Nada en esta categoria'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {filtro === 'todas' ? 'Inscribete en materias para ver tus tareas' : 'Cambia de filtro para ver mas'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map(t => {
              const b = badge(t)
              const dias = Math.ceil((new Date(t.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
              const urgente = t.estado === 'pendiente' && dias >= 0 && dias <= 2
              return (
                <button key={t.id} onClick={() => navigate('/estudiante/cursos')}
                  className={'w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 border-2 ' + (urgente ? 'border-orange-300' : 'border-transparent hover:border-purple-200')}>
                  <div className={'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ' + (urgente ? 'bg-orange-100' : 'bg-purple-50')}>
                    {urgente ? '⚠️' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{t.titulo}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{(t.materiaName || '') + ' · ' + (t.gradoName || '')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{'⏰ ' + fmt(t.fechaLimite)}</p>
                  </div>
                  <span className={'text-xs px-3 py-1.5 rounded-full font-semibold border flex-shrink-0 ' + b.cls}>{b.txt}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}