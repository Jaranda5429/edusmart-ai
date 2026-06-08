import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

    // Paginas / secciones del sistema
    const paginasProf = [
      { tipo: 'Pagina', nombre: 'Inicio', icono: '🏠', ruta: '/profesor/dashboard', keys: 'inicio dashboard resumen principal' },
      { tipo: 'Pagina', nombre: 'Mis Cursos', icono: '📚', ruta: '/profesor/cursos', keys: 'cursos periodos grados materias actividades' },
      { tipo: 'Pagina', nombre: 'Estudiantes', icono: '👨‍🎓', ruta: '/profesor/estudiantes', keys: 'estudiantes alumnos lista' },
      { tipo: 'Pagina', nombre: 'Analiticas', icono: '📊', ruta: '/profesor/analiticas', keys: 'analiticas estadisticas graficas datos reportes' },
      { tipo: 'Pagina', nombre: 'Mi Perfil', icono: '👤', ruta: '/profesor/perfil', keys: 'perfil cuenta configuracion ajustes membresia' },
    ]
    const paginasEst = [
      { tipo: 'Pagina', nombre: 'Inicio', icono: '🏠', ruta: '/estudiante/dashboard', keys: 'inicio dashboard resumen principal matricula' },
      { tipo: 'Pagina', nombre: 'Mis Cursos', icono: '📚', ruta: '/estudiante/cursos', keys: 'cursos materias actividades tareas' },
      { tipo: 'Pagina', nombre: 'Tareas', icono: '📝', ruta: '/estudiante/tareas', keys: 'tareas pendientes entregas' },
      { tipo: 'Pagina', nombre: 'Progreso', icono: '📈', ruta: '/estudiante/progreso', keys: 'progreso calificaciones notas rendimiento logros' },
      { tipo: 'Pagina', nombre: 'Juegos', icono: '🎮', ruta: '/estudiante/juegos', keys: 'juegos jugar trivia ahorcado' },
      { tipo: 'Pagina', nombre: 'Notificaciones', icono: '🔔', ruta: '/estudiante/notificaciones', keys: 'notificaciones avisos alertas' },
      { tipo: 'Pagina', nombre: 'Mi Perfil', icono: '👤', ruta: '/estudiante/perfil', keys: 'perfil cuenta configuracion ajustes' },
    ]
    const paginas = esProf ? paginasProf : paginasEst
    paginas.forEach(pg => {
      const palabras = pg.keys.split(' ')
      const coincide = pg.nombre.toLowerCase().includes(ql) || palabras.some(p => p.startsWith(ql))
      if (coincide)
        res.push({ tipo: pg.tipo, nombre: pg.nombre, icono: pg.icono, ruta: pg.ruta })
    })

    if (esProf) {
      try {
        const periodos = JSON.parse(localStorage.getItem('periodos') || '[]')
        periodos.forEach(p => {
          if (p.nombre.toLowerCase().includes(ql))
            res.push({ tipo: 'Periodo', nombre: p.nombre, icono: '📅', ruta: '/profesor/cursos' })
          ;(p.grados || []).forEach(g => {
            if (g.nombre.toLowerCase().includes(ql))
              res.push({ tipo: 'Grado', nombre: g.nombre, sub: p.nombre, icono: '🎒', ruta: '/profesor/cursos' })
            ;(g.materias || []).forEach(m => {
              if (m.nombre.toLowerCase().includes(ql))
                res.push({ tipo: 'Materia', nombre: m.nombre, sub: g.nombre, icono: m.icono || '📖', ruta: '/profesor/cursos' })
            })
          })
        })
      } catch {}
      } else {
      try {
        const inscripciones = JSON.parse(localStorage.getItem('inscripciones_norm') || '[]')
        inscripciones.forEach(i => {
          if (i.materiaName?.toLowerCase().includes(ql))
            res.push({
              tipo: 'Materia',
              nombre: i.materiaName,
              sub: (i.gradoName || '') + ' · ' + (i.periodoName || ''),
              icono: '📖',
              ruta: '/estudiante/cursos?insc=' + i.id
            })
        })
      } catch {}
    }
    setResultados(res.slice(0, 6))
    setShow(true)
  }

  return (
    <div className="relative w-full max-w-xl" ref={ref}>
      <div className="flex items-center">
        <div className="relative flex-1">
          {/* Campos trampa para que Chrome no autocomplete la busqueda */}
          <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" name="password" autoComplete="current-password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={e => buscar(e.target.value)}
            onFocus={() => query && setShow(true)}
            type="search"
            name="search-edusmart-x9z"
            autoComplete="off"
            readOnly
            onFocusCapture={e => e.target.removeAttribute('readonly')}
            className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            placeholder="Buscar periodos, materias,..."
          />
          {query && (
            <button onClick={() => { setQuery(''); setResultados([]); setShow(false) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      {show && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden" style={{ zIndex: 9999 }}>
          {resultados.map((r, i) => (
            <button key={i} onClick={() => { navigate(r.ruta); setQuery(''); setShow(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-all text-left">
              <span className="text-xl">{r.icono}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{r.nombre}</p>
                {r.sub
                  ? <p className="text-xs text-gray-400 truncate">{r.tipo + ' · ' + r.sub}</p>
                  : <p className="text-xs text-gray-400">{r.tipo}</p>
                }
              </div>
              <span className="text-gray-300 text-sm">→</span>
            </button>
          ))}
        </div>
      )}

      {show && query && resultados.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center" style={{ zIndex: 9999 }}>
          <p className="text-gray-400 text-sm">Sin resultados para <span className="font-semibold">"{query}"</span></p>
        </div>
      )}
    </div>
  )
}

function Header({ rol }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const ref = useRef(null)
  const esProf = rol === 'PROFESOR'
  const home = esProf ? '/profesor/dashboard' : '/estudiante/dashboard'
  const gradient = esProf ? 'linear-gradient(135deg,#4C1D95,#7C3AED)' : 'linear-gradient(135deg,#1E40AF,#3B82F6)'

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShowMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100"
      style={{ height: 68, boxShadow: '0 2px 20px rgba(0,0,0,0.07)', overflow: 'visible' }}>
      <div className="flex items-center h-full px-6 gap-5 overflow-visible">

        <button onClick={() => navigate(home)} className="flex items-center gap-3 flex-shrink-0 hover:opacity-85 transition-opacity">
          <img src="/Logo.jpeg" alt="Logo" className="w-11 h-11 rounded-2xl object-contain shadow-md flex-shrink-0" />
          <div className="hidden sm:block">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-gray-900 text-xl leading-none tracking-tight">EduSmart</span>
              <span className="font-black text-yellow-500 text-xl leading-none">AI+</span>
            </div>
            <p className="text-xs text-gray-400 font-medium leading-none mt-0.5">{esProf ? 'Panel del Profesor' : 'Portal del Estudiante'}</p>
          </div>
        </button>

        <div className="flex-1 flex justify-center px-4">
          <SearchBar esProf={esProf} />
        </div>

        <div className="flex-shrink-0" ref={ref} style={{ position: 'relative' }}>
          <button onClick={() => setShowMenu(p => !p)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-sm flex-shrink-0" style={{ background: gradient }}>
              {usuario?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-gray-800 max-w-[120px] truncate leading-tight">{usuario?.nombre}</p>
              <p className="text-xs text-gray-400 font-medium">{esProf ? 'Profesor' : 'Estudiante'}</p>
            </div>
            <svg className={'w-4 h-4 text-gray-400 transition-transform ' + (showMenu ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <div className="bg-white rounded-2xl border border-gray-100 py-2"
              style={{ position: 'fixed', top: 68, right: 16, width: 224, zIndex: 99999, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0" style={{ background: gradient }}>
                    {usuario?.nombre?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{usuario?.nombre}</p>
                    <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => { navigate(esProf ? '/profesor/perfil' : '/estudiante/perfil'); setShowMenu(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all">
                <span className="text-base">👤</span> Mi Perfil
              </button>
              <div className="border-t border-gray-100 mt-1">
                <button onClick={() => { logout(); navigate('/login') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all rounded-b-2xl font-medium">
                  <span className="text-base">🚪</span> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function NavItem({ icon, label, path, dropdown }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const ref = useRef(null)
  const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path))

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setShow(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button onClick={() => { if (dropdown) setShow(p => !p); else navigate(path) }}
        className={'flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold transition-all relative whitespace-nowrap ' + (active ? 'text-purple-700' : 'text-gray-500 hover:text-gray-800')}>
        <span className="text-base">{icon}</span>
        <span>{label}</span>
        {dropdown && (
          <svg className={'w-3.5 h-3.5 ml-0.5 transition-transform ' + (show ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <span className={'absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all ' + (active ? 'bg-purple-600' : 'bg-transparent')} />
      </button>

      {dropdown && show && (
        <div className="absolute left-0 bg-white rounded-2xl border border-gray-100 py-2"
          style={{ top: '100%', marginTop: 4, minWidth: 220, zIndex: 9999, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
          {dropdown.map(d => (
            <button key={d.label} onClick={() => { navigate(d.path); setShow(false) }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all text-left font-medium">
              <span className="text-base">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout({ children, rol, navItems }) {
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Poppins,sans-serif' }}>
      <Header rol={rol} />
      <div className="fixed left-0 right-0 bg-white border-b border-gray-100"
        style={{ top: 68, zIndex: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'visible' }}>
        <div className="flex items-center px-4" style={{ overflow: 'visible' }}>
          {navItems.map(item => <NavItem key={item.label} {...item} />)}
        </div>
      </div>
      <div className="pt-[118px]">
        {children}
      </div>
    </div>
  )
 }
