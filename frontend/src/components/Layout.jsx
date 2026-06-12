import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProfesor } from '../context/ProfesorContext'
import { foroService } from '../services/api'

const NAV_STUDENT = [
  { icon: '🏠', label: 'Inicio',         path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos',     path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas',         path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso',       path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos',         path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones', badge: true },
]

const NAV_TEACHER = [
  { icon: '🏠', label: 'Inicio',       path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos',   path: '/profesor/cursos' },
  { icon: '🎓', label: 'Estudiantes',  path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analiticas',   path: '/profesor/analiticas' },
]

/* ─── Search ─────────────────────────────────────── */
function SearchBar({ esProf }) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [show, setShow] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const buscar = (q) => {
    setQuery(q)
    if (!q.trim()) { setResultados([]); setShow(false); return }
    const ql = q.toLowerCase()
    const res = []
    const paginasProf = [
      { tipo: 'Pagina', nombre: 'Inicio',      icono: '🏠', ruta: '/profesor/dashboard',   keys: 'inicio dashboard resumen principal' },
      { tipo: 'Pagina', nombre: 'Mis Cursos',  icono: '📚', ruta: '/profesor/cursos',       keys: 'cursos periodos grados materias actividades' },
      { tipo: 'Pagina', nombre: 'Estudiantes', icono: '🎓', ruta: '/profesor/estudiantes',  keys: 'estudiantes alumnos lista' },
      { tipo: 'Pagina', nombre: 'Analiticas',  icono: '📊', ruta: '/profesor/analiticas',   keys: 'analiticas estadisticas graficas datos reportes' },
      { tipo: 'Pagina', nombre: 'Mi Perfil',   icono: '👤', ruta: '/profesor/perfil',       keys: 'perfil cuenta configuracion ajustes membresia' },
    ]
    const paginasEst = [
      { tipo: 'Pagina', nombre: 'Inicio',         icono: '🏠', ruta: '/estudiante/dashboard',      keys: 'inicio dashboard resumen principal matricula' },
      { tipo: 'Pagina', nombre: 'Mis Cursos',     icono: '📚', ruta: '/estudiante/cursos',         keys: 'cursos materias actividades tareas' },
      { tipo: 'Pagina', nombre: 'Tareas',         icono: '📝', ruta: '/estudiante/tareas',         keys: 'tareas pendientes entregas' },
      { tipo: 'Pagina', nombre: 'Progreso',       icono: '📈', ruta: '/estudiante/progreso',       keys: 'progreso calificaciones notas rendimiento logros' },
      { tipo: 'Pagina', nombre: 'Juegos',         icono: '🎮', ruta: '/estudiante/juegos',         keys: 'juegos jugar trivia ahorcado' },
      { tipo: 'Pagina', nombre: 'Notificaciones', icono: '🔔', ruta: '/estudiante/notificaciones', keys: 'notificaciones avisos alertas' },
      { tipo: 'Pagina', nombre: 'Mi Perfil',      icono: '👤', ruta: '/estudiante/perfil',         keys: 'perfil cuenta configuracion ajustes' },
    ]
    const paginas = esProf ? paginasProf : paginasEst
    paginas.forEach(pg => {
      if (pg.nombre.toLowerCase().includes(ql) || pg.keys.split(' ').some(p => p.startsWith(ql)))
        res.push({ tipo: pg.tipo, nombre: pg.nombre, icono: pg.icono, ruta: pg.ruta })
    })
    if (esProf) {
      try {
        const periodos = JSON.parse(localStorage.getItem('periodos') || '[]')
        periodos.forEach(p => {
          if (p.nombre.toLowerCase().includes(ql)) res.push({ tipo: 'Periodo', nombre: p.nombre, icono: '📅', ruta: '/profesor/cursos' })
          ;(p.grados || []).forEach(g => {
            if (g.nombre.toLowerCase().includes(ql)) res.push({ tipo: 'Grado', nombre: g.nombre, sub: p.nombre, icono: '🎒', ruta: '/profesor/cursos' })
            ;(g.materias || []).forEach(m => {
              if (m.nombre.toLowerCase().includes(ql)) res.push({ tipo: 'Materia', nombre: m.nombre, sub: g.nombre, icono: m.icono || '📖', ruta: '/profesor/cursos' })
            })
          })
        })
      } catch {}
    } else {
      try {
        const inscripciones = JSON.parse(localStorage.getItem('inscripciones_norm') || '[]')
        inscripciones.forEach(i => {
          if (i.materiaName?.toLowerCase().includes(ql))
            res.push({ tipo: 'Materia', nombre: i.materiaName, sub: (i.gradoName || '') + ' · ' + (i.periodoName || ''), icono: '📖', ruta: '/estudiante/cursos?insc=' + i.id })
        })
      } catch {}
    }
    setResultados(res.slice(0, 6))
    setShow(true)
  }

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: 560 }}>
      <div style={{ position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={query}
          onChange={e => buscar(e.target.value)}
          onFocus={() => query && setShow(true)}
          type="search" name="search-edu" autoComplete="off"
          readOnly onFocusCapture={e => e.target.removeAttribute('readonly')}
          placeholder="Buscar materiales, tareas, cursos..."
          style={{
            width: '100%', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            padding: '11px 16px 11px 42px',
            fontFamily: 'Poppins,sans-serif', fontSize: 13.5,
            color: '#E5E7EB', outline: 'none', transition: 'all .15s'
          }}
          onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.13)'; e.target.style.borderColor = 'rgba(167,139,250,0.5)' }}
          onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResultados([]); setShow(false) }}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14 }}>✕</button>
        )}
      </div>
      {show && resultados.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1E1B2E', borderRadius: 12, border: '1px solid rgba(167,139,250,0.2)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)', zIndex: 9999, overflow: 'hidden' }}>
          {resultados.map((r, i) => (
            <button key={i} onClick={() => { navigate(r.ruta); setQuery(''); setShow(false) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: 18 }}>{r.icono}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: '#E5E7EB', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre}</p>
                <p style={{ fontSize: 11, color: '#6B7280', margin: 0 }}>{r.sub ? r.tipo + ' · ' + r.sub : r.tipo}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {show && query && resultados.length === 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1E1B2E', borderRadius: 12, border: '1px solid rgba(167,139,250,0.2)', padding: '16px', textAlign: 'center', zIndex: 9999 }}>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Sin resultados para <b style={{ color: '#A78BFA' }}>"{query}"</b></p>
        </div>
      )}
    </div>
  )
}

/* ─── Sidebar ─────────────────────────────────────── */
function Sidebar({ esProf, navItems, hayNotis }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={{
      width: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #0F0A1E 0%, #1A1035 60%, #0F0A1E 100%)',
      fontFamily: 'Poppins,sans-serif', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      borderRight: '1px solid rgba(124,58,237,0.2)',
      boxShadow: '4px 0 30px rgba(0,0,0,0.4)'
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate(esProf ? '/profesor/dashboard' : '/estudiante/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 14px rgba(124,58,237,0.5)', flexShrink: 0 }}>
            🧠
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>EduSmart</span>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#A78BFA' }}>AI+</span>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(167,139,250,0.7)', margin: 0, fontWeight: 500 }}>Inteligencia que educa</p>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          const showBadge = item.badge && hayNotis
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                fontFamily: 'Poppins,sans-serif', fontSize: 13.5, fontWeight: active ? 700 : 400,
                transition: 'all .15s', textAlign: 'left',
                background: active ? 'linear-gradient(90deg,#7C3AED,#6D28D9)' : 'transparent',
                color: active ? '#fff' : 'rgba(209,213,219,0.75)',
                boxShadow: active ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#E5E7EB' } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(209,213,219,0.75)' } }}>
              <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {showBadge && (
                <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>!</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bot IA decorativo */}
      <div style={{ margin: '0 12px 12px', borderRadius: 14, background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(76,29,149,0.3))', border: '1px solid rgba(124,58,237,0.3)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#E5E7EB', margin: 0 }}>Asistente IA</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399' }} />
              <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>En linea</span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(209,213,219,0.6)', margin: 0, lineHeight: 1.4 }}>Tu asistente inteligente para ensenar mejor.</p>
      </div>

      {/* Usuario */}
    </aside>
  )
}

/* ─── Header superior ─────────────────────────────── */
function TopBar({ rol, hayNotis }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const ref = useRef(null)
  const esProf = rol === 'PROFESOR'

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 240, right: 0, height: 64, zIndex: 40,
      background: 'rgba(15,10,30,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(124,58,237,0.15)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, overflow: 'visible'
    }}>
      <SearchBar esProf={esProf} />
      <div style={{ flex: 1 }} />

      {/* Campana */}
      {!esProf && (
        <button onClick={() => navigate('/estudiante/notificaciones')}
          style={{ position: 'relative', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px', cursor: 'pointer', color: '#D1D5DB', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.color = '#A78BFA' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#D1D5DB' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {hayNotis && <span style={{ position: 'absolute', top: 3, right: 3, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '2px solid #0F0A1E' }} />}
        </button>
      )}

      {/* Avatar */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setShowMenu(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 40, padding: '5px 12px 5px 5px', cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'}
          onMouseLeave={e => { if (!showMenu) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0 }}>
            {usuario?.nombre?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#F3F4F6', margin: 0, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario?.nombre}</p>
            <p style={{ fontSize: 10.5, color: '#A78BFA', margin: 0, fontWeight: 500 }}>{esProf ? 'Profesor' : 'Estudiante'}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform .2s', transform: showMenu ? 'rotate(180deg)' : 'none' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        {showMenu && (
          <div style={{ position: 'fixed', top: 68, right: 16, width: 210, background: '#1A1035', borderRadius: 14, border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', zIndex: 99999, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: 14, flexShrink: 0 }}>
                  {usuario?.nombre?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#F3F4F6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario?.nombre}</p>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usuario?.email}</p>
                </div>
              </div>
            </div>
            <button onClick={() => { setShowMenu(false); navigate(esProf ? '/profesor/perfil' : '/estudiante/perfil') }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#D1D5DB', fontWeight: 500, textAlign: 'left' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#A78BFA' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#D1D5DB' }}>
              👤 Mi Perfil
            </button>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => { setShowMenu(false); logout(); navigate('/login') }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontSize: 13, color: '#FCA5A5', fontWeight: 500, textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                🚪 Cerrar Sesion
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

/* ─── Layout ──────────────────────────────────────── */
export default function Layout({ children, rol, navItems }) {
  const { usuario } = useAuth()
  const { inscripciones } = useProfesor()
  const [hayNotis, setHayNotis] = useState(false)
  const esProf = rol === 'PROFESOR'
  const nav = navItems || (esProf ? NAV_TEACHER : NAV_STUDENT)

  useEffect(() => {
    if (rol !== 'ESTUDIANTE' || !usuario) return
    const calcular = async () => {
      let leidas = []
      try { leidas = JSON.parse(localStorage.getItem('notis_leidas') || '[]') } catch {}
      const ids = []
      const ahora = Date.now()
      const miId = usuario.id
      ;(inscripciones || []).forEach(insc => {
        (insc.materia?.actividades || []).forEach(act => {
          const ent = (act.entregas || []).find(e => e.estudianteId === miId)
          const creada = new Date(act.createdAt).getTime()
          const noDisp = act.fechaInicio && new Date(act.fechaInicio).getTime() > ahora
          if (ent?.entregado && ent?.calificacion != null) ids.push('calif-' + act.id)
          else if (!ent?.entregado && !noDisp && (ahora - creada) <= 4 * 24 * 60 * 60 * 1000) ids.push('nueva-' + act.id)
        })
      })
      try {
        const res = await foroService.getNotificaciones()
        ;(res.data || []).forEach(n => ids.push('bd-' + n.id))
      } catch {}
      setHayNotis(ids.some(id => !leidas.includes(id)))
    }
    calcular()
  }, [rol, usuario, inscripciones])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F0A1E', fontFamily: 'Poppins,sans-serif' }}>
      <Sidebar esProf={esProf} navItems={nav} hayNotis={hayNotis} />
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column' }}>
        <TopBar rol={rol} hayNotis={hayNotis} />
        <main style={{ flex: 1, marginTop: 64, padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
