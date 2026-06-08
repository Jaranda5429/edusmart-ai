import { createContext, useContext, useState, useEffect } from 'react'
import { adminService } from '../services/api'
import { useAuth } from './AuthContext'

const AdminContext = createContext()
export const useAdmin = () => useContext(AdminContext)

export const AdminProvider = ({ children }) => {
  const { usuario } = useAuth()
  const [profesores, setProfesores] = useState([])
  const [estudiantesLista, setEstudiantes] = useState([])
  const [pagos, setPagos] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)

 const cargarDatos = async () => {
  try {
    setLoading(true)
    const [profRes, estRes, pagosRes, statsRes] = await Promise.all([
      adminService.getProfesores(),
      adminService.getEstudiantes(),
      adminService.getPagos(),
      adminService.getStats(),
    ])
    setProfesores(profRes.data || [])
    setEstudiantes(estRes.data || [])
    setPagos(pagosRes.data || [])
    setStats(statsRes.data || {})
  } catch (err) {
    console.error('Error cargando datos admin:', err)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
  const token = localStorage.getItem('token')
  const userLS = localStorage.getItem('usuario')
  if (token && userLS) {
    const u = JSON.parse(userLS)
    if (u.rol === 'ADMIN') cargarDatos()
  }
}, [usuario])

  const toggleUsuario = async (id) => {
    try {
      await adminService.toggleUsuario(id)
      await cargarDatos()
    } catch (err) {
      console.error('Error toggling usuario:', err)
    }
  }

  const eliminarUsuario = async (id) => {
    try {
      await adminService.eliminarUsuario(id)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando usuario:', err)
    }
  }

  const renovarMembresia = async (id, tipo) => {
    try {
      await adminService.renovarMembresia(id, tipo)
      await cargarDatos()
    } catch (err) {
      console.error('Error renovando membresia:', err)
    }
  }

  const registrarUsuario = () => {}
  const loginUsuario = () => {}
  const procesarPago = () => {}

  const ingresoTotal = stats.ingresoTotal || 0
  const profesoresActivos = stats.profesoresActivos || 0
  const usuarios = [...profesores, ...estudiantesLista]

  return (
    <AdminContext.Provider value={{
      usuarios, pagos, profesores, estudiantesLista,
      ingresoTotal, profesoresActivos, stats, loading,
      cargarDatos, toggleUsuario, eliminarUsuario, renovarMembresia,
      registrarUsuario, loginUsuario, procesarPago,
    }}>
      {children}
    </AdminContext.Provider>
  )
}