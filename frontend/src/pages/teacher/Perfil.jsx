import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '👨‍🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
]

export default function TeacherPerfil() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  // Estado de membresia
  const fmtFecha = iso => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
  const calcEstado = () => {
    if (!usuario?.membresiaVence) return { txt: 'Sin membresia', color: 'gray', cls: 'bg-gray-100 text-gray-600 border-gray-200' }
    const ahora = new Date()
    const vence = new Date(usuario.membresiaVence)
    const finGracia = new Date(vence); finGracia.setDate(finGracia.getDate() + 3)
    if (ahora <= vence) return { txt: 'Activa', color: 'green', cls: 'bg-green-100 text-green-700 border-green-200' }
    if (ahora <= finGracia) return { txt: 'En periodo de gracia', color: 'orange', cls: 'bg-orange-100 text-orange-700 border-orange-200' }
    return { txt: 'Vencida', color: 'red', cls: 'bg-red-100 text-red-600 border-red-200' }
  }
  const estadoMemb = calcEstado()

  const irARenovar = () => {
    const token = localStorage.getItem('token')
    sessionStorage.setItem('renovar_token', token)
    sessionStorage.setItem('renovar_usuario', JSON.stringify(usuario))
    navigate('/renovar')
  }
  const [editando, setEditando] = useState(false)
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [showCambiarPass, setShowCambiarPass] = useState(false)
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' })
  const [passMsg, setPassMsg] = useState(null)
  const fileRef = useRef(null)

  const [perfil, setPerfil] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    documento: '',
    telefono: '',
    especialidad: '',
    institucion: '',
    ciudad: '',
    bio: '',
  })

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    const reader = new FileReader()
    reader.onloadend = () => setFotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleGuardar = () => {
    setEditando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

const handleCambiarPass = async () => {
    if (!passData.actual) { setPassMsg({ ok: false, msg: 'Ingresa tu contraseña actual' }); return }
    if (passData.nueva.length < 6) { setPassMsg({ ok: false, msg: 'La nueva contraseña debe tener al menos 6 caracteres' }); return }
    if (passData.nueva !== passData.confirmar) { setPassMsg({ ok: false, msg: 'Las contraseñas no coinciden' }); return }
    try {
      await authService.cambiarPassword({ actual: passData.actual, nueva: passData.nueva })
      setPassMsg({ ok: true, msg: '✅ Contraseña actualizada correctamente' })
      setPassData({ actual: '', nueva: '', confirmar: '' })
      setTimeout(() => { setPassMsg(null); setShowCambiarPass(false) }, 2500)
    } catch (err) {
      setPassMsg({ ok: false, msg: err.response?.data?.message || 'Error al cambiar la contraseña' })
    }
  }

  const campos = [
    { key: 'nombre', label: 'Nombre completo', icon: '👤', type: 'text', placeholder: 'Tu nombre completo' },
    { key: 'email', label: 'Correo electrónico', icon: '📧', type: 'email', placeholder: 'tu@email.com' },
    { key: 'documento', label: 'Número de documento', icon: '🪪', type: 'text', placeholder: 'Ej: 1234567890' },
    { key: 'telefono', label: 'Teléfono / Celular', icon: '📱', type: 'tel', placeholder: 'Ej: 3001234567' },
    { key: 'especialidad', label: 'Especialidad / Área', icon: '🎓', type: 'text', placeholder: 'Ej: Matemáticas, Lenguaje...' },
    { key: 'institucion', label: 'Institución educativa', icon: '🏫', type: 'text', placeholder: 'Nombre de tu institución' },
    { key: 'ciudad', label: 'Ciudad', icon: '📍', type: 'text', placeholder: 'Tu ciudad' },
  ]

  const gradient = 'linear-gradient(135deg,#4C1D95,#7C3AED)'

  return (
    <Layout rol="PROFESOR" navItems={NAV}>
      <div className="max-w-3xl mx-auto px-5 py-7 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Mi Perfil 👤</h2>
            <p className="text-gray-400 text-sm mt-0.5">Gestiona tu información personal y configuración</p>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm flex items-center gap-2 shadow-md hover:shadow-lg">
              ✏️ Editar perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm">
                Cancelar
              </button>
              <button onClick={handleGuardar} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm shadow-md">
                💾 Guardar cambios
              </button>
            </div>
          )}
        </div>

        {guardado && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 font-semibold text-sm flex items-center gap-2">
            ✅ Perfil actualizado correctamente
          </div>
        )}

        {/* Avatar + info básica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Foto */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Foto perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-4xl" style={{ background: gradient }}>
                    {perfil.nombre?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all hover:scale-110 text-base"
                title="Cambiar foto"
              >
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black text-gray-900 leading-tight">{perfil.nombre || 'Sin nombre'}</h3>
              <p className="text-gray-400 text-sm mt-0.5">{perfil.email}</p>
              {perfil.especialidad && <p className="text-gray-500 text-sm mt-1">🎓 {perfil.especialidad}</p>}
              {perfil.institucion && <p className="text-gray-500 text-sm">🏫 {perfil.institucion}</p>}
              {perfil.ciudad && <p className="text-gray-500 text-sm">📍 {perfil.ciudad}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold border border-purple-200">👨‍🏫 Profesor</span>
                {perfil.especialidad && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold border border-blue-200">{perfil.especialidad}</span>
                )}
              </div>
              {editando && (
                <button onClick={() => fileRef.current?.click()} className="mt-3 text-xs text-purple-600 hover:underline font-semibold flex items-center gap-1">
                  📷 Cambiar foto de perfil
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📝 Biografía / Descripción</label>
            {editando ? (
              <textarea
                value={perfil.bio}
                onChange={e => setPerfil(p => ({ ...p, bio: e.target.value }))}
                placeholder="Cuéntanos un poco sobre ti, tu experiencia docente..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition-all"
              />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {perfil.bio || <span className="text-gray-400 italic">Sin descripción aún. Haz clic en "Editar perfil" para agregar una.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Datos personales */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="font-bold text-gray-800">Información personal</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {campos.map(campo => (
              <div key={campo.key} className={campo.key === 'bio' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>{campo.icon}</span>{campo.label}
                </label>
                {editando ? (
                  <input
                    type={campo.type}
                    value={perfil[campo.key]}
                    onChange={e => setPerfil(p => ({ ...p, [campo.key]: e.target.value }))}
                    placeholder={campo.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-gray-50 focus:bg-white"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 border border-gray-100 min-h-[44px] flex items-center">
                    {perfil[campo.key] || <span className="text-gray-400 italic">No especificado</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <span className="text-lg">🔒</span>
            {/* Membresía */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="font-bold text-gray-800">Mi Membresía</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-700">Estado:</span>
                  <span className={'text-xs px-3 py-1 rounded-full font-semibold border ' + estadoMemb.cls}>{estadoMemb.txt}</span>
                </div>
                <p className="text-gray-400 text-sm">
                  {usuario?.membresiaTipo ? ('Plan ' + usuario.membresiaTipo + ' · ') : ''}
                  {estadoMemb.color === 'green' ? 'Vence el ' : 'Venció el '}{fmtFecha(usuario?.membresiaVence)}
                </p>
              </div>
              {estadoMemb.color !== 'green' && (
                <button onClick={irARenovar}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 shadow-md transition-all whitespace-nowrap">
                  🔄 Renovar membresía
                </button>
              )}
            </div>

            {estadoMemb.color === 'orange' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-700 text-sm">
                ⚠️ Tu membresía venció pero estás en periodo de gracia. Renueva pronto para no perder el acceso.
              </div>
            )}
            {estadoMemb.color === 'green' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
                ✅ Tu membresía está activa. ¡Disfruta todas las funciones de EduSmart AI+!
              </div>
            )}
          </div>
        </div>
            <h3 className="font-bold text-gray-800">Seguridad</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800 text-sm">Contraseña</p>
                <p className="text-gray-400 text-xs mt-0.5">Última actualización: No registrada</p>
              </div>
              <button
                onClick={() => setShowCambiarPass(p => !p)}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm"
              >
                🔑 Cambiar
              </button>
            </div>

            {showCambiarPass && (
              <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 space-y-4">
                <h4 className="font-bold text-purple-800 text-sm">Cambiar contraseña</h4>
                {[
                  { key: 'actual', label: 'Contraseña actual', placeholder: '••••••••' },
                  { key: 'nueva', label: 'Nueva contraseña', placeholder: '••••••••' },
                  { key: 'confirmar', label: 'Confirmar nueva contraseña', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-purple-700 mb-1 block">{f.label}</label>
                    <input
                      type="password"
                      value={passData[f.key]}
                      onChange={e => setPassData(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all"
                    />
                  </div>
                ))}
                {passMsg && (
                  <div className={`rounded-xl p-3 text-sm font-semibold ${passMsg.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {passMsg.msg}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setShowCambiarPass(false); setPassData({ actual: '', nueva: '', confirmar: '' }); setPassMsg(null) }}
                    className="flex-1 border border-purple-200 text-purple-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-100 transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleCambiarPass}
                    className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all shadow-md">
                    Actualizar contraseña
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  )
}
