import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import PasswordInput from '../../components/common/PasswordInput'

const PLANES = [
  { id: 'mensual', label: 'Mensual', precioFmt: '$70.000', periodo: 'por mes', desc: 'Acceso completo 1 mes', popular: false, ahorro: null },
  { id: 'anual', label: 'Anual', precioFmt: '$700.000', periodo: 'por año', desc: 'Equiv. $58.333/mes', popular: true, ahorro: 'Ahorras $140k' },
]

const inp = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: 12,
  padding: '12px 16px', fontFamily: 'Poppins,sans-serif',
  fontSize: 13.5, color: '#E5E7EB', outline: 'none',
  transition: 'all .15s', boxSizing: 'border-box'
}
const lbl = { display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }
const focIn  = e => { e.target.style.borderColor = '#7C3AED'; e.target.style.background = 'rgba(124,58,237,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)' }
const focOut = e => { e.target.style.borderColor = 'rgba(124,58,237,0.25)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none' }

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [rol, setRol] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' })
  const [plan, setPlan] = useState('mensual')
  const [card, setCard] = useState({ numero: '', nombre: '', vence: '', cvv: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tempToken, setTempToken] = useState(null)

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const validar = () => {
    if (!form.nombre.trim()) return 'Ingresa tu nombre completo.'
    if (!form.email.includes('@')) return 'Email invalido.'
    if (form.password.length < 6) return 'La contrasena debe tener al menos 6 caracteres.'
    if (form.password !== form.confirmar) return 'Las contrasenas no coinciden.'
    return null
  }

  const irPaso3 = async () => {
    const err = validar()
    if (err) { setError(err); return }
    setError(''); setLoading(true)
    try {
      const res = await authService.register({ nombre: form.nombre, email: form.email, password: form.password, rol })
      if (rol === 'ESTUDIANTE') { login(res.data); navigate('/estudiante/dashboard') }
      else { setTempToken(res.data.token); setPaso(3) }
    } catch (e) { setError(e.response?.data?.message || 'Error al registrarse.') }
    finally { setLoading(false) }
  }

  const validarTarjeta = () => {
    const num = card.numero.replace(/\s/g, '')
    if (num.length !== 16 || !/^\d+$/.test(num)) return 'Numero de tarjeta invalido.'
    if (!card.nombre.trim() || card.nombre.trim().length < 3) return 'Ingresa el nombre del titular.'
    if (!/^\d{2}\/\d{2}$/.test(card.vence)) return 'Fecha invalida (MM/AA).'
    const [m, a] = card.vence.split('/')
    if (parseInt(m) < 1 || parseInt(m) > 12) return 'Mes invalido.'
    if (new Date(2000 + parseInt(a), parseInt(m), 0) < new Date()) return 'Tarjeta vencida.'
    if (!/^\d{3,4}$/.test(card.cvv)) return 'CVV invalido.'
    return null
  }

  const pagar = async () => {
    const errT = validarTarjeta()
    if (errT) { setError(errT); return }
    setError(''); setLoading(true)
    try {
      const res = await authService.pagarMembresia({ tipo: plan, datosTarjeta: card }, tempToken)
      login(res.data); navigate('/profesor/dashboard')
    } catch (e) { setError(e.response?.data?.message || 'Error procesando pago.') }
    finally { setLoading(false) }
  }

  const fmtCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const fmtDate = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  // Textos del panel izquierdo por paso
  const leftContent = {
    1: { icon: '🚀', title: 'Empieza hoy,\nlidera manana', sub: 'Unete a cientos de docentes que ya transformaron su salon de clases con EduSmart AI+.' },
    2: { icon: '✏️', title: 'Tu cuenta,\ntu espacio', sub: rol === 'PROFESOR' ? 'Crea tu perfil de docente y empieza a gestionar tus cursos con inteligencia artificial.' : 'Registrate gratis y accede a tus materias, tareas y progreso desde un solo lugar.' },
    3: { icon: '🔐', title: 'Inversion que\nvale la pena', sub: 'Un mes de EduSmart AI+ cuesta menos que un libro. Cancela cuando quieras, sin compromisos.' },
  }
  const lc = leftContent[paso]

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: 'Poppins,sans-serif', background: '#0F0A1E', overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>

      {/* ── Panel izquierdo ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 48px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(145deg,#0F0A1E 0%,#1a0533 40%,#2d1065 70%,#1a0533 100%)' }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.25) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
        {[['8%','12%'],['25%','70%'],['55%','20%'],['70%','80%'],['85%','35%']].map(([l,t],i) => (
          <div key={i} style={{ position: 'absolute', left: l, top: t, color: 'rgba(167,139,250,0.3)', fontSize: [14,10,16,12,10][i], pointerEvents: 'none' }}>✦</div>
        ))}

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>🧠</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>EduSmart</span>
                <span style={{ fontWeight: 900, fontSize: 22, color: '#A78BFA' }}>AI+</span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(167,139,250,0.6)', margin: 0, fontWeight: 500 }}>Inteligencia que educa</p>
            </div>
          </div>
        </div>

        {/* Contenido central animado */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(76,29,149,0.4))', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, marginBottom: 16, boxShadow: '0 8px 32px rgba(124,58,237,0.3)' }}>{lc.icon}</div>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1.2, margin: '0 0 18px', letterSpacing: '-0.5px', whiteSpace: 'pre-line' }}>{lc.title}</h1>
          <p style={{ fontSize: 15, color: 'rgba(196,181,253,0.75)', lineHeight: 1.7, maxWidth: 360, margin: '0 0 24px' }}>{lc.sub}</p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24 }}>
            {[['500+','Docentes activos'],['10k+','Estudiantes'],['98%','Satisfaccion']].map(([n,l],i) => (
              <div key={i}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#A78BFA', margin: 0 }}>{n}</p>
                <p style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)', margin: 0, fontWeight: 500 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'rgba(167,139,250,0.35)', margin: 0, position: 'relative', zIndex: 1 }}>© 2026 EduSmart AI+</p>
      </div>

      {/* ── Panel derecho ── */}
      <div style={{ width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 40px', background: '#0F0A1E', borderLeft: '1px solid rgba(124,58,237,0.15)', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ width: '100%' }}>

          {/* Indicador pasos */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {(rol === 'PROFESOR' ? [1,2,3] : [1,2]).map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <div style={{ width: 32, height: 2, borderRadius: 999, background: paso >= s ? '#7C3AED' : 'rgba(124,58,237,0.2)' }} />}
                <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: paso > s ? '#7C3AED' : paso === s ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : 'rgba(124,58,237,0.12)', color: paso >= s ? '#fff' : 'rgba(167,139,250,0.4)', boxShadow: paso === s ? '0 0 16px rgba(124,58,237,0.6)' : 'none', transition: 'all .3s' }}>
                  {paso > s ? '✓' : s}
                </div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: '#1C1535', borderRadius: 20, border: '1px solid rgba(124,58,237,0.2)', padding: '22px 26px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>{error}</div>
            )}

            {/* PASO 1 — Rol */}
            {paso === 1 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Crea tu cuenta</h2>
                <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.65)', margin: '0 0 22px' }}>Como vas a usar EduSmart?</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { id: 'ESTUDIANTE', icon: '🎓', label: 'Estudiante', badge: 'Gratis', color: '#60A5FA' },
                    { id: 'PROFESOR',   icon: '👩🏫', label: 'Profesor',  badge: 'Desde $70k/mes', color: '#A78BFA' },
                  ].map(r => (
                    <button key={r.id} onClick={() => { setRol(r.id); setError('') }}
                      style={{ padding: '20px 16px', borderRadius: 14, border: rol === r.id ? '2px solid ' + r.color : '2px solid rgba(255,255,255,0.06)', background: rol === r.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s', boxShadow: rol === r.id ? '0 0 24px rgba(124,58,237,0.2)' : 'none' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>{r.icon}</div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: rol === r.id ? r.color : '#E5E7EB', margin: '0 0 4px' }}>{r.label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(156,163,175,0.55)', fontWeight: 600, margin: 0 }}>{r.badge}</p>
                    </button>
                  ))}
                </div>
                <button onClick={() => { if (!rol) { setError('Selecciona tu rol.'); return } setError(''); setPaso(2) }}
                  style={{ width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)', marginBottom: 16 }}>
                  Continuar →
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(156,163,175,0.55)', margin: 0 }}>
                  Ya tienes cuenta?{' '}
                  <Link to="/login" style={{ color: '#A78BFA', fontWeight: 700, textDecoration: 'none' }}>Inicia sesion</Link>
                </p>
              </div>
            )}

            {/* PASO 2 — Datos */}
            {paso === 2 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>{rol === 'ESTUDIANTE' ? 'Tu cuenta gratis' : 'Datos de tu cuenta'}</h2>
                <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.65)', margin: '0 0 20px' }}>{rol === 'PROFESOR' ? 'Plan seleccionado: ' + PLANES.find(p => p.id === plan)?.precioFmt + ' ' + PLANES.find(p => p.id === plan)?.periodo : 'Sin costo, siempre gratis'}</p>
                {rol === 'PROFESOR' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                    {PLANES.map(p => (
                      <button key={p.id} onClick={() => setPlan(p.id)}
                        style={{ padding: '12px', borderRadius: 12, border: plan === p.id ? '2px solid #7C3AED' : '2px solid rgba(124,58,237,0.15)', background: plan === p.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', position: 'relative' }}>
                        {p.popular && <span style={{ position: 'absolute', top: -8, right: 8, background: '#F8BB24', color: '#1F2937', fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999 }}>Popular</span>}
                        <p style={{ fontWeight: 900, fontSize: 15, color: plan === p.id ? '#A78BFA' : '#9CA3AF', margin: '0 0 2px' }}>{p.precioFmt}</p>
                        <p style={{ fontSize: 10, color: 'rgba(156,163,175,0.5)', margin: 0 }}>{p.periodo}</p>
                        {p.ahorro && <p style={{ fontSize: 10, color: '#34D399', margin: '2px 0 0', fontWeight: 600 }}>{p.ahorro}</p>}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div><label style={lbl}>Nombre completo</label><input value={form.nombre} onChange={upd('nombre')} placeholder="Tu nombre" style={inp} onFocus={focIn} onBlur={focOut} autoFocus /></div>
                  <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={upd('email')} placeholder="tu@email.com" style={inp} onFocus={focIn} onBlur={focOut} /></div>
                  <div><label style={lbl}>Contrasena</label><PasswordInput value={form.password} onChange={upd('password')} placeholder="Min 6 caracteres" style={inp} onFocus={focIn} onBlur={focOut} /></div>
                  <div><label style={lbl}>Confirmar contrasena</label><PasswordInput value={form.confirmar} onChange={upd('confirmar')} placeholder="Repite tu contrasena" style={inp} onFocus={focIn} onBlur={focOut} onKeyDown={e => e.key === 'Enter' && irPaso3()} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={() => { setPaso(1); setError('') }}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#D1D5DB', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Atras</button>
                  <button onClick={irPaso3} disabled={loading}
                    style={{ flex: 2, background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                    {loading ? 'Procesando...' : rol === 'ESTUDIANTE' ? 'Crear cuenta gratis' : 'Continuar al pago →'}
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 — Pago */}
            {paso === 3 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Datos de pago</h2>
                <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.65)', margin: '0 0 18px' }}>Pago seguro y encriptado 🔒</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div><label style={lbl}>Numero de tarjeta</label><input value={card.numero} onChange={e => setCard(p => ({ ...p, numero: fmtCard(e.target.value) }))} placeholder="0000 0000 0000 0000" maxLength={19} style={inp} onFocus={focIn} onBlur={focOut} autoFocus /></div>
                  <div><label style={lbl}>Nombre del titular</label><input value={card.nombre} onChange={e => setCard(p => ({ ...p, nombre: e.target.value }))} placeholder="Como aparece en la tarjeta" style={inp} onFocus={focIn} onBlur={focOut} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={lbl}>Vence (MM/AA)</label><input value={card.vence} onChange={e => setCard(p => ({ ...p, vence: fmtDate(e.target.value) }))} placeholder="MM/AA" maxLength={5} style={inp} onFocus={focIn} onBlur={focOut} /></div>
                    <div><label style={lbl}>CVV</label><input value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))} placeholder="123" maxLength={4} style={inp} onFocus={focIn} onBlur={focOut} /></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button onClick={() => { setPaso(2); setError('') }}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#D1D5DB', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px', fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Atras</button>
                  <button onClick={pagar} disabled={loading}
                    style={{ flex: 2, background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontFamily: 'Poppins,sans-serif', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                    {loading ? 'Procesando...' : 'Pagar ' + PLANES.find(p => p.id === plan)?.precioFmt}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
