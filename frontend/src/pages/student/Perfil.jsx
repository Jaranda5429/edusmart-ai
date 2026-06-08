import { useState, useRef } from 'react'
import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
]

export default function StudentPerfil() {
  const { usuario } = useAuth()
  const [editando, setEditando] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [passData, setPassData] = useState({ actual: '', nueva: '', confirmar: '' })
  const [passMsg, setPassMsg] = useState(null)
  const fileRef = useRef(null)

  const [perfil, setPerfil] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    documento: '',
    telefono: '',
    grado: '',
    fechaNacimiento: '',
    ciudad: '',
    nombreAcudiente: '',
    celularAcudiente: '',
    emailAcudiente: '',
    bio: '',
  })

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
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
    if (!passData.actual) { setPassMsg({ ok: false, msg: 'Ingresa tu contrasena actual' }); return }
    if (passData.nueva.length < 6) { setPassMsg({ ok: false, msg: 'La nueva contrasena debe tener al menos 6 caracteres' }); return }
    if (passData.nueva !== passData.confirmar) { setPassMsg({ ok: false, msg: 'Las contrasenas no coinciden' }); return }
    try {
      await authService.cambiarPassword({ actual: passData.actual, nueva: passData.nueva })
      setPassMsg({ ok: true, msg: 'Contrasena actualizada correctamente' })
      setPassData({ actual: '', nueva: '', confirmar: '' })
      setTimeout(() => { setPassMsg(null); setShowPass(false) }, 2500)
    } catch (err) {
      setPassMsg({ ok: false, msg: err.response?.data?.message || 'Error al cambiar la contrasena' })
    }
  }
  const camposPersonales = [
    { key: 'nombre', label: 'Nombre completo', icon: '👤', type: 'text', ph: 'Tu nombre completo' },
    { key: 'email', label: 'Correo electronico', icon: '📧', type: 'email', ph: 'tu@email.com' },
    { key: 'documento', label: 'Numero de documento', icon: '🪪', type: 'text', ph: 'Ej: 1234567890' },
    { key: 'telefono', label: 'Telefono / Celular', icon: '📱', type: 'tel', ph: 'Ej: 3001234567' },
    { key: 'grado', label: 'Grado escolar', icon: '🎒', type: 'text', ph: 'Ej: Grado 8' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', icon: '🎂', type: 'date', ph: '' },
    { key: 'ciudad', label: 'Ciudad', icon: '📍', type: 'text', ph: 'Tu ciudad' },
  ]

  const camposAcudiente = [
    { key: 'nombreAcudiente', label: 'Nombre del acudiente', icon: '👨‍👩‍👦', type: 'text', ph: 'Nombre completo' },
    { key: 'celularAcudiente', label: 'Celular del acudiente', icon: '📞', type: 'tel', ph: 'Ej: 3001234567' },
    { key: 'emailAcudiente', label: 'Email del acudiente', icon: '📧', type: 'email', ph: 'acudiente@email.com' },
  ]

  const inpCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all bg-gray-50 focus:bg-white'
  const valCls = 'bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 border border-gray-100 min-h-[44px] flex items-center'

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-3xl mx-auto px-5 py-7 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Mi Perfil 👤</h2>
            <p className="text-gray-400 text-sm mt-0.5">Tu informacion personal y academica</p>
          </div>
          {!editando ? (
            <button onClick={() => setEditando(true)}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm shadow-md flex items-center gap-2">
              Editar perfil
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditando(false)}
                className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm">
                Cancelar
              </button>
              <button onClick={handleGuardar}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all text-sm shadow-md">
                Guardar cambios
              </button>
            </div>
          )}
        </div>

        {guardado && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 font-semibold text-sm">
            Perfil actualizado correctamente
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-4xl"
                    style={{ background: 'linear-gradient(135deg,#4C1D95,#7C3AED)' }}>
                    {perfil.nombre?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <button onClick={() => fileRef.current && fileRef.current.click()}
                className="absolute -bottom-2 -right-2 w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all hover:scale-110 text-base">
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black text-gray-900">{perfil.nombre || 'Sin nombre'}</h3>
              <p className="text-gray-400 text-sm mt-0.5">{perfil.email}</p>
              {perfil.grado && <p className="text-gray-500 text-sm mt-1">{'🎒 ' + perfil.grado}</p>}
              {perfil.ciudad && <p className="text-gray-500 text-sm">{'📍 ' + perfil.ciudad}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold border border-purple-200">Estudiante</span>
                {perfil.grado && <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold border border-green-200">{perfil.grado}</span>}
              </div>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Acerca de mi</label>
            {editando ? (
              <textarea value={perfil.bio} onChange={e => setPerfil(p => ({ ...p, bio: e.target.value }))}
                placeholder="Cuentanos algo sobre ti..." rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none transition-all" />
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {perfil.bio || 'Sin descripcion. Haz clic en Editar perfil para agregar una.'}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="font-bold text-gray-800">Informacion personal</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {camposPersonales.map(campo => (
              <div key={campo.key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>{campo.icon}</span>{campo.label}
                </label>
                {editando ? (
                  <input type={campo.type} value={perfil[campo.key]}
                    onChange={e => setPerfil(p => ({ ...p, [campo.key]: e.target.value }))}
                    placeholder={campo.ph} className={inpCls} />
                ) : (
                  <div className={valCls}>
                    {perfil[campo.key] || 'No especificado'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <span className="text-lg">👨‍👩‍👦</span>
            <h3 className="font-bold text-gray-800">Informacion del acudiente</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {camposAcudiente.map(campo => (
              <div key={campo.key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>{campo.icon}</span>{campo.label}
                </label>
                {editando ? (
                  <input type={campo.type} value={perfil[campo.key]}
                    onChange={e => setPerfil(p => ({ ...p, [campo.key]: e.target.value }))}
                    placeholder={campo.ph} className={inpCls} />
                ) : (
                  <div className={valCls}>
                    {perfil[campo.key] || 'No especificado'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <h3 className="font-bold text-gray-800">Seguridad</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <p className="font-semibold text-gray-800 text-sm">Contrasena</p>
                <p className="text-gray-400 text-xs mt-0.5">Ultima actualizacion: No registrada</p>
              </div>
              <button onClick={() => setShowPass(p => !p)}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all shadow-sm">
                Cambiar
              </button>
            </div>
            {showPass && (
              <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 space-y-4">
                <h4 className="font-bold text-purple-800 text-sm">Cambiar contrasena</h4>
                {[
                  { key: 'actual', label: 'Contrasena actual' },
                  { key: 'nueva', label: 'Nueva contrasena' },
                  { key: 'confirmar', label: 'Confirmar nueva contrasena' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-purple-700 mb-1 block">{f.label}</label>
                    <input type="password" value={passData[f.key]}
                      onChange={e => setPassData(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full border border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition-all" />
                  </div>
                ))}
                {passMsg && (
                  <div className={'rounded-xl p-3 text-sm font-semibold ' + (passMsg.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                    {passMsg.msg}
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => { setShowPass(false); setPassData({ actual: '', nueva: '', confirmar: '' }); setPassMsg(null) }}
                    className="flex-1 border border-purple-200 text-purple-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-100 transition-all">
                    Cancelar
                  </button>
                  <button onClick={handleCambiarPass}
                    className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-all shadow-md">
                    Actualizar
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
