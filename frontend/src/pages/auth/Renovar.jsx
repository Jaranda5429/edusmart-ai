import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import fondito from '../../assets/fondito.png'

const PLANES = [
  { id: 'mensual', label: 'Mensual', precioFmt: '$70.000', periodo: 'por mes', ahorro: null, popular: false },
  { id: 'anual', label: 'Anual', precioFmt: '$700.000', periodo: 'por año', ahorro: 'Ahorras $140.000', popular: true },
]

const inp = 'w-full border border-[rgba(124,58,237,0.2)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#E5E7EB] transition-all'
const lbl = 'block text-xs font-bold text-[rgba(156,163,175,0.7)] uppercase tracking-wider mb-1.5'

export default function Renovar() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState('mensual')
  const [card, setCard] = useState({ numero: '', nombre: '', vence: '', cvv: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tempToken, setTempToken] = useState(null)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const token = sessionStorage.getItem('renovar_token')
    const user = sessionStorage.getItem('renovar_usuario')
    if (!token || !user) {
      navigate('/login')
      return
    }
    setTempToken(token)
    setUsuario(JSON.parse(user))
  }, [navigate])

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtDate = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }

  const validarTarjeta = () => {
    const num = card.numero.replace(/\s/g, '')
    if (num.length !== 16) return 'El numero de tarjeta debe tener 16 digitos.'
    if (!/^\d+$/.test(num)) return 'El numero solo debe contener numeros.'
    if (!card.nombre.trim() || card.nombre.trim().length < 3) return 'Ingresa el nombre del titular.'
    if (!/^\d{2}\/\d{2}$/.test(card.vence)) return 'Fecha de vencimiento invalida (MM/AA).'
    const [m, a] = card.vence.split('/')
    const mes = parseInt(m), anio = 2000 + parseInt(a)
    if (mes < 1 || mes > 12) return 'El mes debe estar entre 01 y 12.'
    if (new Date(anio, mes, 0, 23, 59, 59) < new Date()) return 'La tarjeta esta vencida.'
    if (!/^\d{3,4}$/.test(card.cvv)) return 'El CVV debe tener 3 o 4 digitos.'
    return null
  }

  const renovar = async () => {
    const err = validarTarjeta()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    try {
      const res = await authService.renovarMembresia({ tipo: plan, datosTarjeta: card }, tempToken)
      sessionStorage.removeItem('renovar_token')
      sessionStorage.removeItem('renovar_usuario')
      login(res.data)
      navigate('/profesor/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Error procesando la renovacion.')
    } finally {
      setLoading(false)
    }
  }

  const fmt = iso => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 -z-10" style={{
        backgroundImage: `url(${fondito})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        filter: 'blur(3px)',
        transform: 'scale(1.1)'
      }} />
      <div className="fixed inset-0 -z-10 bg-[rgba(28,21,53,0.4)]" />
      <div style={{ background: "#1C1535", borderRadius: 20, border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }} className=" w-full max-w-md overflow-hidden">

        <div className="text-center px-8 pt-8 pb-5" style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
          <div className="text-4xl mb-1">🔄</div>
          <h1 className="text-xl font-black text-white">Renovar Membresia</h1>
          <p className="text-purple-200 text-sm mt-1">{usuario?.nombre ? 'Hola ' + usuario.nombre.split(' ')[0] : ''}</p>
        </div>

        <div className="px-7 py-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
            <p className="text-orange-700 text-sm font-semibold">⚠️ Tu membresia vencio</p>
            {usuario?.membresiaVence && <p className="text-orange-500 text-xs mt-0.5">Venció el {fmt(usuario.membresiaVence)}</p>}
            <p className="text-orange-400 text-xs mt-1">Renueva para seguir usando la plataforma</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm font-medium">{error}</div>}

          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
            <p className="text-xs font-bold text-[rgba(156,163,175,0.7)] uppercase tracking-wider mb-3">Elige tu plan</p>
            <div className="grid grid-cols-2 gap-2">
              {PLANES.map(p => (
                <button key={p.id} onClick={() => setPlan(p.id)}
                  className={'p-4 rounded-xl border-2 text-left transition-all relative ' + (plan === p.id ? 'border-purple-500 bg-[rgba(124,58,237,0.15)]' : 'border-purple-200')}>
                  {p.popular && <span className="absolute -top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">Popular</span>}
                  <p className={'font-bold text-sm ' + (plan === p.id ? 'text-purple-700' : 'text-[#9CA3AF]')}>{p.label}</p>
                  <p className={'font-black text-xl ' + (plan === p.id ? 'text-purple-700' : 'text-[rgba(156,163,175,0.7)]')}>{p.precioFmt}</p>
                  <p className="text-xs text-[rgba(156,163,175,0.5)]">{p.periodo}</p>
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
          <p className="text-xs text-[rgba(156,163,175,0.5)] text-center">🔒 Pago seguro simulado</p>

          <div className="flex gap-3">
            <button onClick={() => { sessionStorage.removeItem('renovar_token'); sessionStorage.removeItem('renovar_usuario'); navigate('/login') }}
              className="flex-1 border border-[rgba(124,58,237,0.2)] text-[#9CA3AF] py-3 rounded-xl font-semibold text-sm hover:bg-[rgba(124,58,237,0.1)]">Cancelar</button>
            <button onClick={renovar} disabled={loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 shadow-md text-sm disabled:opacity-40">
              {loading ? 'Procesando...' : 'Renovar ' + PLANES.find(p => p.id === plan)?.precioFmt}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}