import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'
import PasswordInput from '../../components/common/PasswordInput'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/profesor/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/profesor/cursos' },
  { icon: '🎓', label: 'Estudiantes', path: '/profesor/estudiantes' },
  { icon: '📊', label: 'Analíticas', path: '/profesor/analiticas' },
]

export default function TeacherPerfil() {
  const { usuario } = useAuth()
  const navigate = useNavigate()

  // Estado de membresia
  const fmtFecha = iso => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
  const calcEstado = () => {
    if (!usuario?.membresiaVence) return { txt: 'Sin membresia', color: 'gray', cls: 'bg-white/5 text-[#9CA3AF] border-purple-900/30' }
    const ahora = new Date()
    const vence = new Date(usuario.membresiaVence)
    const finGracia = new Date(vence); finGracia.setDate(finGracia.getDate() + 3)
    if (ahora <= vence) return { txt: 'Activa', color: 'green', cls: 'bg-[rgba(16,185,129,0.15)] text-[#34D399] border-[rgba(16,185,129,0.3)]' }
    if (ahora <= finGracia) return { txt: 'En periodo de gracia', color: 'orange', cls: 'bg-[rgba(245,158,11,0.15)] text-[#FBBF24] border-[rgba(245,158,11,0.3)]' }
    return { txt: 'Vencida', color: 'red', cls: 'bg-[rgba(239,68,68,0.15)] text-[#F87171] border-[rgba(239,68,68,0.3)]' }
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#059669,#34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px rgba(5,150,105,0.4)", flexShrink: 0 }}>👤</div>
            <h2 className="text-2xl font-black text-[#F3F4F6]">Mi Perfil 👤</h2>
            <p style={{ color: "#E5E7EB" }} className=" text-base mt-0.5">Gestiona tu información personal y configuración</p>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm flex items-center gap-2 shadow-md hover:shadow-lg">
              ✏️ Editar perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)} className="border border-purple-900/30 text-[#9CA3AF] px-5 py-2.5 rounded-xl font-semibold hover:bg-[rgba(255,255,255,0.08)]/5 transition-all text-sm">
                Cancelar
              </button>
              <button onClick={handleGuardar} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm shadow-md">
                💾 Guardar cambios
              </button>
            </div>
          )}
        </div>

        {guardado && (
          <div style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 14, padding: "14px 18px", color: "#34D399", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            ✅ Perfil actualizado correctamente
          </div>
        )}

        {/* Avatar + info básica */}
        <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)" }} className=" shadow-sm border border-[rgba(124,58,237,0.15)] p-7">
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
              <h3 className="text-2xl font-black text-[#F3F4F6] leading-tight">{perfil.nombre || 'Sin nombre'}</h3>
              <p style={{ color: "rgba(156,163,175,0.5)" }} className=" text-sm mt-0.5">{perfil.email}</p>
              {perfil.especialidad && <p style={{ color: "rgba(156,163,175,0.6)" }} className=" text-sm mt-1">🎓 {perfil.especialidad}</p>}
              {perfil.institucion && <p style={{ color: "rgba(156,163,175,0.6)" }} className=" text-sm">🏫 {perfil.institucion}</p>}
              {perfil.ciudad && <p style={{ color: "rgba(156,163,175,0.6)" }} className=" text-sm">📍 {perfil.ciudad}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <span style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA", fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(124,58,237,0.3)" }}>👨🏫 Profesor</span>
                {perfil.especialidad && (
                  <span style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA", fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(59,130,246,0.25)" }}>{perfil.especialidad}</span>
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
          <div className="mt-5 pt-5 border-t border-[rgba(124,58,237,0.15)]">
            <label className="text-sm font-semibold text-[#D1D5DB] mb-1.5 block">📝 Biografía / Descripción</label>
            {editando ? (
              <textarea
                value={perfil.bio}
                onChange={e => setPerfil(p => ({ ...p, bio: e.target.value }))}
                placeholder="Cuéntanos un poco sobre ti, tu experiencia docente..."
                rows={3}
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#E5E7EB", outline: "none", resize: "none", fontFamily: "Poppins,sans-serif", boxSizing: "border-box" }}
              />
            ) : (
              <p className="text-sm text-[#9CA3AF] leading-relaxed">
                {perfil.bio || <span style={{ color: "rgba(156,163,175,0.5)" }} className=" italic">Sin descripción aún. Haz clic en "Editar perfil" para agregar una.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Datos personales */}
        <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)" }} className=" shadow-sm border border-[rgba(124,58,237,0.15)] overflow-hidden">
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(124,58,237,0.15)", background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="text-lg">📋</span>
            <h3 className="font-bold text-[#E5E7EB]">Información personal</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {campos.map(campo => (
              <div key={campo.key} className={campo.key === 'bio' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-bold text-[rgba(156,163,175,0.7)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>{campo.icon}</span>{campo.label}
                </label>
                {editando ? (
                  <input
                    type={campo.type}
                    value={perfil[campo.key]}
                    onChange={e => setPerfil(p => ({ ...p, [campo.key]: e.target.value }))}
                    placeholder={campo.placeholder}
                    style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#E5E7EB", outline: "none", fontFamily: "Poppins,sans-serif", boxSizing: "border-box" }}
                  />
                ) : (
                  <div className="bg-white/5 rounded-xl px-4 py-3 text-sm text-[#D1D5DB] border border-[rgba(124,58,237,0.15)] min-h-[44px] flex items-center">
                    {perfil[campo.key] || <span style={{ color: "rgba(156,163,175,0.5)" }} className=" italic">No especificado</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seguridad */}
        <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)" }} className=" shadow-sm border border-[rgba(124,58,237,0.15)] overflow-hidden">
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(124,58,237,0.15)", background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="text-lg">🔒</span>
            {/* Membresía */}
        <div style={{ background: "#1C1535", borderRadius: 16, border: "1px solid rgba(124,58,237,0.2)" }} className=" shadow-sm border border-[rgba(124,58,237,0.15)] overflow-hidden">
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(124,58,237,0.15)", background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="text-lg">💳</span>
            <h3 className="font-bold text-[#E5E7EB]">Mi Membresía</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#D1D5DB]">Estado:</span>
                  <span className={'text-xs px-3 py-1 rounded-full font-semibold border ' + estadoMemb.cls}>{estadoMemb.txt}</span>
                </div>
                <p style={{ color: "rgba(156,163,175,0.5)" }} className=" text-sm">
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
              <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 14px", color: "#FBBF24", fontSize: 13 }}>
                ⚠️ Tu membresía venció pero estás en periodo de gracia. Renueva pronto para no perder el acceso.
              </div>
            )}
            {estadoMemb.color === 'green' && (
              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "12px 14px", color: "#34D399", fontSize: 13 }}>
                ✅ Tu membresía está activa. ¡Disfruta todas las funciones de EduSmart AI+!
              </div>
            )}
          </div>
        </div>
            <h3 className="font-bold text-[#E5E7EB]">Seguridad</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-purple-900/30">
              <div>
                <p className="font-semibold text-[#E5E7EB] text-sm">Contraseña</p>
                <p style={{ color: "rgba(156,163,175,0.5)" }} className=" text-xs mt-0.5">Última actualización: No registrada</p>
              </div>
              <button
                onClick={() => setShowCambiarPass(p => !p)}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm"
              >
                🔑 Cambiar
              </button>
            </div>

            {showCambiarPass && (
              <div style={{ background: "rgba(124,58,237,0.1)", borderRadius: 16, padding: 20, border: "1px solid rgba(124,58,237,0.3)", display: "flex", flexDirection: "column", gap: 16 }}>
                <h4 style={{ fontWeight: 700, color: "#A78BFA", fontSize: 14 }}>Cambiar contraseña</h4>
                {[
                  { key: 'actual', label: 'Contraseña actual', placeholder: '••••••••' },
                  { key: 'nueva', label: 'Nueva contraseña', placeholder: '••••••••' },
                  { key: 'confirmar', label: 'Confirmar nueva contraseña', placeholder: '••••••••' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.8)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" }}>{f.label}</label>
                    <PasswordInput
                      value={passData[f.key]}
                      onChange={e => setPassData(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(124,58,237,0.3)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#E5E7EB", outline: "none", fontFamily: "Poppins,sans-serif", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                {passMsg && (
                  <div className={passMsg.ok ? "rounded-xl p-3 text-sm font-semibold bg-[rgba(16,185,129,0.12)] text-[#34D399] border border-[rgba(16,185,129,0.3)]" : "rounded-xl p-3 text-sm font-semibold bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.3)]"}>
                    {passMsg.msg}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setShowCambiarPass(false); setPassData({ actual: '', nueva: '', confirmar: '' }); setPassMsg(null) }}
                    style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#D1D5DB", padding: "10px", borderRadius: 12, fontFamily: "Poppins,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
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
