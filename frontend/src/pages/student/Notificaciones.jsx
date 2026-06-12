import { useState, useMemo, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfesor } from '../../context/ProfesorContext'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import { foroService } from '../../services/api'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
]

const fmt = iso => {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// Cuánto tiempo "hace" de una fecha
const haceTiempo = (iso) => {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return 'Hace ' + min + ' min'
  const horas = Math.floor(min / 60)
  if (horas < 24) return 'Hace ' + horas + ' h'
  const dias = Math.floor(horas / 24)
  return 'Hace ' + dias + ' dia' + (dias !== 1 ? 's' : '')
}

export default function StudentNotificaciones() {
  const { usuario } = useAuth()
  const { inscripciones } = useProfesor()
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todas')
  const [leidas, setLeidas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notis_leidas') || '[]')
    } catch {
      return []
    }
  })

  const [notisBD, setNotisBD] = useState([])

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await foroService.getNotificaciones()
        setNotisBD(res.data || [])
      } catch { console.error('Error cargando notis') }
    }
    cargar()
  }, [])

  useEffect(() => {
    localStorage.setItem('notis_leidas', JSON.stringify(leidas))
  }, [leidas])

  const miId = usuario?.id
  const ahora = Date.now()

  // Generar notificaciones a partir de las actividades
  const notificaciones = useMemo(() => {
    const lista = []

    inscripciones.forEach(insc => {
      const acts = insc.materia?.actividades || []
      acts.forEach(act => {
        const ent = (act.entregas || []).find(e => e.estudianteId === miId)
        const limite = new Date(act.fechaLimite).getTime()
        const creada = new Date(act.createdAt).getTime()
        const diasParaVencer = Math.ceil((limite - ahora) / (1000 * 60 * 60 * 24))
        const noDisp = act.fechaInicio && new Date(act.fechaInicio).getTime() > ahora
        const base = { materia: insc.materiaName, actId: act.id, ruta: '/estudiante/cursos?insc=' + insc.id }

        // 1. Calificada
        if (ent?.entregado && ent?.calificacion != null) {
          lista.push({
            ...base,
            id: 'calif-' + act.id,
            tipo: 'calificada',
            icono: '⭐',
            color: ent.calificacion >= 7 ? 'green' : 'red',
            titulo: 'Calificaron tu entrega',
            mensaje: act.titulo + ' · Nota: ' + ent.calificacion + '/10',
            fecha: act.createdAt,
          })
        }
        // 2. Tarea nueva (creada hace <= 4 dias, no entregada, ya disponible)
        else if (!ent?.entregado && !noDisp && (ahora - creada) <= 4 * 24 * 60 * 60 * 1000) {
          lista.push({
            ...base,
            id: 'nueva-' + act.id,
            tipo: 'nueva',
            icono: act.soloForo ? '💬' : '📝',
            color: 'purple',
            titulo: act.soloForo ? 'Nuevo foro para participar' : 'Nueva actividad',
            mensaje: act.titulo + ' · ' + insc.materiaName,
            fecha: act.createdAt,
          })
        }

        // 3. Por vencer (pendiente, vence en <= 2 dias y aún no pasó)
        if (!ent?.entregado && !noDisp && diasParaVencer >= 0 && diasParaVencer <= 2) {
          lista.push({
            ...base,
            id: 'vence-' + act.id,
            tipo: 'vence',
            icono: '⏰',
            color: 'orange',
            titulo: diasParaVencer === 0 ? 'Vence hoy' : 'Vence pronto',
            mensaje: act.titulo + ' · ' + fmt(act.fechaLimite),
            fecha: act.fechaLimite,
          })
        }

        // 4. Vencida sin entregar
        if (!ent?.entregado && !noDisp && diasParaVencer < 0) {
          lista.push({
            ...base,
            id: 'vencida-' + act.id,
            tipo: 'vencida',
            icono: '❌',
            color: 'red',
            titulo: 'Actividad vencida',
            mensaje: act.titulo + ' · ' + insc.materiaName,
            fecha: act.fechaLimite,
          })
        }
      })
    })

    // Ordenar por fecha más reciente
    // Agregar notificaciones de la base de datos (ej: foro eliminado)
    notisBD.forEach(n => {
      const iconos = { foro_eliminado: '🗑️', quiz_nuevo: '❓', foro_nuevo: '💬' }
      const colores = { foro_eliminado: 'red', quiz_nuevo: 'purple', foro_nuevo: 'purple' }
      lista.push({
        id: 'bd-' + n.id,
        tipo: n.tipo,
        icono: iconos[n.tipo] || '🔔',
        color: colores[n.tipo] || 'red',
        titulo: n.titulo,
        mensaje: n.mensaje,
        fecha: n.createdAt,
        ruta: n.ruta || '/estudiante/cursos',
      })
    })

    // Ordenar por fecha mas reciente y descartar las viejas (mas de 7 dias)
    const TRES_DIAS = 3 * 24 * 60 * 60 * 1000
    return lista
      .filter(n => (ahora - new Date(n.fecha).getTime()) <= TRES_DIAS)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }, [inscripciones, miId, ahora, notisBD])

  const noLeidas = notificaciones.filter(n => !leidas.includes(n.id))
  const mostradas = filtro === 'sin_leer' ? noLeidas : notificaciones

  const marcarLeida = (n) => {
    if (!leidas.includes(n.id)) setLeidas(prev => [...prev, n.id])
  }
  const marcarTodas = () => setLeidas(notificaciones.map(n => n.id))

  const irA = (n) => {
    marcarLeida(n)
    navigate(n.ruta)
  }

  const COLORES = {
    purple: 'bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.3)] text-[#A78BFA]',
    orange: 'bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.3)] text-[#FBBF24]',
    red: 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#F87171]',
    green: 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#34D399]',
  }

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#7C3AED,#4C1D95)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px rgba(124,58,237,0.4)", flexShrink: 0 }}>🔔</div>
            <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#E5E7EB", margin: 0 }}>Notificaciones</h2>
            <p style={{ fontSize: 12, color: "rgba(167,139,250,0.7)", margin: 0, fontWeight: 500 }}>
              {noLeidas.length > 0 ? (noLeidas.length + ' sin leer') : 'Estas al dia'}
            </p>
            </div>
          </div>
          {noLeidas.length > 0 && (
            <button onClick={marcarTodas}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700 bg-[#1C1535] border border-[rgba(124,58,237,0.2)] px-4 py-2 rounded-xl shadow-none hover:bg-[rgba(124,58,237,0.12)] transition-all">
              Marcar todas leidas
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {[{ id: 'todas', label: 'Todas' }, { id: 'sin_leer', label: 'Sin leer' }].map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={'px-4 py-2 rounded-xl font-semibold text-sm transition-all border ' + (filtro === f.id ? 'bg-purple-600 text-white border-purple-600' : 'bg-[rgba(124,58,237,0.08)] text-[rgba(167,139,250,0.8)] border-[rgba(124,58,237,0.2)] hover:bg-[rgba(124,58,237,0.15)]')}>
              {f.label}
              {f.id === 'sin_leer' && noLeidas.length > 0 && (
                <span className={'ml-2 text-xs px-1.5 py-0.5 rounded-full ' + (filtro === f.id ? 'bg-[rgba(255,255,255,0.08)]' : 'bg-[rgba(124,58,237,0.15)] text-purple-600')}>{noLeidas.length}</span>
              )}
            </button>
          ))}
        </div>

        {mostradas.length === 0 ? (
          <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.18)" }} className="p-14 text-center shadow-none">
            <span className="text-5xl">🎉</span>
            <p className="text-[rgba(156,163,175,0.7)] mt-3 font-semibold">{filtro === 'sin_leer' ? 'Sin notificaciones pendientes' : 'Sin notificaciones'}</p>
            <p className="text-[rgba(156,163,175,0.5)] text-sm mt-1">Te avisaremos cuando haya novedades</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mostradas.map(n => {
              const leida = leidas.includes(n.id)
              return (
                <button key={n.id} onClick={() => irA(n)}
                  style={{ width: '100%', textAlign: 'left', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, border: leida ? '1px solid rgba(124,58,237,0.12)' : '1px solid rgba(124,58,237,0.3)', background: leida ? 'rgba(28,21,53,0.6)' : '#1C1535', cursor: 'pointer', transition: 'all .15s', borderLeft: leida ? '3px solid rgba(124,58,237,0.15)' : '3px solid #7C3AED' }}>
                  <div className={'w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ' + (COLORES[n.color] || COLORES.purple)}>
                    {n.icono}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p style={{ fontWeight: 700, color: "#E5E7EB", fontSize: 13, margin: 0 }}>{n.titulo}</p>
                      {!leida && <span className="w-2 h-2 bg-[rgba(124,58,237,0.12)]0 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-[rgba(156,163,175,0.7)] text-sm truncate">{n.mensaje}</p>
                    <p className="text-[rgba(156,163,175,0.5)] text-xs mt-0.5">{haceTiempo(n.fecha)}</p>
                  </div>
                  <span className="text-gray-300 text-lg flex-shrink-0">→</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}