import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'

const PLANES = [
  { id: 'mensual', label: 'Mensual', precioFmt: '$70.000', precio: 70000, periodo: 'por mes', desc: 'Acceso completo por 1 mes', popular: false, ahorro: null },
  { id: 'anual', label: 'Anual', precioFmt: '$700.000', precio: 700000, periodo: 'por año', desc: 'Equivale a $58.333/mes', popular: true, ahorro: 'Ahorras $140.000' },
]

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50 focus:bg-white transition-all'
const lbl = 'block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'

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

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

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
    setError('')
    setLoading(true)
    try {
      const res = await authService.register({ nombre: form.nombre, email: form.email, password: form.password, rol })
      if (rol === 'ESTUDIANTE') {
        login(res.data)
        navigate('/estudiante/dashboard')
      } else {
        setTempToken(res.data.token)
        setPaso(3)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Error al registrarse.')
    } finally { setLoading(false) }
  }


  const validarTarjeta = () => {
    const num = card.numero.replace(/\s/g, '')
    if (num.length !== 16) return 'El numero de tarjeta debe tener 16 digitos.'
    if (!/^\d+$/.test(num)) return 'El numero de tarjeta solo debe contener numeros.'
    if (!card.nombre.trim()) return 'Ingresa el nombre del titular.'
    if (card.nombre.trim().length < 3) return 'El nombre del titular es muy corto.'

    // Validar vencimiento MM/AA
    if (!/^\d{2}\/\d{2}$/.test(card.vence)) return 'Fecha de vencimiento invalida (MM/AA).'
    const [mesStr, anioStr] = card.vence.split('/')
    const mes = parseInt(mesStr)
    const anio = 2000 + parseInt(anioStr)
    if (mes < 1 || mes > 12) return 'El mes de vencimiento debe estar entre 01 y 12.'
    // Ultimo dia del mes de vencimiento
    const vencimiento = new Date(anio, mes, 0, 23, 59, 59)
    if (vencimiento < new Date()) return 'La tarjeta esta vencida.'

    if (!/^\d{3,4}$/.test(card.cvv)) return 'El CVV debe tener 3 o 4 digitos.'
    return null
  }
  const pagarMembresia = async () => {
    const errTarjeta = validarTarjeta()
    if (errTarjeta) { setError(errTarjeta); return }
    setError('')
    setLoading(true)
    try {
      const res = await authService.pagarMembresia({ tipo: plan, datosTarjeta: card }, tempToken)
      login(res.data)
      navigate('/profesor/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Error procesando pago.')
    } finally {
      setLoading(false)
    }
  }

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtDate = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }
  const pasos = rol === 'PROFESOR' ? [1, 2, 3] : [1, 2]

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#EDE7FF,#D6E8FF)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="text-center px-8 pt-8 pb-5" style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
          <div className="text-4xl mb-1">🎓</div>
          <h1 className="text-xl font-black text-white">EduSmart <span className="text-yellow-400">AI+</span></h1>
          <p className="text-purple-200 text-sm mt-1">
            {paso === 1 && 'Crea tu cuenta'}
            {paso === 2 && 'Informacion de la cuenta'}
            {paso === 3 && 'Pago de membresia'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {pasos.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className={'h-0.5 w-8 rounded ' + (paso >= s ? 'bg-white' : 'bg-purple-400/40')} />}
                <div className={'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ' + (paso >= s ? 'bg-white text-purple-700' : 'bg-purple-400/30 text-purple-200')}>
                  {paso > s ? '✓' : s}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-7 py-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm font-medium">{error}</div>}

          {paso === 1 && (
            <div className="space-y-4">
              <p className="text-gray-500 text-sm text-center">Como vas a usar EduSmart?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'ESTUDIANTE', icon: '👨‍🎓', label: 'Estudiante', badge: 'Gratis', sel: 'bg-blue-50 border-blue-400', txt: 'text-blue-700' },
                  { id: 'PROFESOR', icon: '👨‍🏫', label: 'Profesor', badge: 'Desde $70.000/mes', sub: 'Crea y gestiona tus clases', sel: 'bg-purple-50 border-purple-400', txt: 'text-purple-700' },
                ].map(r => (
                  <button key={r.id} onClick={() => { setRol(r.id); setError('') }}
                    className={'p-5 rounded-2xl border-2 text-center transition-all hover:shadow-md ' + (rol === r.id ? r.sel + ' shadow-md' : 'border-gray-200')}>
                    <div className="text-4xl mb-2">{r.icon}</div>
                    <p className={'font-bold text-sm ' + (rol === r.id ? r.txt : 'text-gray-700')}>{r.label}</p>
                    <p className={'text-xs font-semibold mt-0.5 ' + (rol === r.id ? r.txt : 'text-gray-500')}>{r.badge}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-tight">{r.sub}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => { if (!rol) { setError('Selecciona tu rol.'); return } setError(''); setPaso(2) }}
                className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm">
                Continuar
              </button>
              <p className="text-center text-xs text-gray-400">
                Ya tienes cuenta? <Link to="/login" className="text-purple-600 font-bold hover:underline">Inicia sesion</Link>
              </p>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4">
              {rol === 'ESTUDIANTE' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-green-700 font-semibold text-sm">Cuenta de estudiante completamente gratis</p>
                </div>
              )}
              {rol === 'PROFESOR' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-purple-700 font-semibold text-xs text-center mb-2">Elige tu plan ahora</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PLANES.map(p => (
                      <button key={p.id} onClick={() => setPlan(p.id)}
                        className={'p-3 rounded-xl border-2 text-center transition-all ' + (plan === p.id ? 'border-purple-500 bg-white shadow-sm' : 'border-purple-200')}>
                        <p className={'font-black text-base ' + (plan === p.id ? 'text-purple-700' : 'text-gray-500')}>{p.precioFmt}</p>
                        <p className="text-xs text-gray-400">{p.periodo}</p>
                        {p.ahorro && <p className="text-xs text-green-600 font-semibold">{p.ahorro}</p>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div><label className={lbl}>Nombre completo</label><input value={form.nombre} onChange={upd('nombre')} placeholder="Tu nombre" className={inp} autoFocus /></div>
              <div><label className={lbl}>Email</label><input type="email" value={form.email} onChange={upd('email')} placeholder="tu@email.com" className={inp} /></div>
              <div><label className={lbl}>Contrasena</label><input type="password" value={form.password} onChange={upd('password')} placeholder="Minimo 6 caracteres" className={inp} /></div>
              <div><label className={lbl}>Confirmar contrasena</label><input type="password" value={form.confirmar} onChange={upd('confirmar')} placeholder="Repite tu contrasena" className={inp} onKeyDown={e => { if (e.key === 'Enter') irPaso3() }} /></div>
              <div className="flex gap-3">
                <button onClick={() => { setPaso(1); setError('') }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50">Atras</button>
                <button onClick={irPaso3} disabled={loading} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">
                  {loading ? 'Procesando...' : rol === 'ESTUDIANTE' ? 'Crear cuenta gratis' : 'Continuar al pago'}
                </button>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Elige tu plan</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLANES.map(p => (
                    <button key={p.id} onClick={() => setPlan(p.id)}
                      className={'p-4 rounded-xl border-2 text-left transition-all relative ' + (plan === p.id ? 'border-purple-500 bg-white shadow-md' : 'border-purple-200')}>
                      {p.popular && <span className="absolute -top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">Popular</span>}
                      <p className={'font-bold text-sm ' + (plan === p.id ? 'text-purple-700' : 'text-gray-600')}>{p.label}</p>
                      <p className={'font-black text-xl ' + (plan === p.id ? 'text-purple-700' : 'text-gray-500')}>{p.precioFmt}</p>
                      <p className="text-xs text-gray-400">{p.periodo}</p>
                      {p.ahorro && <p className="text-xs text-green-600 font-semibold mt-1">{p.ahorro}</p>}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={lbl}>Numero de tarjeta</label><input value={card.numero} onChange={e => setCard(p => ({ ...p, numero: fmtCard(e.target.value) }))} placeholder="0000 0000 0000 0000" maxLength={19} className={inp} autoFocus /></div>
              <div><label className={lbl}>Nombre del titular</label><input value={card.nombre} onChange={e => setCard(p => ({ ...p, nombre: e.target.value }))} placeholder="Como aparece en la tarjeta" className={inp} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Vence (MM/AA)</label><input value={card.vence} onChange={e => setCard(p => ({ ...p, vence: fmtDate(e.target.value) }))} placeholder="MM/AA" maxLength={5} className={inp} /></div>
                <div><label className={lbl}>CVV</label><input value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="123" maxLength={4} className={inp} /></div>
              </div>
              <p className="text-xs text-gray-400 text-center">🔒 Pago seguro</p>
              <div className="flex gap-3">
                <button onClick={() => { setPaso(2); setError('') }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50">Atras</button>
                <button onClick={pagarMembresia} disabled={loading} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">
                  {loading ? 'Procesando pago...' : 'Pagar ' + PLANES.find(p => p.id === plan)?.precioFmt}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
