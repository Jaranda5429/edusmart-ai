import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authService.login(form)
      login(res.data)
      const rol = res.data.usuario.rol
      if (rol === 'ADMIN') navigate('/admin/dashboard')
      else if (rol === 'PROFESOR') navigate('/profesor/dashboard')
      else navigate('/estudiante/dashboard')
    } catch (err) {
      const data = err.response?.data
      if (data?.requiereMembresia && data?.tokenTemporal) {
        sessionStorage.setItem('renovar_token', data.tokenTemporal)
        sessionStorage.setItem('renovar_usuario', JSON.stringify(data.usuario))
        navigate('/renovar')
        return
      }
      setError(data?.message || 'Error al iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: 14,
    padding: '14px 18px', fontFamily: 'Poppins,sans-serif',
    fontSize: 14, color: '#E5E7EB', outline: 'none',
    transition: 'all .15s', boxSizing: 'border-box'
  }

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'Poppins,sans-serif', background: '#0F0A1E', overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>

      {/* ── Panel izquierdo ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '28px 44px', position: 'relative', overflowY: 'auto', overflowX: 'hidden',
        background: 'linear-gradient(145deg, #0F0A1E 0%, #1a0533 40%, #2d1065 70%, #1a0533 100%)'
      }}>
        {/* Círculos decorativos */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Estrellas */}
        {[['8%','12%'],['25%','70%'],['55%','20%'],['70%','80%'],['85%','35%'],['40%','55%']].map(([l,t],i) => (
          <div key={i} style={{ position: 'absolute', left: l, top: t, color: 'rgba(167,139,250,0.35)', fontSize: [14,10,16,12,10,14][i], pointerEvents: 'none' }}>✦</div>
        ))}

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 6px 18px rgba(124,58,237,0.5)' }}>🧠</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontWeight: 900, fontSize: 19, color: '#fff' }}>EduSmart</span>
                <span style={{ fontWeight: 900, fontSize: 19, color: '#A78BFA' }}>AI+</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(167,139,250,0.6)', margin: 0, fontWeight: 500 }}>Inteligencia que educa</p>
            </div>
          </div>
        </div>

        {/* Contenido central */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              Transforma la<br />
              <span style={{ background: 'linear-gradient(90deg,#A78BFA,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>educacion</span><br />
              con IA
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(196,181,253,0.75)', lineHeight: 1.6, maxWidth: 380, margin: 0 }}>
              La plataforma educativa que potencia el aprendizaje de tus estudiantes con inteligencia artificial. Gestiona, analiza y motiva desde un solo lugar.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '📊', title: 'Analiticas en tiempo real', desc: 'Monitorea el progreso de cada estudiante al instante' },
              { icon: '🎮', title: 'Gamificacion educativa',   desc: 'Motiva con juegos, XP y logros que enganchen' },
              { icon: '🤖', title: 'Asistente IA integrado',  desc: 'Resuelve dudas y genera contenido automaticamente' },
              { icon: '📚', title: 'Gestion academica total',  desc: 'Periodos, grados, materias y actividades en un clic' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', borderRadius: 10, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', backdropFilter: 'blur(4px)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#E5E7EB', margin: 0 }}>{f.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(167,139,250,0.65)', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer izquierdo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 12, color: 'rgba(167,139,250,0.4)', margin: 0 }}>© 2026 EduSmart AI+. Todos los derechos reservados.</p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={{ width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', background: '#0F0A1E', borderLeft: '1px solid rgba(124,58,237,0.15)', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Bienvenido de vuelta</h2>
            <p style={{ fontSize: 14, color: 'rgba(156,163,175,0.7)', margin: 0 }}>Inicia sesion en tu cuenta</p>
          </div>

          {/* Card formulario */}
          <div style={{ background: '#1C1535', borderRadius: 20, border: '1px solid rgba(124,58,237,0.2)', padding: '24px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                  Correo electronico
                </label>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  style={inp} required
                  onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.background = 'rgba(124,58,237,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.25)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                  Contrasena
                </label>
                <input
                  type="password" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={inp} required
                  onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.background = 'rgba(124,58,237,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.25)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <Link to="/recuperar-password" style={{ fontSize: 12.5, color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>Olvidaste tu contraseña?</Link>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.45)', transition: 'all .15s', letterSpacing: 0.3 }}>
                {loading ? 'Verificando...' : 'Iniciar Sesion →'}
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(124,58,237,0.12)', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.6)', margin: 0 }}>
                No tienes cuenta?{' '}
                <Link to="/register" style={{ color: '#A78BFA', fontWeight: 700, textDecoration: 'none' }}>Registrate aqui</Link>
              </p>
            </div>
          </div>

          {/* Badges de confianza */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['🔒 Seguro', '⚡ Rapido', '🎓 Educativo'].map((b, i) => (
              <span key={i} style={{ fontSize: 11.5, color: 'rgba(167,139,250,0.5)', fontWeight: 500 }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
