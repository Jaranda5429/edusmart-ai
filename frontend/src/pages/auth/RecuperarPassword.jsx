import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import PasswordInput from '../../components/common/PasswordInput'

export default function RecuperarPassword() {
  const [paso, setPaso] = useState(1)
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(124,58,237,0.25)', borderRadius: 14,
    padding: '14px 18px', fontFamily: 'Poppins,sans-serif',
    fontSize: 14, color: '#E5E7EB', outline: 'none',
    transition: 'all .15s', boxSizing: 'border-box'
  }

  const focusIn = e => { e.target.style.borderColor = '#7C3AED'; e.target.style.background = 'rgba(124,58,237,0.08)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)' }
  const focusOut = e => { e.target.style.borderColor = 'rgba(124,58,237,0.25)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none' }

  const handleEnviarCodigo = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setInfo('Te enviamos un codigo a tu correo')
      setPaso(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Error enviando el codigo')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificarCodigo = async (e) => {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await authService.verifyResetCode({ email, codigo })
      setPaso(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Codigo invalido')
    } finally {
      setLoading(false)
    }
  }

  const handleRestablecer = async (e) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (nueva.length < 6) return setError('La nueva contrasena debe tener al menos 6 caracteres')
    if (nueva !== confirmar) return setError('Las contrasenas no coinciden')
    setLoading(true)
    try {
      await authService.resetPassword({ email, codigo, nueva })
      setInfo('Contrasena restablecida correctamente')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Error restableciendo la contrasena')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins,sans-serif', background: '#0F0A1E', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#7C3AED,#4C1D95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 6px 18px rgba(124,58,237,0.5)' }}>🧠</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontWeight: 900, fontSize: 19, color: '#fff' }}>EduSmart</span>
              <span style={{ fontWeight: 900, fontSize: 19, color: '#A78BFA' }}>AI+</span>
            </div>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Recuperar contrasena</h2>
          <p style={{ fontSize: 14, color: 'rgba(156,163,175,0.7)', margin: 0 }}>
            {paso === 1 && 'Ingresa tu correo registrado'}
            {paso === 2 && 'Ingresa el codigo que enviamos a tu correo'}
            {paso === 3 && 'Crea tu nueva contrasena'}
          </p>
        </div>

        <div style={{ background: '#1C1535', borderRadius: 20, border: '1px solid rgba(124,58,237,0.2)', padding: '24px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#34D399', fontSize: 13, fontWeight: 600 }}>
              {info}
            </div>
          )}

          {paso === 1 && (
            <form onSubmit={handleEnviarCodigo}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                  Correo electronico
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  style={inp} required autoFocus
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.45)', transition: 'all .15s', letterSpacing: 0.3 }}>
                {loading ? 'Enviando...' : 'Enviar codigo →'}
              </button>
            </form>
          )}

          {paso === 2 && (
            <form onSubmit={handleVerificarCodigo}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                  Codigo de verificacion
                </label>
                <input
                  type="text" value={codigo} inputMode="numeric" maxLength={6}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  style={{ ...inp, textAlign: 'center', fontSize: 24, fontWeight: 800, letterSpacing: 8 }} required autoFocus
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.45)', transition: 'all .15s', letterSpacing: 0.3, marginBottom: 12 }}>
                {loading ? 'Verificando...' : 'Verificar codigo →'}
              </button>
              <button type="button" onClick={() => { setPaso(1); setError(''); setInfo(''); setCodigo('') }}
                style={{ width: '100%', background: 'none', border: 'none', color: '#A78BFA', fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '6px' }}>
                ← Usar otro correo
              </button>
            </form>
          )}

          {paso === 3 && (
            <form onSubmit={handleRestablecer}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                  Nueva contrasena
                </label>
                <PasswordInput
                  value={nueva}
                  onChange={e => setNueva(e.target.value)}
                  placeholder="••••••••"
                  style={inp} required autoFocus
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(167,139,250,0.8)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                  Confirmar contrasena
                </label>
                <PasswordInput
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  style={inp} required
                  onFocus={focusIn} onBlur={focusOut}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontFamily: 'Poppins,sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.45)', transition: 'all .15s', letterSpacing: 0.3 }}>
                {loading ? 'Guardando...' : 'Restablecer contrasena →'}
              </button>
            </form>
          )}

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(124,58,237,0.12)', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(156,163,175,0.6)', margin: 0 }}>
              <Link to="/login" style={{ color: '#A78BFA', fontWeight: 700, textDecoration: 'none' }}>← Volver a iniciar sesion</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
