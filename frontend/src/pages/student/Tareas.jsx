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
    if (t.estado === 'no_disponible') return { txt: '🔒 No disponible', cls: 'bg-[rgba(59,130,246,0.1)] text-[#60A5FA] border-[rgba(59,130,246,0.3)]' }
    if (t.estado === 'vencida') return { txt: 'Vencida', cls: 'bg-[rgba(239,68,68,0.1)] text-[#F87171] border-[rgba(239,68,68,0.3)]' }
    if (t.estado === 'calificada') return { txt: t.entrega.calificacion + '/10', cls: 'bg-[rgba(16,185,129,0.1)] text-[#34D399] border-[rgba(16,185,129,0.3)]' }
    if (t.estado === 'entregada') return { txt: 'Entregada', cls: 'bg-[rgba(124,58,237,0.12)] text-[#A78BFA] border-[rgba(124,58,237,0.3)]' }
    return { txt: 'Pendiente', cls: 'bg-[rgba(245,158,11,0.12)] text-[#FBBF24] border-[rgba(245,158,11,0.3)]' }
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
        <div style={{ background: "rgba(28,21,53,0.8)", backdropFilter: "blur(8px)" }} className=" px-4 py-2 rounded-xl inline-block">
          <h2 className="text-2xl font-black text-[#F3F4F6]">Mis Tareas </h2>
          <p className="text-[#E5E7EB] text-base mt-0.5">Todas tus actividades en un solo lugar</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={'px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border flex items-center gap-2 ' + (filtro === f.id ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-[rgba(124,58,237,0.08)] text-[rgba(167,139,250,0.8)] border-[rgba(124,58,237,0.2)] hover:border-[rgba(124,58,237,0.5)] hover:bg-[rgba(124,58,237,0.15)]')}>
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span className={'text-xs px-1.5 py-0.5 rounded-full ' + (filtro === f.id ? 'bg-[rgba(255,255,255,0.08)]' : 'bg-[rgba(255,255,255,0.06)]')}>{conteos[f.id]}</span>
            </button>
          ))}
        </div>

        {filtradas.length === 0 ? (
          <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-14 text-center shadow-none">
            <span className="text-5xl">{filtro === 'todas' ? '📭' : '🎉'}</span>
            <p className="text-[rgba(156,163,175,0.7)] mt-3 font-semibold">
              {filtro === 'todas' ? 'Sin tareas aun' : 'Nada en esta categoria'}
            </p>
            <p className="text-[rgba(156,163,175,0.5)] text-sm mt-1">
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
                  style={{
                    width: '100%', background: urgente ? 'rgba(245,158,11,0.08)' : '#1C1535',
                    borderRadius: 16, padding: '18px 20px', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 16,
                    border: urgente ? '1.5px solid rgba(245,158,11,0.35)' : '1px solid rgba(124,58,237,0.2)',
                    cursor: 'pointer', transition: 'all .15s',
                    borderLeft: urgente ? '4px solid #F59E0B' : '4px solid rgba(124,58,237,0.4)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = urgente ? 'rgba(245,158,11,0.6)' : 'rgba(124,58,237,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = urgente ? 'rgba(245,158,11,0.35)' : 'rgba(124,58,237,0.2)'}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, background: urgente ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.15)' }}>
                    {urgente ? '⚠️' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#E5E7EB] truncate">{t.titulo}</h4>
                    <p className="text-xs text-[rgba(156,163,175,0.5)] mt-0.5">{(t.materiaName || '') + ' · ' + (t.gradoName || '')}</p>
                    <p className="text-xs text-[rgba(156,163,175,0.5)] mt-0.5">{'⏰ ' + fmt(t.fechaLimite)}</p>
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